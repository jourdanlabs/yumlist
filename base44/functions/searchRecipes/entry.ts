import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_RESULTS = 12;

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

// Searches TheMealDB (free, key-less) for recipes by name.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim().slice(0, 60);
    if (query.length < 2) return Response.json({ recipes: [] });

    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return Response.json({ error: 'Recipe search is unavailable right now' }, { status: 502 });

    const data = await res.json().catch(() => ({}));
    const meals = Array.isArray(data?.meals) ? data.meals.slice(0, MAX_RESULTS) : [];

    return Response.json({
      recipes: meals.map((m) => ({
        external_id: String(m.idMeal),
        title: m.strMeal || 'Recipe',
        image_url: m.strMealThumb || '',
        category: m.strCategory || '',
        area: m.strArea || '',
        instructions: m.strInstructions || '',
        ingredients: ingredientsOf(m),
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}