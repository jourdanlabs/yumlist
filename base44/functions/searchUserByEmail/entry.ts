import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.family_id) return Response.json({ error: 'You must be in a family first' }, { status: 400 });

    // Only the family owner (creator) or an admin can search for users to add.
    if (user.role !== 'admin') {
      const family = await base44.asServiceRole.entities.Family.get(user.family_id).catch(() => null);
      if (!family || family.created_by_id !== user.id) {
        return Response.json({ error: 'Only the family owner can add members' }, { status: 403 });
      }
    }

    let body = {};
    try { body = await req.json(); } catch (e) {}
    const email = (body.email || '').toString().trim().toLowerCase();
    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });
    const users = await base44.asServiceRole.entities.User.filter({ email });
    const found = users.find(u => (u.email || '').toLowerCase() === email);
    if (!found) return Response.json({ found: false });
    return Response.json({
      found: true,
      user: {
        full_name: found.full_name,
        email: found.email,
        has_family: !!found.family_id
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}