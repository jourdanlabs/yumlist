import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 20;
const BATCH = 6;

// Invite links may only point at the app's own domains. Any other origin the
// caller sends is ignored, so this endpoint can't be used to mail links to a
// third-party site.
const APP_ORIGINS = ['https://yumlist.base44.app', 'https://fampan.com', 'https://www.fampan.com'];

function resolveInviteOrigin(serverAppUrl, requestedUrl) {
  const candidates = [serverAppUrl, requestedUrl];
  for (const raw of candidates) {
    try {
      const origin = new URL(String(raw || '')).origin;
      if (APP_ORIGINS.includes(origin)) return origin;
    } catch (e) {
      // not a URL - try the next candidate
    }
  }
  return APP_ORIGINS[0];
}

// A family member asks their guests by email. Only that family's own party can
// be invited to, recipients are capped, and delivery problems are reported as
// counts so the host can fall back to their own email app.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user || !user.family_id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const eventId = String(body.event_id || '');
    if (!eventId) return Response.json({ error: 'Missing event' }, { status: 400 });

    const typed = (Array.isArray(body.emails) ? body.emails : [])
      .map((e) => String(e || '').trim().toLowerCase());

    // Users picked from the in-app search are addressed by id; their email is
    // resolved here so addresses never reach the browser.
    const userIds = Array.from(new Set(
      (Array.isArray(body.user_ids) ? body.user_ids : [])
        .map((id) => String(id || '').trim())
        .filter(Boolean)
    )).slice(0, MAX_RECIPIENTS);

    let pickedEmails = [];
    if (userIds.length > 0) {
      const wanted = new Set(userIds);
      const found = await base44.asServiceRole.entities.User
        .list('-created_date', 500)
        .catch(() => []);
      const list = Array.isArray(found) ? found : (found.items || []);
      pickedEmails = list
        .filter((u) => wanted.has(u.id))
        .map((u) => String(u.email || '').trim().toLowerCase());
    }

    const emails = Array.from(new Set([...typed, ...pickedEmails]))
      .filter((e) => EMAIL_RE.test(e))
      .slice(0, MAX_RECIPIENTS);
    if (emails.length === 0) return Response.json({ error: 'No valid email addresses' }, { status: 400 });

    const event = await base44.entities.PartyEvent
      .get(eventId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!event || event.family_id !== user.family_id || !event.invite_token) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const origin = resolveInviteOrigin(
      req.headers.get('x-base44-app-url'),
      body.app_url
    );
    const inviteUrl = `${origin}/party-invite/${event.invite_token}`;
    const dateLabel = event.event_date
      ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric',
        })
      : 'Soon';

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      const settled = await Promise.allSettled(batch.map((to) =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to,
          template_name: 'PartyInvite',
          variables: {
            event_name: event.name || 'our party',
            event_date: dateLabel,
            host_name: user.full_name || 'Your host',
            invite_url: inviteUrl,
          },
          category: 'marketing',
        })
      ));
      settled.forEach((res) => {
        if (res.status === 'fulfilled' && res.value && res.value.success === false) failed++;
        else if (res.status === 'fulfilled') sent++;
        else failed++;
      });
    }

    return Response.json({ sent, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}