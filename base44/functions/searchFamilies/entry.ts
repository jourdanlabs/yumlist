import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.family_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const query = String(body?.query || '').trim().toLowerCase();
    if (query.length < 1) {
      return Response.json({ families: [] });
    }
    const all = await base44.entities.Family.list('-created_date', 500);
    const matches = all
      .filter((f) => f.id !== user.family_id && String(f.name || '').toLowerCase().includes(query))
      .slice(0, 20)
      .map((f) => ({ id: f.id, name: f.name }));
    return Response.json({ families: matches });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}