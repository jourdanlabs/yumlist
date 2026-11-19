import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_GUEST = 60;
const MAX_ITEM = 80;
const MAX_BRINGING = 120;
const MAX_NOTE = 300;
const MAX_FOOD = 200;
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
    const bringing = String(body.bringing || '').trim().slice(0, MAX_BRINGING);
    const dislikes = String(body.dislikes || '').trim().slice(0, MAX_FOOD);
    const allergies = String(body.allergies || '').trim().slice(0, MAX_FOOD);
    const note = String(body.note || '').trim().slice(0, MAX_NOTE);

    if (!token) return Response.json({ error: 'Missing invite code' }, { status: 400 });
    if (!guestName || (!itemName && !bringing && !dislikes && !allergies)) {
      return Response.json(
        {
          error:
            'Your name and at least one of these are required: something you would like, a dish you are bringing, a food you dislike, or an allergy',
        },
        { status: 400 }
      );
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

    const manageToken = crypto.randomUUID().replace(/-/g, '');

    const created = await base44.asServiceRole.entities.PartyPreference.create({
      family_id: event.family_id,
      event_id: event.id,
      guest_name: guestName,
      item_name: itemName,
      bringing,
      dislikes,
      allergies,
      note,
      manage_token: manageToken,
    });

    // The manage token is handed back only to the guest who added the row, so
    // they can change or remove it later without an account.
    return Response.json({
      ok: true,
      preference: {
        id: created.id,
        manage_token: manageToken,
        guest_name: guestName,
        item_name: itemName,
        bringing,
        dislikes,
        allergies,
        note,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}