import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.family_id) return Response.json({ error: 'You must be in a family first' }, { status: 400 });
    let body = {};
    try { body = await req.json(); } catch (e) {}
    const email = (body.email || '').toString().trim().toLowerCase();
    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });
    const users = await base44.asServiceRole.entities.User.filter({ email });
    const found = users.find(u => (u.email || '').toLowerCase() === email);
    if (!found) return Response.json({ error: 'No user found with that email' }, { status: 404 });
    if (found.id === user.id) return Response.json({ error: 'You cannot add yourself' }, { status: 400 });
    await base44.asServiceRole.entities.User.update(found.id, {
      family_id: user.family_id,
      family_name: user.family_name
    });
    return Response.json({
      success: true,
      user: { id: found.id, full_name: found.full_name, email: found.email }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}