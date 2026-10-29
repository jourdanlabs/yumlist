import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_RESULTS = 5;

// Family-owner lookup: finds an existing app user by username (their chosen
// display name) or by their exact email address, so they can be invited.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.family_id) return Response.json({ error: 'You must be in a family first' }, { status: 400 });

    // Only the family owner (creator) or an admin can search for users to add.
    if (user.role !== 'admin') {
      const family = await base44.asServiceRole.entities.Family.get(user.family_id).catch(() => null);
      if (!family || family.created_by_id !== user.id) {
        return Response.json({ error: 'Only the family owner can add members' }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const query = (body.query || body.email || '').toString().trim().slice(0, 120);
    if (!query) return Response.json({ users: [] });
    const q = query.toLowerCase();

    let matches = [];
    if (q.includes('@')) {
      const res = await base44.asServiceRole.entities.User.filter({ email: q });
      matches = (Array.isArray(res) ? res : res.items || [])
        .filter((u) => (u.email || '').toLowerCase() === q);
    } else {
      const res = await base44.asServiceRole.entities.User.list('-created_date', 500);
      const list = Array.isArray(res) ? res : (res.items || []);
      matches = list
        .filter((u) => `${u.display_name || ''} ${u.full_name || ''} ${u.email || ''}`.toLowerCase().includes(q))
        .slice(0, MAX_RESULTS);
    }

    const users = matches
      .filter((u) => u.id !== user.id)
      .map((u) => ({
        id: u.id,
        name: u.display_name || u.full_name || u.email,
        email: u.email,
        has_family: !!u.family_id,
      }));

    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}