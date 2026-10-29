// Matches a diet's "avoid" keywords against an item name or recipe text.
export function dietConflicts(diets, ...texts) {
  const text = texts.filter(Boolean).join(" ").toLowerCase();
  if (!text) return [];
  return (diets || []).filter((diet) =>
    (diet.avoid_ingredients || []).some((keyword) => {
      const k = String(keyword || "").trim().toLowerCase();
      return k.length >= 3 && text.includes(k);
    })
  );
}