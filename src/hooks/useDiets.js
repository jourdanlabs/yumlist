import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export function useDiets(familyId, userId) {
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      const data = await base44.entities.Diet.filter({ family_id: familyId }, "-created_date");
      setDiets(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      // leave the previous list in place
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    const handler = () => reload();
    window.addEventListener("app:refresh", handler);
    return () => window.removeEventListener("app:refresh", handler);
  }, [reload]);

  const activeDiets = diets.filter((d) => d.active);
  // A diet applies to me if it is family-wide or assigned to my account.
  const myDiets = activeDiets.filter((d) => d.scope !== "member" || d.member_id === userId);

  return { diets, activeDiets, myDiets, loading, reload };
}