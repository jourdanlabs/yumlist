import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

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

export function useRecalls(familyId) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(!!familyId);

  useEffect(() => {
    if (!familyId) { setAlerts([]); setLoading(false); return; }
    let active = true;
    setLoading(true);
    load(familyId).then((list) => {
      if (!active) return;
      setAlerts(list || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [familyId]);

  return { alerts, loading };
}