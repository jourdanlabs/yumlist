import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Public: a guest opens the invite link without an account. The long invite
// token is the only credential, so this returns nothing but what the guest
// page needs to show.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.token || '').trim().slice(0, 64);
    if (!token) return Response.json({ error: 'Missing invite code' }, { status: 400 });

    const { items } = await base44.asServiceRole.entities.PartyEvent.filter(
      { invite_token: token },
      { limit: 1 }
    );
    const event = (items || [])[0];
    if (!event) return Response.json({ error: 'This invite link is not active' }, { status: 404 });

    let host = '';
    if (event.family_id) {
      const family = await base44.asServiceRole.entities.Family
        .get(event.family_id)
        .catch(() => null);
      host = (family && family.name) || '';
    }

    return Response.json({
      event: { name: event.name || 'Party', event_date: event.event_date || '' },
      host,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}