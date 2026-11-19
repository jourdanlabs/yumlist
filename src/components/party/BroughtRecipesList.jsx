import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import { capitalize } from "@/lib/utils";

export default function BroughtRecipesList({ preferences }) {
  const dishes = preferences
    .filter((p) => (p.bringing || "").trim())
    .map((p) => ({ id: p.id, dish: p.bringing.trim(), guest: (p.guest_name || "").trim() }));

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-primary" />
          Recipes being brought{dishes.length > 0 ? ` · ${dishes.length}` : ""}
        </h2>

        {dishes.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-xl">
            No one has said what they are bringing yet. Guests can add a recipe or dish on the invite page.
          </div>
        ) : (
          <div className="space-y-2">
            {dishes.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium break-words">{capitalize(entry.dish)}</p>
                <p className="text-xs text-muted-foreground break-words">
                  {entry.guest ? `Bringing it: ${capitalize(entry.guest)}` : "Bringing it: a guest"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}