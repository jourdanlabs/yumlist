import React from "react";
import { ThumbsUp, ThumbsDown, ShoppingCart, Megaphone } from "lucide-react";
import { useReactions } from "@/hooks/useReactions";
import { cn } from "@/lib/utils";

export default function SuggestionBoard({ suggestions, familyId, userId, recipes, onShop }) {
  const { countsFor, react } = useReactions(familyId, "suggestion", userId);

  if (!suggestions || suggestions.length === 0) return null;

  const handleShop = (s) => {
    const recipe = recipes.find((r) => r.id === s.recipe_id);
    if (recipe) onShop?.(recipe, s.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
        <Megaphone className="w-4 h-4" /> Family suggestions
      </div>
      {suggestions.map((s) => {
        const counts = countsFor(s.id);
        return (
          <div key={s.id} className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{s.recipe_title}</h3>
                <p className="text-xs text-muted-foreground">Suggested by {s.suggested_by_name || "a member"}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => react(s.id, "like")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                  counts.myReaction === "like"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-card text-green-600 border-green-200 hover:bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                )}
              >
                <ThumbsUp className="w-4 h-4" /> {counts.likes}
              </button>
              <button
                onClick={() => react(s.id, "dislike")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                  counts.myReaction === "dislike"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-card text-red-600 border-red-200 hover:bg-red-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                )}
              >
                <ThumbsDown className="w-4 h-4" /> {counts.dislikes}
              </button>
              <button
                onClick={() => handleShop(s)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" /> Shop for this
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}