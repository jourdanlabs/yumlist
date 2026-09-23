import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const imageUrl = body.image_url;
    if (!imageUrl) return Response.json({ error: 'image_url is required' }, { status: 400 });

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'Extract the recipe from this image. Return the recipe title, a list of ingredients (each as a short string with quantity), and the step-by-step instructions as plain text. If the source (book, website, author) is visible, include it.',
      file_urls: [imageUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          ingredients: { type: 'array', items: { type: 'string' } },
          instructions: { type: 'string' },
          source: { type: 'string' },
        },
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}