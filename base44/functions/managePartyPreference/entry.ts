import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_ITEM = 80;
const MAX_BRINGING = 120;
const MAX_NOTE = 300;
const MAX_FOOD = 200;

// Public: a guest edits or removes what they added. The invite token identifies
// the event and the per-row manage token proves it is their own entry.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const token = String(body.token || '').trim().slice(0, 64);
    const manageToken = String(body.manage_token || '').trim().slice(0, 64);
    const action = body.action === 'delete' ? 'delete' : 'update';

    if (!token || !manageToken) {
      return Response.json({ error: 'Missing invite or edit code' }, { status: 400 });
    }

    const { items } = await base44.asServiceRole.entities.PartyEvent.filter(
      { invite_token: token },
      { limit: 1 }
    );
    const event = (items || [])[0];
    if (!event) return Response.json({ error: 'This invite link is not active' }, { status: 404 });

    const { items: matches } = await base44.asServiceRole.entities.PartyPreference.filter(
      { event_id: event.id, manage_token: manageToken },
      { limit: 1 }
    );
    const preference = (matches || [])[0];
    if (!preference) {
      return Response.json({ error: 'That item is no longer on the list' }, { status: 404 });
    }

    if (action === 'delete') {
      await base44.asServiceRole.entities.PartyPreference.delete(preference.id);
      return Response.json({ ok: true, deleted: true });
    }

    const itemName = String(body.item_name || '').trim().slice(0, MAX_ITEM);
    const bringing = String(body.bringing || '').trim().slice(0, MAX_BRINGING);
    const dislikes = String(body.dislikes || '').trim().slice(0, MAX_FOOD);
    const allergies = String(body.allergies || '').trim().slice(0, MAX_FOOD);
    const note = String(body.note || '').trim().slice(0, MAX_NOTE);

    if (!itemName && !bringing && !dislikes && !allergies) {
      return Response.json(
        {
          error:
            'Keep at least one of these: something you would like, a dish you are bringing, a food you dislike, or an allergy',
        },
        { status: 400 }
      );
    }

    await base44.asServiceRole.entities.PartyPreference.update(preference.id, {
      item_name: itemName,
      bringing,
      dislikes,
      allergies,
      note,
    });

    return Response.json({
      ok: true,
      preference: { id: preference.id, item_name: itemName, bringing, dislikes, allergies, note },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}