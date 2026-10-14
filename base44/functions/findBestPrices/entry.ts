import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const items = body?.items;
    const location = body?.location;

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }
    if (!location || !location.lat || !location.lng) {
      return Response.json({ error: 'Location is required' }, { status: 400 });
    }

    // Cap items to keep the LLM prompt bounded
    const itemList = items.slice(0, 30).map((i) => {
      const name = (i.name || '').trim();
      const brand = (i.brand || '').trim();
      return brand ? `${brand} ${name}` : name;
    });

    const prompt = `A shopper is at latitude ${location.lat}, longitude ${location.lng}.
Search for current prices of the following grocery items at nearby local stores (Walmart, Target, Kroger, Aldi, Costco, Trader Joe's, local supermarkets, etc. within ~10 miles).

Shopping list:
${itemList.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

For each major store near this location, estimate the price of each item and the total cost for the full shopping list. Also note the approximate distance from the shopper's location if available. Identify which store has the lowest total cost for the full list.

Return ONLY the JSON matching the schema. Use realistic estimated prices in USD. If a store doesn't carry an item, set its price to null. Include 3-5 nearby stores.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_8_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          stores: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                distance_miles: { type: 'number' },
                total: { type: 'number' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      price: { type: ['number', 'null'] }
                    },
                    required: ['name', 'price']
                  }
                }
              },
              required: ['name', 'distance_miles', 'total', 'items']
            }
          },
          best_store: { type: 'string' },
          best_total: { type: 'number' },
          notes: { type: 'string' }
        },
        required: ['stores', 'best_store', 'best_total']
      }
    });

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}