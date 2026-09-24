import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Best-effort in-memory rate limiting for invite-code attempts (per caller).
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;
const attempts = new Map();

function rateLimited(userId) {
  const now = Date.now();
  const entry = attempts.get(userId);
  if (entry && now - entry.firstAt < WINDOW_MS) {
    if (entry.count >= MAX_ATTEMPTS) return true;
    entry.count++;
    return false;
  }
  attempts.set(userId, { firstAt: now, count: 1 });
  return false;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // A user who already belongs to a family cannot join another.
    if (user.family_id) return Response.json({ error: 'You already belong to a family' }, { status: 400 });

    if (rateLimited(user.id)) {
      return Response.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const code = String(body.invite_code || '').trim().toUpperCase();
    if (!code) return Response.json({ error: 'Invite code is required' }, { status: 400 });

    const families = await base44.asServiceRole.entities.Family.filter({ invite_code: code });
    if (!families.length) return Response.json({ found: false });

    const fam = families[0];
    // Write membership server-side so the invite code is actually enforced.
    await base44.asServiceRole.entities.User.update(user.id, {
      family_id: fam.id,
      family_name: fam.name
    });
    return Response.json({ found: true, id: fam.id, name: fam.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}