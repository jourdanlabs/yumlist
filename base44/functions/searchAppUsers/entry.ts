import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MIN_QUERY = 3;
const MAX_RESULTS = 8;

// Lets a signed-in host find other app users to invite to their party. Only a
// name and id come back (never an email), a query must be at least three
// characters, and the result set is small, so this cannot be used to walk the
// whole user directory.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim().toLowerCase().slice(0, 60);
    if (query.length < MIN_QUERY) return Response.json({ users: [] });

    const res = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const list = Array.isArray(res) ? res : (res.items || []);

    const users = list
      .filter((u) => u.id !== user.id)
      .filter((u) => `${u.full_name || ''} ${u.email || ''}`.toLowerCase().includes(query))
      .sort((a, b) => String(b.last_active || '').localeCompare(String(a.last_active || '')))
      .slice(0, MAX_RESULTS)
      .map((u) => ({ id: u.id, full_name: u.full_name || 'App user' }));

    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}