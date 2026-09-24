import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.family_id) return Response.json({ error: 'You already belong to a family' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    if (!name) return Response.json({ error: 'Family name is required' }, { status: 400 });

    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const fam = await base44.asServiceRole.entities.Family.create({ name, invite_code: code });
    await base44.asServiceRole.entities.User.update(user.id, {
      family_id: fam.id,
      family_name: fam.name
    });
    return Response.json({ id: fam.id, name: fam.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}