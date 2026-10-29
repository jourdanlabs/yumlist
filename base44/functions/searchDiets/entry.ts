import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Searches well-known diet patterns and returns a compact profile a family can
// apply: the ingredients to watch for plus the headline rules.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim().slice(0, 80);
    if (query.length < 2) return Response.json({ diets: [] });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a nutrition reference. A shopper searched for "${query}".
Return up to 5 well-known diets, eating patterns or food restrictions that match that search (for example keto, Mediterranean, vegan, gluten-free, low-FODMAP, DASH, halal, nut-free).
For each one give:
- name: the diet's common name, 1-4 words
- summary: one plain sentence describing it
- avoid_ingredients: 8-15 short grocery keywords that are NOT allowed on this diet, written the way a food label or item name would say it (single words or two-word phrases such as "white bread", "whole milk", "peanut butter"). These are matched against pantry item names and recipe ingredients, so prefer common grocery words.
- rules: 2-4 short bullet rules of the diet.
If nothing sensible matches the search, return an empty list.`,
      response_json_schema: {
        type: 'object',
        properties: {
          diets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                summary: { type: 'string' },
                avoid_ingredients: { type: 'array', items: { type: 'string' } },
                rules: { type: 'array', items: { type: 'string' } },
              },
              required: ['name'],
            },
          },
        },
        required: ['diets'],
      },
    });

    const diets = Array.isArray(result?.diets) ? result.diets.slice(0, 5) : [];
    return Response.json({
      diets: diets
        .filter((d) => d && d.name)
        .map((d) => ({
          name: String(d.name).slice(0, 60),
          summary: String(d.summary || '').slice(0, 300),
          avoid_ingredients: (Array.isArray(d.avoid_ingredients) ? d.avoid_ingredients : [])
            .map((k) => String(k || '').trim().toLowerCase())
            .filter((k) => k.length >= 3)
            .slice(0, 20),
          rules: (Array.isArray(d.rules) ? d.rules : []).map((r) => String(r || '').slice(0, 160)).slice(0, 6),
        })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}