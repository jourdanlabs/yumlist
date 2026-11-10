import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user || !user.family_id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const start = String(body.start || '').trim();
    const end = String(body.end || '').trim();
    if (!DATE_RE.test(start) || !DATE_RE.test(end)) {
      return Response.json({ error: 'start and end (YYYY-MM-DD) are required' }, { status: 400 });
    }
    const span = (new Date(end).getTime() - new Date(start).getTime()) / DAY_MS;
    if (!(span >= 0) || span > 31) {
      return Response.json({ error: 'Date range must be 32 days or less' }, { status: 400 });
    }

    // Only trust accepted connections the other family consented to: the FamilyShare
    // update rule restricts updates to the target family, so updated_date > created_date
    // proves the target accepted rather than the requester forging status at creation.
    const isLegitAccepted = (share) =>
      share.status === 'accepted' &&
      new Date(share.updated_date).getTime() > new Date(share.created_date).getTime();

    const [outgoing, incoming] = await Promise.all([
      base44.asServiceRole.entities.FamilyShare.filter({ requester_family_id: user.family_id, status: 'accepted' }),
      base44.asServiceRole.entities.FamilyShare.filter({ target_family_id: user.family_id, status: 'accepted' }),
    ]);

    const partnerIds = [
      ...new Set(
        [...outgoing, ...incoming]
          .filter(isLegitAccepted)
          .map((s) => (s.requester_family_id === user.family_id ? s.target_family_id : s.requester_family_id))
          .filter((id) => id && id !== user.family_id)
      ),
    ].slice(0, 20);

    if (partnerIds.length === 0) return Response.json({ families: [] });

    const [families, plans] = await Promise.all([
      base44.asServiceRole.entities.Family.filter({ id: { $in: partnerIds } }),
      base44.asServiceRole.entities.MealPlan.filter(
        { family_id: { $in: partnerIds }, planned_date: { $gte: start, $lte: end } },
        'planned_date',
        300
      ),
    ]);

    return Response.json({
      families: partnerIds.map((id) => ({
        id,
        name: (families || []).find((f) => f.id === id)?.name || 'Family',
        meals: (plans || [])
          .filter((p) => p.family_id === id)
          .map((p) => ({
            id: p.id,
            planned_date: p.planned_date,
            recipe_id: p.recipe_id,
            recipe_title: p.recipe_title,
          })),
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}