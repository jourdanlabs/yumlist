import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const guestKey = (name) => String(name || "").toLowerCase().trim();
const displayName = (user) => user?.display_name || user?.full_name || "";

// What the family already knows about each person's food restrictions:
// allergy/sensitivity flags by member name, and disliked pantry items or recipes
// by the person who reacted. Keyed by lowercased name so guests match on the
// name they used on the invite.
export default function useGuestFoodInfo(familyId) {
  const [info, setInfo] = useState({ allergies: {}, dislikes: {} });

  useEffect(() => {
    if (!familyId) return;
    let active = true;

    (async () => {
      const [flagRes, reactionRes, userRes] = await Promise.all([
        base44.entities.AllergyFlag.filter({ family_id: familyId }, { limit: 200 }),
        base44.entities.Reaction.filter(
          { family_id: familyId, reaction: "dislike" },
          { limit: 300 }
        ),
        base44.entities.User.filter({ family_id: familyId }),
      ]);

      const flags = flagRes.items || [];
      const reactions = (reactionRes.items || []).filter(
        (r) => r.target_type === "item" || r.target_type === "recipe"
      );
      const users = Array.isArray(userRes) ? userRes : userRes.items || [];
      const namesById = new Map(users.map((u) => [u.id, displayName(u)]));

      const itemIds = [...new Set(reactions.filter((r) => r.target_type === "item").map((r) => r.target_id))];
      const recipeIds = [...new Set(reactions.filter((r) => r.target_type === "recipe").map((r) => r.target_id))];

      const [itemRes, recipeRes] = await Promise.all([
        itemIds.length ? base44.entities.GroceryItem.filter({ id: { $in: itemIds } }) : [],
        recipeIds.length ? base44.entities.Recipe.filter({ id: { $in: recipeIds } }) : [],
      ]);

      const itemNames = new Map((itemRes.items || []).map((i) => [i.id, i.name]));
      const recipeNames = new Map((recipeRes.items || []).map((r) => [r.id, r.title]));

      const allergies = {};
      flags.forEach((flag) => {
        const key = guestKey(flag.member_name);
        if (!key) return;
        allergies[key] = [...(allergies[key] || []), flag];
      });

      const dislikes = {};
      reactions.forEach((reaction) => {
        const key = guestKey(namesById.get(reaction.created_by_id));
        if (!key) return;
        const label =
          reaction.target_type === "item"
            ? itemNames.get(reaction.target_id)
            : recipeNames.get(reaction.target_id);
        if (!label) return;
        const list = dislikes[key] || [];
        if (!list.some((name) => name.toLowerCase() === label.toLowerCase())) list.push(label);
        dislikes[key] = list;
      });

      if (active) setInfo({ allergies, dislikes });
    })().catch(() => {});

    return () => {
      active = false;
    };
  }, [familyId]);

  return info;
}