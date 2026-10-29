import React from "react";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";

export default function DietLibraryList({ diets, onToggle, onDelete }) {
  if (!diets.length) {
    return (
      <div className="text-center py-10 border border-dashed border-border rounded-2xl">
        <p className="text-muted-foreground text-sm">No diets yet. Search above to add one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {diets.map((diet) => (
        <div key={diet.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium flex items-center gap-2">
                {diet.name}
                {diet.active && <span className="text-xs font-normal text-primary">Applied</span>}
              </h3>
              {diet.summary && <p className="text-sm text-muted-foreground">{diet.summary}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Switch
                checked={!!diet.active}
                onCheckedChange={() => onToggle(diet)}
                aria-label={`Apply ${diet.name} to my pantry and recipes`}
              />
              <button
                onClick={() => onDelete(diet)}
                aria-label={`Delete ${diet.name}`}
                className="text-muted-foreground hover:text-destructive transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {(diet.avoid_ingredients || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {diet.avoid_ingredients.map((k) => (
                <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}