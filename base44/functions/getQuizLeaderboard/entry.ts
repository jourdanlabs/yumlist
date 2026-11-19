import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const myFamilyId = user?.data?.family_id;
    if (!myFamilyId) return Response.json({ families: [], me: user.id });

    // Connected families (accepted shares in either direction)
    const [outgoing, incoming] = await Promise.all([
      base44.asServiceRole.entities.FamilyShare.filter({ requester_family_id: myFamilyId, status: 'accepted' }),
      base44.asServiceRole.entities.FamilyShare.filter({ target_family_id: myFamilyId, status: 'accepted' }),
    ]);

    const familyIds = [myFamilyId];
    for (const share of [...outgoing, ...incoming]) {
      const other = share.requester_family_id === myFamilyId ? share.target_family_id : share.requester_family_id;
      if (other && !familyIds.includes(other)) familyIds.push(other);
    }

    const [scorePage, familyRows] = await Promise.all([
      base44.asServiceRole.entities.QuizScore.filter({ family_id: { $in: familyIds } }, { sort: '-created_date', limit: 1000 }),
      base44.asServiceRole.entities.Family.filter({ id: { $in: familyIds } }),
    ]);

    const scores = Array.isArray(scorePage) ? scorePage : scorePage.items || [];
    const families = Array.isArray(familyRows) ? familyRows : familyRows.items || [];

    const byFamily = new Map();
    for (const id of familyIds) byFamily.set(id, new Map());

    for (const score of scores) {
      const members = byFamily.get(score.family_id);
      if (!members) continue;
      const key = score.user_id || score.user_name;
      if (!key) continue;
      const entry = members.get(key) || {
        user_id: score.user_id,
        user_name: score.user_name || 'Family member',
        total_correct: 0,
        rounds: 0,
        best: 0,
      };
      if (score.user_name) entry.user_name = score.user_name;
      const correct = Number(score.correct) || 0;
      entry.total_correct += correct;
      entry.rounds += 1;
      entry.best = Math.max(entry.best, correct);
      members.set(key, entry);
    }

    const nameById = new Map(families.map((f) => [f.id, f.name]));
    const result = familyIds.map((id) => ({
      id,
      name: nameById.get(id) || 'Family',
      isMine: id === myFamilyId,
      members: [...byFamily.get(id).values()].sort(
        (a, b) => b.total_correct - a.total_correct || String(a.user_name).localeCompare(String(b.user_name))
      ),
    }));

    return Response.json({ families: result, me: user.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}