import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Best-effort in-memory rate limit per caller (same pattern as joinFamilyByCode).
// Every call either probes whether an email is registered (404 vs 400) or makes the
// platform send an email to a stranger, so cap both.
const WINDOW_MS = 10 * 60_000;
const MAX_INVITES = 10;
const invites = new Map();

function rateLimited(userId) {
  const now = Date.now();
  if (invites.size > 1000) {
    for (const [k, v] of invites) if (now - v.firstAt >= WINDOW_MS) invites.delete(k);
  }
  const entry = invites.get(userId);
  if (entry && now - entry.firstAt < WINDOW_MS) {
    if (entry.count >= MAX_INVITES) return true;
    entry.count++;
    return false;
  }
  invites.set(userId, { firstAt: now, count: 1 });
  return false;
}

// Names are user-controlled and end up in an email the platform sends under its own
// name. Collapse control characters / newlines and cap the length so a family or
// profile name can't carry a long phishing message or spoof extra lines.
function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, ' ').trim().slice(0, max);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.family_id) return Response.json({ error: 'You must be in a family first' }, { status: 400 });

    // Only the family owner (creator) or an admin can invite members.
    if (user.role !== 'admin') {
      const family = await base44.asServiceRole.entities.Family.get(user.family_id).catch(() => null);
      if (!family || family.created_by_id !== user.id) {
        return Response.json({ error: 'Only the family owner can invite members' }, { status: 403 });
      }
    }

    if (rateLimited(user.id)) {
      return Response.json({ error: 'Too many invitations. Please try again later.' }, { status: 429 });
    }

    let body = {};
    try { body = await req.json(); } catch (e) {}
    const email = (body.email || '').toString().trim().toLowerCase();
    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });

    const users = await base44.asServiceRole.entities.User.filter({ email });
    const found = users.find(u => (u.email || '').toLowerCase() === email);
    if (!found) return Response.json({ error: 'No user found with that email' }, { status: 404 });
    if (found.id === user.id) return Response.json({ error: 'You cannot invite yourself' }, { status: 400 });
    // Never hijack a user who already belongs to another family.
    if (found.family_id && found.family_id !== user.family_id) {
      return Response.json({ error: 'That user already belongs to a family' }, { status: 400 });
    }
    if (found.family_id === user.family_id) {
      return Response.json({ success: true, already_member: true, user: { id: found.id, full_name: found.full_name, email: found.email } });
    }

    // Consent-based flow: send the invite code to the target user by email.
    // The target joins voluntarily via the existing joinFamilyByCode flow —
    // we never write to another user's account without their action.
    const family = await base44.asServiceRole.entities.Family.get(user.family_id).catch(() => null);
    if (!family) return Response.json({ error: 'Family not found' }, { status: 500 });

    const inviterName = clean(user.full_name || user.email, 60);
    const inviteeName = clean(found.full_name || 'there', 60);
    const familyName = clean(family.name, 60);
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: found.email,
      subject: `${inviterName} invited you to join ${familyName} on Family Pantry`,
      body:
        `Hi ${inviteeName},\n\n` +
        `${inviterName} has invited you to join their family "${familyName}" on Family Pantry.\n\n` +
        `To accept, open Family Pantry, go to the Family page, and join using this invite code:\n\n` +
        `${family.invite_code}\n\n` +
        `If you weren't expecting this invitation, you can safely ignore this email.\n\n` +
        `— Family Pantry`,
    });

    return Response.json({
      success: true,
      invited: true,
      user: { id: found.id, full_name: found.full_name, email: found.email }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}