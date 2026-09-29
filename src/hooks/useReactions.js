import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useReactions(familyId, targetType, userId) {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!familyId) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await base44.entities.Reaction.filter({ family_id: familyId, target_type: targetType });
      setReactions(r);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [familyId, targetType]);

  useEffect(() => { load(); }, [load]);

  const countsFor = (targetId) => {
    const forTarget = reactions.filter((r) => r.target_id === targetId);
    const likes = forTarget.filter((r) => r.reaction === "like").length;
    const dislikes = forTarget.filter((r) => r.reaction === "dislike").length;
    const neutrals = forTarget.filter((r) => r.reaction === "neutral").length;
    const mine = forTarget.find((r) => r.created_by_id === userId);
    return { likes, dislikes, neutrals, myReaction: mine ? mine.reaction : null };
  };

  const react = async (targetId, reaction) => {
    const existing = reactions.find((r) => r.target_id === targetId && r.created_by_id === userId);
    const snapshot = reactions;
    try {
      if (existing) {
        if (existing.reaction === reaction) {
          setReactions((prev) => prev.filter((r) => r.id !== existing.id));
          await base44.entities.Reaction.delete(existing.id);
        } else {
          const optimistic = { ...existing, reaction };
          setReactions((prev) => prev.map((r) => (r.id === existing.id ? optimistic : r)));
          const updated = await base44.entities.Reaction.update(existing.id, { reaction });
          setReactions((prev) => prev.map((r) => (r.id === existing.id ? updated : r)));
        }
      } else {
        const tempId = `temp_${Date.now()}`;
        const optimistic = { id: tempId, target_type: targetType, target_id: targetId, reaction, family_id: familyId, created_by_id: userId };
        setReactions((prev) => [...prev, optimistic]);
        const created = await base44.entities.Reaction.create({
          target_type: targetType,
          target_id: targetId,
          reaction,
          family_id: familyId,
        });
        setReactions((prev) => prev.map((r) => (r.id === tempId ? created : r)));
      }
    } catch (e) {
      setReactions(snapshot);
      throw e;
    }
  };

  return { reactions, loading, reload: load, countsFor, react };
}