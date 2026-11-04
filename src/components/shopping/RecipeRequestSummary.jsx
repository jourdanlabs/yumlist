import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

// Groups shopping items by the recipe they came from, listing who requested each.
export default function RecipeRequestSummary({ items }) {
  const requests = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const title = (item.recipe_title || "").trim();
      if (!title) return;
      const entry = (map[title] = map[title] || { recipe: title, requesters: new Set(), count: 0 });
      entry.count += 1;
      if (item.requested_by_name) entry.requesters.add(item.requested_by_name);
    });
    return Object.values(map)
      .map((e) => ({ ...e, requesters: [...e.requesters] }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  if (requests.length === 0) return null;

  return (
    <Card className="no-print">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ChefHat className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Recipe requests</h2>
          <span className="text-sm text-muted-foreground">{requests.length}</span>
        </div>
        <ul className="divide-y divide-border">
          {requests.map((r) => (
            <li key={r.recipe} className="py-2 first:pt-0 last:pb-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium italic">{r.recipe}</span>
              <span className="text-sm text-muted-foreground">
                · requested by{" "}
                <span className="font-medium text-foreground not-italic">
                  {r.requesters.length ? r.requesters.join(", ") : "a family member"}
                </span>
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {r.count} item{r.count === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}