import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const likedNames = Array.isArray(body.liked_names) ? body.liked_names : [];
    const matchMode = body.match_mode === 'all' ? 'all' : 'any';
    if (likedNames.length === 0) {
      return Response.json({ error: 'No liked items provided' }, { status: 400 });
    }

    const modeText = matchMode === 'all'
      ? 'Each recipe MUST use ALL of these liked ingredients'
      : 'Each recipe should use AT LEAST ONE of these liked ingredients';
    const prompt = `${modeText}: ${likedNames.join(', ')}. Suggest 6 practical, family-friendly recipes. For each, return a title, a list of ingredients (with quantities), and brief step-by-step instructions. Keep instructions concise.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recipes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                ingredients: { type: 'array', items: { type: 'string' } },
                instructions: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({ recipes: res.recipes || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}