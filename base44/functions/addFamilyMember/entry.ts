import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

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

    let body = {};
    try { body = await req.json(); } catch (e) {}
    const userId = (body.user_id || '').toString().trim();
    const email = (body.email || '').toString().trim().toLowerCase();
    if (!userId && !email) return Response.json({ error: 'A user is required' }, { status: 400 });

    // Preferred path: the user picked from search is addressed by id, so their
    // address never has to leave the server.
    let found = null;
    if (userId) {
      found = await base44.asServiceRole.entities.User
        .get(userId)
        .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!found) return Response.json({ error: 'No user found' }, { status: 404 });
    } else {
      const users = await base44.asServiceRole.entities.User.filter({ email });
      found = users.find(u => (u.email || '').toLowerCase() === email) || null;
      if (!found) return Response.json({ error: 'No user found with that email' }, { status: 404 });
    }
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

    const inviterName = user.full_name || user.email;
    const inviteeName = found.full_name || 'there';
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: found.email,
      subject: `${inviterName} invited you to join ${family.name} on Family Pantry`,
      body:
        `Hi ${inviteeName},\n\n` +
        `${inviterName} has invited you to join their family "${family.name}" on Family Pantry.\n\n` +
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