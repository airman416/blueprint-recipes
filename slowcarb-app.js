// Slow Carb Recipes — slowcarb-app.js

function fmtMacro(val) {
  if (!val) return '—';
  return String(val).replace(/~/, '').trim();
}

function macroLabel(key) {
  return { calories: 'Cal', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', fiber: 'Fiber' }[key] || key;
}

function macroUnit(key, val) {
  if (key === 'calories') return '';
  const v = String(val);
  return v.endsWith('g') ? '' : 'g';
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function renderCard(r) {
  const img = r.image
    ? `<img src="images/${r.image}" alt="${r.title}" loading="lazy">`
    : `<div class="card-img-placeholder">🥗</div>`;

  const macroBadges = ['calories', 'protein', 'carbs', 'fat', 'fiber']
    .filter(k => r.macros && r.macros[k])
    .map(k => {
      const v = fmtMacro(r.macros[k]);
      const u = macroUnit(k, r.macros[k]);
      return `<span class="macro-badge"><span class="macro-label">${macroLabel(k)}</span><span class="macro-val">${v}${u}</span></span>`;
    }).join('');

  // Tag badges
  const tagBadges = (r.tags || []).slice(0, 3)
    .map(t => `<span class="macro-badge" style="background:#f0fdf4;color:#06402B;border:1px solid #bbf7d0;">${t}</span>`)
    .join('');

  return `
<a class="card" href="slowcarb-recipe.html?id=${r.id}" aria-label="${r.title}">
  <span class="card-arrow">→</span>
  <div class="card-img">
    ${img}
    <span class="card-tag">${r.category || 'Slow Carb'}</span>
  </div>
  <div class="card-body">
    ${r.meal ? `<p class="card-meal">${capitalize(r.meal)}</p>` : ''}
    <h2 class="card-title">${r.title}</h2>
    ${r.tagline ? `<p class="card-tagline">${r.tagline}</p>` : ''}
    <div class="macros">${macroBadges}</div>
    ${tagBadges ? `<div class="macros" style="margin-top:0.35rem;">${tagBadges}</div>` : ''}
  </div>
  <div class="card-footer">
    <span class="cta">View Recipe →</span>
  </div>
</a>`;
}

function renderDetail(r) {
  const img = r.image
    ? `<img class="detail-hero-img" src="images/${r.image}" alt="${r.title}">`
    : '';

  const macroCells = ['calories', 'protein', 'carbs', 'fat', 'fiber'].map(k => {
    const v = r.macros ? fmtMacro(r.macros[k]) : '—';
    const u = r.macros ? macroUnit(k, r.macros[k]) : '';
    return `<div class="macro-cell"><div class="mc-val">${v}${u}</div><div class="mc-label">${macroLabel(k)}</div></div>`;
  }).join('');

  const ingredients = (r.ingredients || [])
    .map(i => `<li>${i}</li>`)
    .join('');

  // Tags
  const tagHtml = (r.tags || []).length
    ? `<div style="margin: 1rem 0; display:flex; flex-wrap:wrap; gap:0.4rem;">
        ${r.tags.map(t => `<span style="font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.3rem 0.6rem;background:#f0fdf4;color:#06402B;border:1px solid #bbf7d0;">${t}</span>`).join('')}
       </div>`
    : '';

  return `
<a class="back-link" href="slow-carb.html">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
  Slow Carb Recipes
</a>
${img}
<div class="detail-meta">
  <span class="detail-tag">${r.category || 'Slow Carb'}</span>
  ${r.serves ? `<span class="detail-serves">${r.serves}</span>` : ''}
</div>
<h1 class="detail-title">${r.title}</h1>
${r.tagline ? `<p class="detail-tagline">${r.tagline}</p>` : ''}
${tagHtml}
<div class="macros-table">${macroCells}</div>
${ingredients ? `<div class="section-block"><h2>Ingredients</h2><ul class="ingredients-list">${ingredients}</ul></div>` : ''}
${r.instructions ? `<div class="section-block"><h2>Instructions</h2><p class="instructions-text">${r.instructions}</p></div>` : ''}`;
}

function initGrid(recipes) {
  const grid = document.getElementById('recipe-grid');
  if (!grid) return;

  const labels = { all: 'All Recipes', breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

  function renderFiltered(meal) {
    const filtered = meal === 'all' ? recipes : recipes.filter(r => r.meal === meal);
    grid.innerHTML = filtered.map(renderCard).join('');
    const countEl = document.getElementById('recipe-count');
    const labelEl = document.getElementById('section-label');
    if (countEl) countEl.textContent = filtered.length;
    if (labelEl) labelEl.textContent = labels[meal] || 'All Recipes';
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      renderFiltered(btn.dataset.meal);
    });
  });

  renderFiltered('all');
}

function initDetail(recipes) {
  const root = document.getElementById('detail-root');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id');
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) {
    root.innerHTML = `<a class="back-link" href="slow-carb.html">← Slow Carb Recipes</a><div class="not-found"><h2>Recipe not found</h2><p>Check the URL or <a href="slow-carb.html">browse all recipes</a>.</p></div>`;
    return;
  }
  document.title = `${recipe.title} — Slow Carb`;
  root.innerHTML = renderDetail(recipe);
}

fetch('slowcarb-recipes.json')
  .then(r => r.json())
  .then(recipes => {
    if (document.getElementById('recipe-grid')) initGrid(recipes);
    if (document.getElementById('detail-root')) initDetail(recipes);
  });
