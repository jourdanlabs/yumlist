import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { Trash2, ChevronDown, ShoppingCart, Check, Megaphone } from "lucide-react";
import ReactionBar from "@/components/ReactionBar";
import { cn } from "@/lib/utils";

export default function RecipeCard({ recipe, counts, onReact, onDelete, onRequest, onSuggest, alreadySuggested, selectable, selected, onToggleSelect }) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  return (
    <div className={cn(
      "group rounded-2xl border bg-card overflow-hidden transition-shadow hover:shadow-md",
      selected ? "border-primary ring-1 ring-primary" : "border-border"
    )}>
      <div className="flex gap-4 p-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {recipe.image_url ? (
            <Image src={recipe.image_url} alt={recipe.title} className="w-full h-full" fittingType="fill" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
          )}
          {selectable && (
            <button
              onClick={() => onToggleSelect(recipe.id)}
              className={cn(
                "absolute top-1 left-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]",
                selected ? "bg-primary border-primary text-primary-foreground" : "bg-white/80 border-border"
              )}
              aria-label={selected ? "Deselect recipe" : "Select recipe"}
            >
              {selected && <Check className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-medium truncate">{recipe.title}</h3>
              {recipe.source && <p className="text-xs md:text-sm text-muted-foreground truncate">From {recipe.source}</p>}
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{(recipe.ingredients || []).length} ingredients</p>
            </div>
            {onDelete && !selectable && (
              <button
                onClick={() => onDelete(recipe)}
                className="md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-destructive transition min-w-[44px] min-h-[44px]"
                aria-label="Delete recipe"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ReactionBar likes={counts.likes} dislikes={counts.dislikes} neutrals={counts.neutrals} myReaction={counts.myReaction} onReact={onReact} />
            <button
              onClick={() => setOpen((o) => !o)}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[44px] min-w-[44px] px-2 rounded-md"
            >
              {open ? "Hide" : "Details"}
              <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
            </button>
          </div>
          {(onRequest || onSuggest) && !selectable && (
            <div className="mt-3 flex gap-2">
              {onSuggest && (
                <button
                  onClick={onSuggest}
                  disabled={alreadySuggested}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium border transition-colors",
                    alreadySuggested
                      ? "bg-amber-500/10 text-amber-600 border-amber-300"
                      : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                  )}
                >
                  <Megaphone className="w-4 h-4" />
                  {alreadySuggested ? "Suggested" : "Suggest"}
                </button>
              )}
              {onRequest && (
                <button
                  onClick={() => { setRequested(true); onRequest(); }}
                  disabled={requested}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium border transition-colors",
                    requested
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-300"
                      : "bg-primary text-primary-foreground border-primary hover:bg-primary/90 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {requested ? "Added" : "Request"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 space-y-3 text-xs md:text-sm border-t border-border pt-4">
          <div>
            <div className="font-medium mb-1">Ingredients</div>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              {(recipe.ingredients || []).map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          {recipe.instructions && (
            <div>
              <div className="font-medium mb-1">Instructions</div>
              <p className="text-muted-foreground whitespace-pre-line">{recipe.instructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}