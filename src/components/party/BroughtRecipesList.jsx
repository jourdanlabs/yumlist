import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import { capitalize } from "@/lib/utils";

function groupByGuest(preferences) {
  const guests = [];
  const index = {};
  preferences.forEach((p) => {
    const key = (p.guest_name || "").toLowerCase().trim();
    if (!(key in index)) {
      index[key] = guests.length;
      guests.push({ name: p.guest_name, dishes: [] });
    }
    guests[index[key]].dishes.push(p.bringing);
  });
  return guests;
}

export default function BroughtRecipesList({ preferences }) {
  const bringing = preferences.filter((p) => (p.bringing || "").trim());
  const guests = groupByGuest(bringing);

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-primary" />
          Recipes being brought{guests.length > 0 ? ` · ${guests.length}` : ""}
        </h2>

        {guests.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-xl">
            No one has said what they are bringing yet. Guests can add a recipe or dish on the invite page.
          </div>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <div key={guest.name} className="rounded-xl border border-border p-3">
                <p className="font-medium text-sm mb-1">{capitalize(guest.name)}</p>
                <div className="space-y-1">
                  {guest.dishes.map((dish, i) => (
                    <p key={`${dish}-${i}`} className="text-sm break-words">
                      {capitalize(dish)}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}