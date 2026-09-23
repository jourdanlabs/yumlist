import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Shared secret used by the scheduled workflow to prove it is the platform
// scheduler. Stored as an environment secret (set via the dashboard Secrets
// page) so it never lives in source code. The workflow sends the same value
// in its "secret" arg.
const SCHEDULER_SECRET = process.env.PANTRY_SCHEDULER_SECRET;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Verify the caller: either the platform scheduler (shared secret) or an
    // authenticated admin. Reject everyone else before any data access.
    let authorized = false;
    if (typeof body.secret === 'string' && body.secret === SCHEDULER_SECRET) {
      authorized = true;
    } else {
      const user = await base44.auth.me().catch(() => null);
      if (user && user.role === 'admin') authorized = true;
    }
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Bound days_ahead to a safe range so it can't be inflated to match everything.
    const daysAhead = Math.min(Math.max(Number(body.days_ahead ?? 3) || 3, 1), 30);

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
    let failureCount = 0;

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
          // Do not return email addresses — only count failures.
          failureCount++;
        }
      }
    }

    return Response.json({ sent, expiringCount: expiring.length, failureCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}