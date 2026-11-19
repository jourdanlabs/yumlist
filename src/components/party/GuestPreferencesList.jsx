import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { capitalize } from "@/lib/utils";
import GuestFoodSummary from "@/components/party/GuestFoodSummary";

const guestKey = (name) => String(name || "").toLowerCase().trim();

function hasContent(p) {
  return Boolean(
    (p.item_name || "").trim() ||
      (p.bringing || "").trim() ||
      (p.dislikes || "").trim() ||
      (p.allergies || "").trim() ||
      (p.note || "").trim()
  );
}

function groupByGuest(preferences) {
  const guests = [];
  const index = {};
  preferences.filter(hasContent).forEach((p) => {
    const key = guestKey(p.guest_name);
    if (!(key in index)) {
      index[key] = guests.length;
      guests.push({ name: p.guest_name, items: [] });
    }
    guests[index[key]].items.push(p);
  });
  return guests;
}

function joined(entries, field) {
  const seen = [];
  entries.forEach((entry) => {
    const value = (entry[field] || "").trim();
    if (value && !seen.some((s) => s.toLowerCase() === value.toLowerCase())) seen.push(value);
  });
  return seen.join(" · ");
}

export default function GuestPreferencesList({ preferences, onRemove, foodInfo }) {
  const guests = groupByGuest(preferences);
  const allergies = foodInfo?.allergies || {};
  const dislikes = foodInfo?.dislikes || {};

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
            {guests.map((guest) => {
              const key = guestKey(guest.name);
              return (
                <div key={guest.name} className="rounded-xl border border-border p-3">
                  <p className="font-medium text-sm mb-2">
                    {capitalize(guest.name)}
                    <span className="text-muted-foreground font-normal"> · {guest.items.length}</span>
                  </p>

                  <GuestFoodSummary
                    allergies={allergies[key] || []}
                    dislikes={dislikes[key] || []}
                    enteredAllergies={joined(guest.items, "allergies")}
                    enteredDislikes={joined(guest.items, "dislikes")}
                  />

                  <div className="space-y-1">
                    {guest.items.map((p) => (
                      <div key={p.id} className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {p.item_name && <p className="text-sm break-words">{capitalize(p.item_name)}</p>}
                          {p.bringing && (
                            <p className="text-xs text-muted-foreground break-words">
                              Bringing {capitalize(p.bringing)}
                            </p>
                          )}
                          {p.note && <p className="text-xs text-muted-foreground break-words">{p.note}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          aria-label={`Remove ${p.item_name || "entry"}`}
                          onClick={() => onRemove(p)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}