import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
    if (ids.length === 0) return Response.json({ names: {} });

    const names = {};
    for (const id of ids) {
      try {
        const fam = await base44.asServiceRole.entities.Family.get(id);
        if (fam) names[id] = fam.name;
      } catch (e) { /* skip missing */ }
    }
    return Response.json({ names });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}