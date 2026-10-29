import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_LENGTH = 60;

// Lets a signed-in user pick the name they go by. full_name is a platform field
// that cannot be changed, so the choice is stored in display_name and the app
// shows that everywhere. Only the caller's own record is ever touched.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.full_name === 'string' ? body.full_name : '';
    const displayName = raw.replace(/\s+/g, ' ').trim();

    if (!displayName) return Response.json({ error: 'Please enter a name.' }, { status: 400 });
    if (displayName.length > MAX_LENGTH) {
      return Response.json({ error: `Keep it under ${MAX_LENGTH} characters.` }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.User.update(user.id, { display_name: displayName });
    return Response.json({ display_name: updated?.display_name || displayName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}