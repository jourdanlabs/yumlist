import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_GUEST = 60;
const MAX_ITEM = 80;
const MAX_NOTE = 300;
const MAX_REQUESTS_PER_EVENT = 400;

// Public: a party guest adds their own preference. The invite token identifies
// the event, and every write is bounded and attached to that event's family.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const token = String(body.token || '').trim().slice(0, 64);
    const guestName = String(body.guest_name || '').trim().slice(0, MAX_GUEST);
    const itemName = String(body.item_name || '').trim().slice(0, MAX_ITEM);
    const note = String(body.note || '').trim().slice(0, MAX_NOTE);

    if (!token) return Response.json({ error: 'Missing invite code' }, { status: 400 });
    if (!guestName || !itemName) {
      return Response.json({ error: 'Your name and what you would like are required' }, { status: 400 });
    }

    const { items } = await base44.asServiceRole.entities.PartyEvent.filter(
      { invite_token: token },
      { limit: 1 }
    );
    const event = (items || [])[0];
    if (!event) return Response.json({ error: 'This invite link is not active' }, { status: 404 });

    const total = await base44.asServiceRole.entities.PartyPreference.count({ event_id: event.id });
    if (total >= MAX_REQUESTS_PER_EVENT) {
      return Response.json({ error: 'This list is full' }, { status: 429 });
    }

    await base44.asServiceRole.entities.PartyPreference.create({
      family_id: event.family_id,
      event_id: event.id,
      guest_name: guestName,
      item_name: itemName,
      note,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}