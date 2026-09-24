import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.family_id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const name = String(body.target_family_name || '').trim().toLowerCase();
    if (!name) return Response.json({ error: 'Family name is required' }, { status: 400 });

    const all = await base44.asServiceRole.entities.Family.list('-created_date', 500);
    const target = all.find((f) => f.id !== user.family_id && String(f.name || '').toLowerCase() === name);
    if (!target) return Response.json({ error: 'No family found with that name' }, { status: 404 });

    // Reject if a share already exists (pending or accepted) in either direction.
    const [outgoing, incoming] = await Promise.all([
      base44.asServiceRole.entities.FamilyShare.filter({ requester_family_id: user.family_id, target_family_id: target.id }),
      base44.asServiceRole.entities.FamilyShare.filter({ requester_family_id: target.id, target_family_id: user.family_id }),
    ]);
    const existing = [...outgoing, ...incoming].find((s) => s.status !== 'disconnected');
    if (existing) {
      return Response.json({ error: 'A share request already exists with this family' }, { status: 400 });
    }

    await base44.asServiceRole.entities.FamilyShare.create({
      requester_family_id: user.family_id,
      target_family_id: target.id,
      status: 'pending',
      requested_by_name: user.full_name || user.email || '',
    });
    return Response.json({ success: true, target_name: target.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}