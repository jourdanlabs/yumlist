import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const daysAhead = Number(body.days_ahead ?? 3);

    // Service role: scheduled run has no user context.
    const items = await base44.asServiceRole.entities.GroceryItem.list('-created_date', 500);

    const now = new Date(); now.setHours(0, 0, 0, 0);
    const horizon = new Date(now); horizon.setDate(horizon.getDate() + daysAhead);

    const expiring = items.filter((i) => {
      if (!i.expiration_date) return false;
      const d = new Date(i.expiration_date + 'T00:00:00');
      return d >= now && d <= horizon;
    });

    if (expiring.length === 0) {
      return Response.json({ sent: 0, message: 'No items expiring soon.' });
    }

    // Group expiring items by family.
    const byFamily = {};
    for (const it of expiring) {
      const fid = it.family_id || 'unknown';
      (byFamily[fid] = byFamily[fid] || []).push(it);
    }

    // Load family members and group by family_id.
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const usersByFamily = {};
    for (const u of users) {
      const fid = u.family_id || 'unknown';
      (usersByFamily[fid] = usersByFamily[fid] || []).push(u);
    }

    let sent = 0;
    const failures = [];

    for (const [fid, list] of Object.entries(byFamily)) {
      const members = usersByFamily[fid] || [];
      if (members.length === 0) continue;

      const lines = [
        'These pantry items are expiring soon — use them up or add replacements to your shopping list:',
        '',
      ];
      for (const it of list) {
        const d = new Date(it.expiration_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        lines.push(`• ${it.name}${it.brand ? ` (${it.brand})` : ''} — expires ${d} (qty ${it.quantity ?? 1} ${it.unit || 'units'})`);
      }
      const text = lines.join('\n');

      for (const m of members) {
        if (!m.email) continue;
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: m.email,
            subject: 'Pantry items expiring soon',
            body: text,
          });
          sent++;
        } catch (e) {
          failures.push({ email: m.email, error: e.message });
        }
      }
    }

    return Response.json({ sent, expiringCount: expiring.length, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}