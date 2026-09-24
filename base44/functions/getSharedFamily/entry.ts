import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.family_id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetId = String(body.family_id || '').trim();
    if (!targetId) return Response.json({ error: 'family_id is required' }, { status: 400 });

    // Verify an accepted sharing connection exists (either direction).
    // Only trust shares that were updated after creation: the FamilyShare update
    // rule restricts updates to the target family, so an accepted record with
    // updated_date > created_date proves the target family consented. A record
    // forged by the requester with status "accepted" at creation has equal dates.
    const isLegitAccepted = (share) =>
      share.status === 'accepted' &&
      new Date(share.updated_date).getTime() > new Date(share.created_date).getTime();

    const [outgoing, incoming] = await Promise.all([
      base44.asServiceRole.entities.FamilyShare.filter({ requester_family_id: user.family_id, target_family_id: targetId, status: 'accepted' }),
      base44.asServiceRole.entities.FamilyShare.filter({ requester_family_id: targetId, target_family_id: user.family_id, status: 'accepted' }),
    ]);
    if (![...outgoing, ...incoming].some(isLegitAccepted)) {
      return Response.json({ allowed: false });
    }

    const [fam, items, recipes] = await Promise.all([
      base44.asServiceRole.entities.Family.get(targetId).catch(() => null),
      base44.asServiceRole.entities.GroceryItem.filter({ family_id: targetId }, '-created_date', 100),
      base44.asServiceRole.entities.Recipe.filter({ family_id: targetId }, '-created_date', 100),
    ]);

    return Response.json({
      allowed: true,
      family: fam ? { id: fam.id, name: fam.name } : null,
      items: items.map((it) => ({
        id: it.id, name: it.name, brand: it.brand, barcode: it.barcode,
        image_url: it.image_url, category: it.category,
        quantity: it.quantity, unit: it.unit, expiration_date: it.expiration_date,
      })),
      recipes: recipes.map((r) => ({
        id: r.id, title: r.title, ingredients: r.ingredients,
        instructions: r.instructions, image_url: r.image_url, source: r.source,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}