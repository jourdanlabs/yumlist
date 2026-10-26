import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Checks the family's purchased and liked grocery items against the FDA food
// recall database (openFDA enforcement reports). No API key required.
const OPENFDA_URL = 'https://api.fda.gov/food/enforcement.json';
const MAX_ITEMS = 18;
const YEARS_BACK = 2;
const MAX_ALERTS = 10;
const PER_ITEM = 2;

const PREP_WORDS = new Set([
  'diced', 'chopped', 'sliced', 'cubed', 'minced', 'beaten', 'cooked', 'shredded',
  'grated', 'fresh', 'frozen', 'ripe', 'large', 'medium', 'small', 'jumbo',
]);

const UNIT_WORDS =
  '(cups?|cup|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|kg|ml|l|liters?|' +
  'cloves?|cans?|bags?|boxes?|packs?|units?|slices?|pieces?|bunches?|heads?)';

function asList(res) {
  if (Array.isArray(res)) return res;
  return (res && res.items) || [];
}

function normalize(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fdaDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// Pantry names are clean, but consumption history reads like "3 cups cooked white
// rice" — strip the amount, unit and prep words so the search term is the food.
function cleanItemName(raw) {
  let text = (raw || '').toString().trim();
  text = text.replace(/^[\d\s/.+-]+/, '');
  text = text.replace(new RegExp(`^${UNIT_WORDS}\\.?\\s*`, 'i'), '');
  text = text.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter((w) => w && !PREP_WORDS.has(w.toLowerCase()));
  const cleaned = words.join(' ').trim();
  return cleaned || text;
}

function searchTerm(name) {
  return (name || '').toString().replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 'brand' = the firm/product matches the brand we know; 'name' = name-only match
// that the family should eyeball against the recall description.
function classifyMatch(rec, name, brand) {
  const desc = normalize(rec.product_description);
  const itemKey = normalize(name);
  if (!itemKey) return null;

  const position = desc.indexOf(itemKey);
  if (position === -1) return null;

  const brandKey = normalize(brand);
  if (brandKey) {
    const firm = normalize(rec.recalling_firm);
    if (desc.includes(brandKey) || firm.includes(brandKey)) return 'brand';
    return null; // a known brand that is nowhere in the recall is not our product
  }

  // Without a brand, only accept a hit near the start of the description, where
  // the product identifies itself, not inside a later ingredient list.
  return position <= 80 ? 'name' : null;
}

async function queryRecalls(name, brand) {
  const term = searchTerm(name);
  if (!term) return [];

  const since = new Date();
  since.setFullYear(since.getFullYear() - YEARS_BACK);
  const search =
    `product_description:"${term}"` +
    `+AND+report_date:[${fdaDate(since)}+TO+${fdaDate(new Date())}]`;
  // encodeURI keeps the "+" separators intact while escaping spaces and quotes.
  const url = `${OPENFDA_URL}?search=${encodeURI(search)}&limit=20`;

  const resp = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  // openFDA answers 404 when nothing matches and 429 when throttled.
  if (!resp.ok) return [];

  const data = await resp.json();
  const results = Array.isArray(data.results) ? data.results : [];

  return results
    .filter((r) => (r.status || '') !== 'Terminated')
    .map((r) => ({ rec: r, match: classifyMatch(r, name, brand) }))
    .filter((x) => x.match)
    .sort((a, b) => (b.rec.report_date || '').localeCompare(a.rec.report_date || ''))
    .slice(0, PER_ITEM);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const familyId = user.family_id;
    if (!familyId) return Response.json({ alerts: [], checked: 0 });

    const [pantryRaw, consumedRaw, reactionsRaw, clearedRaw] = await Promise.all([
      base44.entities.GroceryItem.filter({ family_id: familyId }, { sort: '-created_date', limit: 200 }),
      base44.entities.ConsumptionLog.filter({ family_id: familyId }, { sort: '-consumed_date', limit: 200 }),
      base44.entities.Reaction.filter(
        { family_id: familyId, target_type: 'item', reaction: 'like' },
        { sort: '-created_date', limit: 200 }
      ),
      base44.entities.RecallDismissal.filter({ family_id: familyId }, { limit: 200 }),
    ]);

    const pantry = asList(pantryRaw);
    const consumed = asList(consumedRaw);
    const reactions = asList(reactionsRaw);
    const cleared = new Set(asList(clearedRaw).map((d: any) => d.alert_key));

    const pantryById = {};
    pantry.forEach((it) => { pantryById[it.id] = it; });

    const candidates = new Map();
    const addCandidate = (rawName, brand, source) => {
      const name = cleanItemName(rawName);
      if (name.length < 4) return;
      const key = normalize(name);
      if (!key) return;
      if (!candidates.has(key)) {
        candidates.set(key, { name, brand: (brand || '').toString().trim(), sources: new Set() });
      }
      const entry = candidates.get(key);
      if (!entry.brand && brand) entry.brand = brand.toString().trim();
      entry.sources.add(source);
    };

    reactions.forEach((r) => {
      const it = pantryById[r.target_id];
      if (it) addCandidate(it.name, it.brand, 'liked');
    });
    pantry.forEach((it) => {
      if (it.recipe_title) return;
      addCandidate(it.name, it.brand, 'purchased');
    });
    consumed.forEach((log) => addCandidate(log.item_name, '', 'consumed'));

    const list = Array.from(candidates.values()).slice(0, MAX_ITEMS);

    const alerts = [];
    for (let i = 0; i < list.length; i += 6) {
      const batch = list.slice(i, i + 6);
      const settled = await Promise.allSettled(batch.map((c) => queryRecalls(c.name, c.brand)));
      settled.forEach((res, idx) => {
        if (res.status !== 'fulfilled') return;
        const candidate = batch[idx];
        res.value.forEach(({ rec, match }) => {
          alerts.push({
            item_name: candidate.name,
            brand: candidate.brand,
            match,
            sources: Array.from(candidate.sources),
            recall: {
              recall_number: rec.recall_number || '',
              product_description: rec.product_description || '',
              reason_for_recall: rec.reason_for_recall || '',
              classification: rec.classification || '',
              status: rec.status || '',
              recalling_firm: rec.recalling_firm || '',
              distribution_pattern: rec.distribution_pattern || '',
              recall_initiation_date: rec.recall_initiation_date || '',
            },
          });
        });
      });
    }

    const seen = new Set();
    const deduped = alerts.filter((a) => {
      const key = `${normalize(a.item_name)}|${a.recall.recall_number}`;
      if (seen.has(key)) return false;
      seen.add(key);
      // Anything the family already cleared must not take up a MAX_ALERTS slot.
      return !cleared.has(key);
    });

    // Brand-confirmed matches first.
    deduped.sort((a, b) => (a.match === b.match ? 0 : a.match === 'brand' ? -1 : 1));

    return Response.json({ alerts: deduped.slice(0, MAX_ALERTS), checked: list.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}