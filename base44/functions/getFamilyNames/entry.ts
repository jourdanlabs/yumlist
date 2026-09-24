import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.family_id) return Response.json({ names: {} });

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
    if (ids.length === 0) return Response.json({ names: {} });

    // Only resolve names for families that have a sharing relationship with the caller.
    const [outgoing, incoming] = await Promise.all([
      base44.asServiceRole.entities.FamilyShare.filter({ requester_family_id: user.family_id }),
      base44.asServiceRole.entities.FamilyShare.filter({ target_family_id: user.family_id }),
    ]);
    const allowedIds = new Set();
    [...outgoing, ...incoming].forEach((s) => {
      allowedIds.add(s.requester_family_id);
      allowedIds.add(s.target_family_id);
    });

    const names = {};
    for (const id of ids) {
      if (!allowedIds.has(id)) continue;
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