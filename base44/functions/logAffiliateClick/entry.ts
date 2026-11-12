import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const retailer = String(body?.retailer || '').trim();
    const query = String(body?.query || '').trim().slice(0, 120);
    if (!retailer) return Response.json({ error: 'retailer is required' }, { status: 400 });

    const programs = await base44.asServiceRole.entities.AffiliateProgram.filter({ active: true });
    const name = retailer.toLowerCase();
    const program = programs.find((p) => {
      const r = (p.retailer || '').toLowerCase().trim();
      return r && (name.includes(r) || r.includes(name));
    });

    let target = '';
    if (program) {
      target = (program.link_template || '').replace(/\{query\}/g, encodeURIComponent(query));
      let parsed;
      try {
        parsed = new URL(target);
      } catch {
        return Response.json({ error: 'Invalid link template' }, { status: 400 });
      }
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return Response.json({ error: 'Invalid link template' }, { status: 400 });
      }
    }

    await base44.asServiceRole.entities.AffiliateClick.create({
      retailer: program?.retailer || retailer,
      item_query: query,
      target_url: target,
      family_id: user.data?.family_id || '',
      user_id: user.id
    });

    return Response.json({ url: target || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}