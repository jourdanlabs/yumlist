import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { Trash2, ChevronDown, ShoppingCart } from "lucide-react";
import ReactionBar from "@/components/ReactionBar";
import { cn } from "@/lib/utils";

export default function RecipeCard({ recipe, counts, onReact, onDelete, onRequest }) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex gap-4 p-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {recipe.image_url ? (
            <Image src={recipe.image_url} alt={recipe.title} className="w-full h-full" fittingType="fill" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium truncate">{recipe.title}</h3>
              {recipe.source && <p className="text-sm text-muted-foreground truncate">From {recipe.source}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{(recipe.ingredients || []).length} ingredients</p>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(recipe)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                aria-label="Delete recipe"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <ReactionBar likes={counts.likes} dislikes={counts.dislikes} neutrals={counts.neutrals} myReaction={counts.myReaction} onReact={onReact} />
            <div className="flex items-center gap-3">
              {onRequest && (
                <button
                  onClick={() => { setRequested(true); onRequest(); }}
                  disabled={requested}
                  className={cn(
                    "text-xs flex items-center gap-1 px-2 py-1 rounded-full border transition-colors",
                    requested
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-300"
                      : "text-muted-foreground hover:text-foreground hover:border-foreground/30 border-border"
                  )}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {requested ? "Requested" : "Request this week"}
                </button>
              )}
              <button
                onClick={() => setOpen((o) => !o)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {open ? "Hide" : "Details"}
                <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 space-y-3 text-sm border-t border-border pt-4">
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