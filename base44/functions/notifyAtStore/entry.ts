import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.family_id) return Response.json({ error: 'No family' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const note = (body.note || '').toString().slice(0, 280);

    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const members = users.filter((u) => u.family_id === user.family_id && u.id !== user.id && u.email);
    if (members.length === 0) {
      return Response.json({ sent: 0, message: 'No other family members to notify.' });
    }

    const shopper = user.full_name || user.email;
    let text = `${shopper} is at the store shopping right now — reply with anything you need added to the cart.`;
    if (note) text += `\n\nNote from ${shopper}: ${note}`;

    let sent = 0;
    const failures = [];
    for (const m of members) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: m.email,
          subject: `${shopper} is at the store`,
          body: text,
        });
        sent++;
      } catch (e) {
        failures.push({ email: m.email, error: e.message });
      }
    }

    return Response.json({ sent, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}