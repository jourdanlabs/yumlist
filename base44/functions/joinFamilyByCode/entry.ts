import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = String(body.invite_code || '').trim().toUpperCase();
    if (!code) return Response.json({ error: 'Invite code is required' }, { status: 400 });

    const families = await base44.asServiceRole.entities.Family.filter({ invite_code: code });
    if (!families.length) return Response.json({ found: false });

    const fam = families[0];
    return Response.json({ found: true, id: fam.id, name: fam.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}