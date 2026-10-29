import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Best-effort in-memory rate limit per caller (same pattern as joinFamilyByCode).
// Any signed-up user can create a family and become its owner, so without a cap
// this lookup can be scripted to harvest which emails are registered (plus names).
const WINDOW_MS = 60_000;
const MAX_LOOKUPS = 10;
const lookups = new Map();

function rateLimited(userId) {
  const now = Date.now();
  if (lookups.size > 1000) {
    for (const [k, v] of lookups) if (now - v.firstAt >= WINDOW_MS) lookups.delete(k);
  }
  const entry = lookups.get(userId);
  if (entry && now - entry.firstAt < WINDOW_MS) {
    if (entry.count >= MAX_LOOKUPS) return true;
    entry.count++;
    return false;
  }
  lookups.set(userId, { firstAt: now, count: 1 });
  return false;
}

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

    if (rateLimited(user.id)) {
      return Response.json({ error: 'Too many lookups. Please try again in a minute.' }, { status: 429 });
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