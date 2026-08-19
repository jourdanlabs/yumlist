import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const barcode = (body && body.barcode || '').toString().trim();
    if (!barcode) return Response.json({ error: 'Barcode is required' }, { status: 400 });

    const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    const resp = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'FamilyPantry/1.0 (web app)',
        'Accept': 'application/json'
      }
    });
    if (!resp.ok) return Response.json({ error: 'Lookup service unavailable' }, { status: 502 });
    const data = await resp.json();

    if (data.status !== 1 || !data.product) {
      return Response.json({ found: false, barcode });
    }

    const p = data.product;
    const image = p.image_front_url || p.image_url || p.image_small_url || null;
    return Response.json({
      found: true,
      barcode,
      name: p.product_name || p.generic_name || '',
      brand: p.brands || '',
      category: p.categories_tags && p.categories_tags[0] ? p.categories_tags[0].replace('en:', '') : (p.categories || ''),
      image_url: image
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}