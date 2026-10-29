import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_LENGTH = 60;

// Lets a signed-in user rename themselves. full_name is a built-in field that
// updateMe cannot change, so this narrow function does it with the service role:
// it only ever touches the caller's own name, never email or role.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.full_name === 'string' ? body.full_name : '';
    const fullName = raw.replace(/\s+/g, ' ').trim();

    if (!fullName) return Response.json({ error: 'Please enter a name.' }, { status: 400 });
    if (fullName.length > MAX_LENGTH) {
      return Response.json({ error: `Keep it under ${MAX_LENGTH} characters.` }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.User.update(user.id, { full_name: fullName });
    return Response.json({ full_name: updated?.full_name || fullName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}