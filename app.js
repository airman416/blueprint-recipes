// Blueprint Recipes — app.js

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

function renderCard(r) {
  const img = r.image
    ? `<img src="images/${r.image}" alt="${r.title}" loading="lazy">`
    : `<div class="card-img-placeholder">🥗</div>`;

  const macroBadges = ['calories', 'protein', 'carbs', 'fat', 'fiber']
    .filter(k => r.macros[k])
    .map(k => {
      const v = fmtMacro(r.macros[k]);
      const u = macroUnit(k, r.macros[k]);
      return `<span class="macro-badge"><span class="macro-label">${macroLabel(k)}</span><span class="macro-val">${v}${u}</span></span>`;
    }).join('');

  return `
<article class="card" onclick="location.href='recipe.html?id=${r.id}'" role="link" tabindex="0" aria-label="${r.title}">
  <div class="card-img">
    ${img}
    <span class="card-tag">${r.category || 'Blueprint'}</span>
  </div>
  <div class="card-body">
    <h2 class="card-title">${r.title}</h2>
    ${r.tagline ? `<p class="card-tagline">${r.tagline}</p>` : ''}
    <div class="macros">${macroBadges}</div>
  </div>
  <div class="card-footer">
    <span class="btn">View Recipe →</span>
  </div>
</article>`;
}

function renderDetail(r) {
  const img = r.image
    ? `<img class="detail-hero-img" src="images/${r.image}" alt="${r.title}">`
    : '';

  const macroCells = ['calories', 'protein', 'carbs', 'fat', 'fiber'].map(k => {
    const v = fmtMacro(r.macros[k]);
    const u = macroUnit(k, r.macros[k]);
    return `<div class="macro-cell"><div class="mc-val">${v}${u}</div><div class="mc-label">${macroLabel(k)}</div></div>`;
  }).join('');

  const ingredients = (r.ingredients || [])
    .map(i => `<li>${i}</li>`).join('');

  const sourceHtml = r.source_url
    ? `<div class="detail-source">Original recipe: <a href="${r.source_url}" target="_blank" rel="noopener">${r.source_url}</a></div>`
    : '';

  return `
<a class="back-link" href="index.html">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
  All Recipes
</a>
${img}
<div class="detail-meta">
  <span class="detail-tag">${r.category || 'Blueprint'}</span>
  ${r.serves ? `<span class="detail-serves">${r.serves}</span>` : ''}
</div>
<h1 class="detail-title">${r.title}</h1>
${r.tagline ? `<p class="detail-tagline">"${r.tagline}"</p>` : ''}
<div class="macros-table">${macroCells}</div>
${ingredients ? `<div class="section-block"><h2>Ingredients</h2><ul class="ingredients-list">${ingredients}</ul></div>` : ''}
${r.instructions ? `<div class="section-block"><h2>Instructions</h2><p class="instructions-text">${r.instructions}</p></div>` : ''}
${sourceHtml}`;
}

function initGrid(recipes) {
  const grid = document.getElementById('recipe-grid');
  if (!grid) return;
  grid.innerHTML = recipes.map(renderCard).join('');
  // keyboard support
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
  });
}

function initDetail(recipes) {
  const root = document.getElementById('detail-root');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id');
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) {
    root.innerHTML = `<a class="back-link" href="index.html">← All Recipes</a><div class="not-found"><h2>Recipe not found</h2><p>Check the URL or <a href="index.html" style="color:var(--green)">browse all recipes</a>.</p></div>`;
    return;
  }
  document.title = `${recipe.title} — Blueprint`;
  root.innerHTML = renderDetail(recipe);
}

fetch('recipes.json')
  .then(r => r.json())
  .then(recipes => {
    if (document.getElementById('recipe-grid')) initGrid(recipes);
    if (document.getElementById('detail-root')) initDetail(recipes);
  });
