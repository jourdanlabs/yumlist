import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const AGE_RANGES = ['under_13', '13_15', '16_17', '18_plus'];

// Lets the family owner set (or clear) the age range of a family member.
// The parent's value is stored in parent_age_range, which always wins over the
// range the member declared for themselves.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetId = typeof body.user_id === 'string' ? body.user_id : '';
    const range = typeof body.age_range === 'string' ? body.age_range : '';

    if (!targetId) return Response.json({ error: 'Pick a family member.' }, { status: 400 });
    if (range && !AGE_RANGES.includes(range)) {
      return Response.json({ error: 'Unknown age range.' }, { status: 400 });
    }

    const familyId = caller?.data?.family_id || caller?.family_id;
    if (!familyId) return Response.json({ error: 'You are not in a family yet.' }, { status: 400 });

    const target = await base44.asServiceRole.entities.User.get(targetId);
    if (!target || target.family_id !== familyId) {
      return Response.json({ error: 'That member is not in your family.' }, { status: 403 });
    }

    const family = await base44.asServiceRole.entities.Family.get(familyId).catch(() => null);
    const isParent = caller.role === 'admin' || (family && family.created_by_id === caller.id);
    if (!isParent) {
      return Response.json({ error: 'Only the family owner can set age ranges.' }, { status: 403 });
    }

    const saved = await base44.asServiceRole.entities.User.update(targetId, {
      parent_age_range: range || null,
    });
    return Response.json({ parent_age_range: saved?.parent_age_range || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}