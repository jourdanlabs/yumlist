import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const fileUrl = body.file_url;
    if (!fileUrl) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const res = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: {
        type: 'object',
        properties: {
          store_name: { type: 'string' },
          purchase_date: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                brand: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' },
                category: { type: 'string' },
                expiration_date: { type: 'string' },
              },
              required: ['name'],
            },
          },
        },
        required: ['items'],
      },
    });

    const output = res?.output;
    const rows = Array.isArray(output?.items) ? output.items : [];
    const store = String(output?.store_name || '').trim().toLowerCase();

    // Drop the store/vendor itself so it never ends up as a pantry item or brand.
    const isVendor = (value) => {
      const v = String(value || '').trim().toLowerCase();
      if (!v || !store) return false;
      return v === store || v.includes(store) || (v.length >= 4 && store.includes(v));
    };

    const items = rows
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({
        name: String(r.name || '').trim(),
        brand: isVendor(r.brand) ? '' : String(r.brand || '').trim(),
        quantity: r.quantity,
        unit: r.unit,
        category: r.category,
        expiration_date: r.expiration_date,
      }))
      .filter((r) => r.name && !isVendor(r.name));

    return Response.json({
      status: res?.status || 'success',
      details: res?.details || null,
      output: { items },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}