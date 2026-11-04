import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_RESULTS = 8;

const RECIPE_SCHEMA = {
  type: 'object',
  properties: {
    recipes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          cuisine: { type: 'string' },
          category: { type: 'string' },
          image_url: { type: 'string' },
          ingredients: { type: 'array', items: { type: 'string' } },
          instructions: { type: 'string' },
          source_name: { type: 'string' },
          source_url: { type: 'string' },
        },
        required: ['title', 'ingredients', 'instructions'],
      },
    },
  },
  required: ['recipes'],
};

function ingredientsOf(meal) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] || '').trim();
    if (!name) continue;
    const measure = (meal[`strMeasure${i}`] || '').trim();
    out.push(measure ? `${measure} ${name}` : name);
  }
  return out;
}

// Fallback source: TheMealDB (free, key-less).
async function searchMealDb(query) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  const meals = Array.isArray(data?.meals) ? data.meals.slice(0, MAX_RESULTS) : [];
  return meals.map((m) => ({
    external_id: `mealdb-${m.idMeal}`,
    title: m.strMeal || 'Recipe',
    image_url: m.strMealThumb || '',
    category: m.strCategory || '',
    cuisine: m.strArea || '',
    instructions: m.strInstructions || '',
    ingredients: ingredientsOf(m),
    source_name: 'TheMealDB',
    source_url: '',
  }));
}

// Searches the web for real recipes and returns structured results.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim().slice(0, 60);
    if (query.length < 2) return Response.json({ recipes: [] });

    const prompt = `Search the web for real, published recipes matching "${query}".
Return up to ${MAX_RESULTS} distinct recipes from well-known recipe websites.
For each recipe give:
- title: the recipe name
- cuisine: the cuisine or region (e.g. Italian, Mexican) if known, else ""
- category: the dish type (e.g. Dinner, Dessert) if known, else ""
- image_url: a direct, publicly accessible image URL taken from that recipe page, else ""
- ingredients: the full ingredient list, one item per entry, including quantities (e.g. "2 cups all-purpose flour")
- instructions: the complete step-by-step method as plain text, with numbered steps
- source_name: the website name the recipe came from
- source_url: the full URL of the recipe page
Use only recipes you actually found in search results. Do not invent recipes, ingredients or image URLs.`;

    let recipes = [];
    try {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: RECIPE_SCHEMA,
      });
      const list = Array.isArray(result?.recipes) ? result.recipes : [];
      recipes = list
        .filter((r) => r && r.title && Array.isArray(r.ingredients) && r.ingredients.length > 0)
        .slice(0, MAX_RESULTS)
        .map((r, i) => ({
          external_id: r.source_url ? `web-${r.source_url}` : `web-${i}-${r.title}`,
          title: r.title,
          image_url: r.image_url || '',
          category: r.category || '',
          cuisine: r.cuisine || '',
          instructions: r.instructions || '',
          ingredients: r.ingredients.map((s) => String(s).trim()).filter(Boolean),
          source_name: r.source_name || 'Web',
          source_url: r.source_url || '',
        }));
    } catch (e) {
      recipes = [];
    }

    if (recipes.length === 0) {
      recipes = await searchMealDb(query).catch(() => []);
    }

    return Response.json({ recipes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}