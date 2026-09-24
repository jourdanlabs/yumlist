import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.family_id) return Response.json({ error: 'You are not in a family' }, { status: 400 });

    await base44.asServiceRole.entities.User.update(user.id, {
      family_id: '',
      family_name: ''
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}