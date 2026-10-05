import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.data || !user.data.family_id) return Response.json({ error: 'No family set on user' }, { status: 400 });

    const body = await req.json();
    const itemName = (body && body.item_name || '').toString().trim();
    const flagType = (body && body.flag_type || '').toString().trim();
    if (!itemName) return Response.json({ error: 'Item name is required' }, { status: 400 });
    if (!['allergy', 'sensitivity'].includes(flagType)) return Response.json({ error: 'Invalid flag type' }, { status: 400 });

    const familyId = user.data.family_id;
    const action = (body && body.action || 'save').toString().trim();

    if (action === 'remove') {
      await base44.entities.AllergyFlag.deleteMany({ family_id: familyId, item_name: itemName });
      return Response.json({ ok: true, action: 'removed' });
    }

    const severity = ['mild', 'moderate', 'severe'].includes(body && body.severity) ? body.severity : 'moderate';
    const memberName = (body && body.member_name || '').toString().trim();
    const notes = (body && body.notes || '').toString().trim();

    const existing = await base44.entities.AllergyFlag.filter(
      { family_id: familyId, item_name: itemName, flag_type: flagType },
      "-created_date"
    );
    const list = Array.isArray(existing) ? existing : (existing && existing.items) || [];
    const existingFlag = list[0];

    if (existingFlag) {
      const updated = await base44.entities.AllergyFlag.update(existingFlag.id, {
        severity,
        member_name: memberName,
        notes
      });
      return Response.json({ ok: true, flag: updated, action: 'updated' });
    }

    const created = await base44.entities.AllergyFlag.create({
      family_id: familyId,
      item_name: itemName,
      flag_type: flagType,
      severity,
      member_name: memberName,
      notes
    });
    return Response.json({ ok: true, flag: created, action: 'created' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}