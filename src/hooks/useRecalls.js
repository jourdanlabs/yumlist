import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { recallKey } from "@/lib/recallKey";

// One request per family per session — the promise is shared so a page that
// renders the alert section and the item badges does not query twice.
const cache = new Map();

function load(familyId) {
  if (!cache.has(familyId)) {
    cache.set(
      familyId,
      base44.functions
        .invoke("checkRecalls", {})
        .then((res) => (res && res.data && res.data.alerts) || [])
        .catch(() => [])
    );
  }
  return cache.get(familyId);
}

// The alerts this family has already cleared.
function loadCleared(familyId) {
  return base44.entities.RecallDismissal.filter({ family_id: familyId }, { limit: 200 })
    .then((page) => new Set(((page && page.items) || []).map((d) => d.alert_key)))
    .catch(() => new Set());
}

export function useRecalls(familyId) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(!!familyId);

  useEffect(() => {
    if (!familyId) { setAlerts([]); setLoading(false); return; }
    let active = true;
    setLoading(true);
    Promise.all([load(familyId), loadCleared(familyId)]).then(([list, cleared]) => {
      if (!active) return;
      setAlerts((list || []).filter((a) => !cleared.has(recallKey(a))));
      setLoading(false);
    });
    return () => { active = false; };
  }, [familyId]);

  const dismiss = useCallback(async (alert) => {
    if (!familyId || !alert) return;
    const key = recallKey(alert);
    setAlerts((prev) => prev.filter((a) => recallKey(a) !== key));
    try {
      await base44.entities.RecallDismissal.create({ family_id: familyId, alert_key: key });
    } catch (e) {
      setAlerts((prev) => (prev.some((a) => recallKey(a) === key) ? prev : [alert, ...prev]));
      toast({ title: "Could not clear the alert", variant: "destructive" });
    }
  }, [familyId]);

  const dismissAll = useCallback(async () => {
    if (!familyId || alerts.length === 0) return;
    const cleared = alerts;
    setAlerts([]);
    try {
      await base44.entities.RecallDismissal.bulkCreate(
        cleared.map((a) => ({ family_id: familyId, alert_key: recallKey(a) }))
      );
      toast({ title: `Cleared ${cleared.length} recall alert${cleared.length === 1 ? "" : "s"}` });
    } catch (e) {
      setAlerts(cleared);
      toast({ title: "Could not clear the alerts", variant: "destructive" });
    }
  }, [familyId, alerts]);

  return { alerts, loading, dismiss, dismissAll };
}