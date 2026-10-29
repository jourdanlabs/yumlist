import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DietResultCard({ diet, onAdd, adding }) {
  const busy = adding === diet.name;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium">{diet.name}</h3>
          {diet.summary && <p className="text-sm text-muted-foreground">{diet.summary}</p>}
        </div>
        <Button size="sm" onClick={() => onAdd(diet)} disabled={busy} className="shrink-0">
          <Plus className="w-4 h-4 mr-1" /> {busy ? "Adding…" : "Add"}
        </Button>
      </div>
      {(diet.avoid_ingredients || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {diet.avoid_ingredients.slice(0, 8).map((k) => (
            <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              avoid {k}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}