export function buildTasteSummary({ user, likes, dislikes }) {
  const name = user?.full_name || user?.email || "A family member";
  const lines = [`${name}'s tastes from ${user?.family_name || "YumList"}`, ""];
  if (likes.items.length) {
    lines.push("Grocery items I love:");
    likes.items.forEach((i) => lines.push(`  • ${i.name}${i.brand ? ` (${i.brand})` : ""}`));
    lines.push("");
  }
  if (likes.recipes.length) {
    lines.push("Recipes I love:");
    likes.recipes.forEach((r) => lines.push(`  • ${r.title}`));
    lines.push("");
  }
  if (dislikes.items.length) {
    lines.push("Grocery items I don't like:");
    dislikes.items.forEach((i) => lines.push(`  • ${i.name}${i.brand ? ` (${i.brand})` : ""}`));
    lines.push("");
  }
  if (dislikes.recipes.length) {
    lines.push("Recipes I don't like:");
    dislikes.recipes.forEach((r) => lines.push(`  • ${r.title}`));
  }
  if (!likes.items.length && !likes.recipes.length && !dislikes.items.length && !dislikes.recipes.length) {
    lines.push("No reactions yet — start tapping the thumbs-up or thumbs-down on items and recipes!");
  }
  return lines.join("\n");
}

export function buildRecipeText({ recipe, sharedBy, familyName }) {
  if (!recipe) return "";
  const lines = [`${recipe.title} — shared by ${sharedBy}${familyName ? ` from ${familyName}` : ""}`, ""];
  if (recipe.ingredients?.length) {
    lines.push("Ingredients:");
    recipe.ingredients.forEach((i) => lines.push(`  • ${i}`));
    lines.push("");
  }
  if (recipe.instructions) {
    lines.push("Instructions:");
    lines.push(recipe.instructions);
    lines.push("");
  }
  if (recipe.source) lines.push(`Source: ${recipe.source}`);
  return lines.join("\n");
}