import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.family_id) return Response.json({ error: 'No family' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const note = (body.note || '').toString().slice(0, 280);

    const users = await base44.asServiceRole.entities.User.filter({ family_id: user.family_id });
    const members = users.filter((u) => u.id !== user.id && u.email);
    if (members.length === 0) {
      return Response.json({ sent: 0, message: 'No other family members to notify.' });
    }

    const shopper = user.full_name || user.email;
    let text = `${shopper} is at the store shopping right now — reply with anything you need added to the cart.`;
    if (note) text += `\n\nNote from ${shopper}: ${note}`;

    // Persist an in-app notice so it surfaces in the notifications bell.
    try {
      await base44.asServiceRole.entities.StoreNotice.create({
        family_id: user.family_id,
        note,
      });
    } catch (e) {
      // non-critical; email still goes out
    }

    let sent = 0;
    let failureCount = 0;
    for (const m of members) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: m.email,
          subject: `${shopper} is at the store`,
          text: text,
        });
        sent++;
      } catch (e) {
        // Do not return email addresses — only count failures.
        failureCount++;
      }
    }

    return Response.json({ sent, failureCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}