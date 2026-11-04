import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Recipe-requested items, grouped by recipe: each recipe expands to its ingredients.
// Items not yet on the list can be tapped to add them.
export default function RecipeRequestSummary({ items, checked = {}, onToggle, onRemove, onAdd }) {
  const [openRecipe, setOpenRecipe] = useState(null);

  const requests = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const title = (item.recipe_title || "").trim();
      if (!title) return;
      const entry = (map[title] = map[title] || { recipe: title, requesters: new Set(), items: [] });
      entry.items.push(item);
      if (item.requested_by_name) entry.requesters.add(item.requested_by_name);
    });
    return Object.values(map)
      .map((e) => ({ ...e, requesters: [...e.requesters] }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [items]);

  if (requests.length === 0) return null;

  return (
    <Card className="print-break no-print">
      <CardContent className="p-0 divide-y divide-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <ChefHat className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Recipe requests</h2>
          <span className="text-sm text-muted-foreground">{requests.length}</span>
        </div>
        {requests.map((r) => {
          const open = openRecipe === r.recipe;
          const added = r.items.filter((i) => i.on_shopping_list).length;
          return (
            <div key={r.recipe}>
              <button
                type="button"
                onClick={() => setOpenRecipe(open ? null : r.recipe)}
                className="w-full flex items-center gap-2 px-4 py-3 min-h-[44px] text-left hover:bg-accent/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium italic truncate">{r.recipe}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    Requested by {r.requesters.length ? r.requesters.join(", ") : "a family member"} · {added} of {r.items.length} on list
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
              </button>
              {open && (
                <div className="divide-y divide-border border-t border-border bg-muted/30">
                  {r.items.map((item) => {
                    const isChecked = !!checked[item.id];
                    if (!item.on_shopping_list) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onAdd?.(item.id)}
                          className="w-full flex items-center gap-3 pl-8 pr-4 py-2.5 min-h-[44px] text-left hover:bg-accent/40 transition-colors"
                        >
                          <Plus className="w-4 h-4 flex-shrink-0 text-primary" />
                          <span className="flex-1 min-w-0 text-sm truncate">{item.name}</span>
                          <span className="text-xs text-muted-foreground">Add</span>
                        </button>
                      );
                    }
                    return (
                      <label key={item.id} className="flex items-center gap-3 pl-8 pr-4 py-2.5 min-h-[44px] cursor-pointer hover:bg-accent/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggle?.(item.id)}
                          className="w-4 h-4 rounded border-input accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-sm truncate", isChecked && "line-through text-muted-foreground")}>
                            {item.name}
                          </div>
                          {item.brand && <span className="text-xs text-muted-foreground truncate block">{item.brand}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove?.(item.id); }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Remove from list"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}