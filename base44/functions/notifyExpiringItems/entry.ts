import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function base64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

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

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Find the connected Gmail account's own address to send "me" the alert.
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return Response.json({ error: 'Gmail profile fetch failed', status: profileRes.status }, { status: 500 });
    }
    const profile = await profileRes.json();
    const toEmail = profile.emailAddress;

    // Group by family so the digest is readable.
    const families = {};
    for (const it of expiring) {
      const fid = it.family_id || 'unknown';
      (families[fid] = families[fid] || []).push(it);
    }

    const lines = ['The following pantry items are expiring soon:', ''];
    for (const [fid, list] of Object.entries(families)) {
      lines.push(`Family ${fid}:`);
      for (const it of list) {
        const d = new Date(it.expiration_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        lines.push(`  • ${it.name}${it.brand ? ` (${it.brand})` : ''} — expires ${d} (qty ${it.quantity ?? 1} ${it.unit || 'units'})`);
      }
      lines.push('');
    }
    const text = lines.join('\n');

    const rawMessage = [
      `From: Family Pantry <${toEmail}>`,
      `To: <${toEmail}>`,
      `Subject: Pantry items expiring soon`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      ``,
      text,
    ].join('\r\n');

    const raw = base64urlEncode(rawMessage);

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      return Response.json({ error: 'Gmail send failed', details: errText }, { status: 500 });
    }

    return Response.json({ sent: 1, recipient: toEmail, count: expiring.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}