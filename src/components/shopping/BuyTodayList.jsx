import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChefHat, ShoppingBasket, Check, X } from "lucide-react";
import { cn, capitalize } from "@/lib/utils";

// Everything to buy on this trip: individual items plus the recipe ingredients you selected.
// Each row can be marked bought or skipped.
export default function BuyTodayList({ items, checked = {}, onToggle, onSkip, onRemove }) {
  const [open, setOpen] = useState(true);
  const individual = items.filter((i) => !(i.recipe_title || "").trim());
  const fromRecipes = items.filter((i) => (i.recipe_title || "").trim());
  const remaining = items.filter((i) => !checked[i.id]).length;

  if (items.length === 0) return null;

  const renderRow = (item) => {
    const status = checked[item.id];
    const bought = status === "bought";
    const skipped = status === "skipped";
    return (
      <div
        key={item.id}
        className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] hover:bg-accent/40 transition-colors"
      >
        <button
          type="button"
          onClick={() => onToggle?.(item.id)}
          className="flex-1 min-w-0 text-left"
        >
          <div
            className={cn(
              "text-sm font-medium truncate",
              bought && "line-through text-muted-foreground",
              skipped && "text-muted-foreground italic"
            )}
          >
            {capitalize(item.name)}
          </div>
          {item.recipe_title ? (
            <div className="text-xs sm:text-sm text-muted-foreground truncate italic">
              {item.recipe_title}
              {item.requested_by_name ? ` · ${item.requested_by_name}` : ""}
            </div>
          ) : (
            item.brand && <span className="text-xs text-muted-foreground truncate block">{item.brand}</span>
          )}
          {skipped && (
            <span className="inline-block mt-0.5 text-[11px] uppercase tracking-wide text-amber-600">Skipped</span>
          )}
        </button>
        <Button
          type="button"
          variant={bought ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle?.(item.id)}
          className={cn("text-xs px-2", bought && "bg-emerald-600 hover:bg-emerald-700 text-white")}
          aria-label={bought ? "Undo bought" : "Mark as bought"}
        >
          <Check className="w-3.5 h-3.5" />
          Bought
        </Button>
        <button
          type="button"
          onClick={() => onRemove?.(item.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Remove from buy today list"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <Card className="no-print">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center gap-2 px-4 py-3 min-h-[44px] text-left hover:bg-accent/40 transition-colors"
        >
          <ShoppingBasket className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Buy today</h2>
          <span className="text-sm text-muted-foreground">
            {remaining === 0 ? "all items marked" : `${remaining} left`}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 ml-auto text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="border-t border-border">
            {individual.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Individual items ({individual.length})
                </div>
                <div className="divide-y divide-border">{individual.map(renderRow)}</div>
              </div>
            )}

            {fromRecipes.length > 0 && (
              <div className="border-t border-border">
                <div className="px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5" /> From recipes ({fromRecipes.length})
                </div>
                <div className="divide-y divide-border">{fromRecipes.map(renderRow)}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}