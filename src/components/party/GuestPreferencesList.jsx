import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { capitalize } from "@/lib/utils";

function groupByGuest(preferences) {
  const guests = [];
  const index = {};
  preferences.forEach((p) => {
    const key = (p.guest_name || "").toLowerCase().trim();
    if (!(key in index)) {
      index[key] = guests.length;
      guests.push({ name: p.guest_name, items: [] });
    }
    guests[index[key]].items.push(p);
  });
  return guests;
}

export default function GuestPreferencesList({ preferences, onRemove }) {
  const guests = groupByGuest(preferences);

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          Guest requests{preferences.length > 0 ? ` · ${preferences.length}` : ""}
        </h2>

        {preferences.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-xl">
            No guest requests yet. Share the link or request by email and they will show up here.
          </div>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <div key={guest.name} className="rounded-xl border border-border p-3">
                <p className="font-medium text-sm mb-2">
                  {capitalize(guest.name)}
                  <span className="text-muted-foreground font-normal"> · {guest.items.length}</span>
                </p>
                <div className="space-y-1">
                  {guest.items.map((p) => (
                    <div key={p.id} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm break-words">{capitalize(p.item_name)}</p>
                        {p.note && <p className="text-xs text-muted-foreground break-words">{p.note}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        aria-label={`Remove ${p.item_name}`}
                        onClick={() => onRemove(p)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
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