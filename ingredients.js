// Blueprint Recipes — ingredients.js

// ── Category keyword rules (first match wins) ──────────────────────────────
const CATEGORIES = [
  {
    id: 'produce',
    label: '🥦 Vegetables',
    emoji: '🥦',
    keywords: [
      'broccoli','cauliflower','mushroom','garlic','ginger','spinach','kale',
      'celery','carrot','cabbage','onion','shallot','tomato','pepper','zucchini',
      'squash','asparagus','peas','bean sprout','edamame','radish','snap pea',
      'green bean','sweet potato','potato','turnip','leek','beet','bok choy',
      'arugula','fennel','parsnip','yam','japanese sweet','acorn squash',
      'spaghetti squash','butternut','riced cauliflower','cauliflower rice',
      'cauliflower head','cauliflower floret','red cabbage','white cabbage',
    ]
  },
  {
    id: 'fruits',
    label: '🍓 Fruits & Berries',
    emoji: '🍓',
    keywords: [
      'berry','berries','strawberr','blueberr','cherry','cherries','apple',
      'banana','pomegranate','lemon','lime','mango','orange','avocado',
      'cranberr','currant','date','fig','grape','pear','peach','plum',
      'honeycrisp','dark cherr',
    ]
  },
  {
    id: 'legumes',
    label: '🫘 Legumes & Grains',
    emoji: '🫘',
    keywords: [
      'lentil','chickpea','bean','beans','quinoa','mung','cannellini',
      'white bean','black bean','edamame','hummus','chickpea flour',
      'chickpea rice','cooked lentil',
    ]
  },
  {
    id: 'nuts',
    label: '🥜 Nuts & Seeds',
    emoji: '🥜',
    keywords: [
      'walnut','macadamia','almond','brazil nut','cashew','pistachio','pecan',
      'hazelnut','hemp seed','chia seed','flax','sunflower lecithin','sesame',
      'pumpkin seed','seed','nut','lecithin',
    ]
  },
  {
    id: 'herbs',
    label: '🌿 Herbs & Spices',
    emoji: '🌿',
    keywords: [
      'cumin','turmeric','paprika','cinnamon','cardamom','coriander','garam masala',
      'thyme','rosemary','oregano','basil','parsley','cilantro','mint','dill',
      'chive','bay leaf','bay leaves','chili','chipotle','pepper flake','black pepper',
      'vanilla','za\'atar','butterfly pea','wheatgrass','onion powder','garlic powder',
      'ginger powder','smoked paprika','red pepper flake','dried','powder','spice',
    ]
  },
  {
    id: 'oils',
    label: '🫙 Oils & Vinegars',
    emoji: '🫙',
    keywords: [
      'olive oil','avocado oil','macadamia nut oil','coconut oil','oil',
      'vinegar','balsamic','apple cider','red wine vinegar','rice vinegar',
    ]
  },
  {
    id: 'liquids',
    label: '🥛 Liquids & Milks',
    emoji: '🥛',
    keywords: [
      'milk','almond milk','macadamia milk','macadamia nut milk','coconut milk',
      'oat milk','water','broth','stock','vegetable broth','vegetable stock',
      'pomegranate juice','juice','liquid smoke',
    ]
  },
  {
    id: 'pantry',
    label: '🥫 Pantry & Condiments',
    emoji: '🥫',
    keywords: [
      'tamari','soy sauce','miso','nutritional yeast','tomato paste','tomato sauce',
      'ketchup','mustard','dijon','maple syrup','honey','manuka','liquid smoke',
      'cacao','blueprint cacao','sundried','olive','olives','pickled',
    ]
  },
];

function categorize(name) {
  const lower = name.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => lower.includes(kw))) return cat.id;
  }
  return 'pantry'; // fallback
}

// Normalize ingredient name: strip leading amount, keep the ingredient part
function parseName(raw) {
  if (raw.includes('—')) return raw.split('—')[1].trim();
  return raw.trim();
}

// Deduplicate ingredient names: group slight variations together
// Key = lowercased, stripped of trailing prep notes for grouping
function normalizeKey(name) {
  return name.toLowerCase()
    .replace(/\s*\(.*?\)/g, '')   // remove parentheticals
    .replace(/,.*$/, '')           // strip after comma
    .replace(/\s+/g, ' ')
    .trim();
}

function buildIngredientMap(recipes) {
  // name (display) → { key, category, recipes: [{id, title, meal}] }
  const map = new Map(); // normalized key → entry

  for (const r of recipes) {
    for (const raw of (r.ingredients || [])) {
      const display = parseName(raw);
      const key = normalizeKey(display);
      if (!map.has(key)) {
        map.set(key, {
          display,
          key,
          category: categorize(display),
          recipes: [],
        });
      }
      const entry = map.get(key);
      // avoid duplicate recipe refs
      if (!entry.recipes.find(x => x.id === r.id)) {
        entry.recipes.push({ id: r.id, title: r.title, meal: r.meal });
      }
    }
  }

  // Sort recipes within each ingredient by id
  for (const entry of map.values()) {
    entry.recipes.sort((a, b) => a.id.localeCompare(b.id));
  }

  return map;
}

const MEAL_BADGE = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

function renderIngredientRow(entry) {
  const recipeChips = entry.recipes.map(r =>
    `<a href="recipe.html?id=${r.id}" class="recipe-chip" title="${r.title}">
      <span class="chip-meal">${MEAL_BADGE[r.meal] || ''}</span>
      <span class="chip-title">${r.title}</span>
    </a>`
  ).join('');

  return `
<div class="ing-row" data-key="${entry.key}" data-cat="${entry.category}">
  <div class="ing-name">${entry.display}</div>
  <div class="ing-recipes">${recipeChips}</div>
</div>`;
}

function renderCategory(cat, entries) {
  if (!entries.length) return '';
  const rows = entries
    .sort((a, b) => a.display.localeCompare(b.display))
    .map(renderIngredientRow)
    .join('');

  return `
<section class="ing-category" data-catid="${cat.id}">
  <h2 class="cat-heading">
    <span class="cat-label">${cat.label}</span>
    <span class="cat-count">${entries.length}</span>
  </h2>
  <div class="ing-rows">
    ${rows}
  </div>
</section>`;
}

function render(recipes, query = '') {
  const map = buildIngredientMap(recipes);
  const q = query.toLowerCase().trim();

  // Group by category
  const byCategory = new Map(CATEGORIES.map(c => [c.id, []]));

  let totalVisible = 0;
  for (const entry of map.values()) {
    if (q && !entry.display.toLowerCase().includes(q) &&
        !entry.recipes.some(r => r.title.toLowerCase().includes(q))) {
      continue;
    }
    const bucket = byCategory.get(entry.category) || byCategory.get('pantry');
    bucket.push(entry);
    totalVisible++;
  }

  const html = CATEGORIES.map(cat => renderCategory(cat, byCategory.get(cat.id) || [])).join('');

  document.getElementById('ing-root').innerHTML = html || '<p class="no-results">No ingredients found.</p>';
  document.getElementById('ing-total').textContent = totalVisible;
}

// ── Init ────────────────────────────────────────────────────────────────────
fetch('recipes.json')
  .then(r => r.json())
  .then(recipes => {
    render(recipes);

    const search = document.getElementById('ing-search');
    let debounce;
    search.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => render(recipes, search.value), 150);
    });
  });
