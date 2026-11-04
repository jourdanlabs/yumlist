import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, ShoppingBasket, X } from "lucide-react";
import { cn, capitalize } from "@/lib/utils";

// Everything to buy on this trip: individual items plus the recipe ingredients you selected.
export default function BuyTodayList({ items, checked = {}, onToggle, onRemove }) {
  const individual = items.filter((i) => !(i.recipe_title || "").trim());
  const fromRecipes = items.filter((i) => (i.recipe_title || "").trim());
  const remaining = items.filter((i) => !checked[i.id]).length;

  if (items.length === 0) return null;

  const renderRow = (item) => {
    const isChecked = !!checked[item.id];
    return (
      <label
        key={item.id}
        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] cursor-pointer hover:bg-accent/40 transition-colors"
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle?.(item.id)}
          className="w-4 h-4 flex-shrink-0 rounded border-input accent-primary"
        />
        <div className="flex-1 min-w-0">
          <div className={cn("text-sm font-medium truncate", isChecked && "line-through text-muted-foreground")}>
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
        </div>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove?.(item.id); }}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Remove from buy today list"
        >
          <X className="w-4 h-4" />
        </button>
      </label>
    );
  };

  return (
    <Card className="no-print">
      <CardContent className="p-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <ShoppingBasket className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Buy today</h2>
          <span className="text-sm text-muted-foreground">
            {remaining === 0 ? "all items checked off" : `${remaining} left`}
          </span>
        </div>

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
      </CardContent>
    </Card>
  );
}