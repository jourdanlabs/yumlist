import React from "react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Users } from "lucide-react";

export default function DietLibraryList({ diets, members = [], onToggle, onDelete, onScopeChange }) {
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

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Applies to
            </span>
            <Select
              value={diet.scope === "member" && diet.member_id ? `member:${diet.member_id}` : "family"}
              onValueChange={(value) => onScopeChange(diet, value)}
            >
              <SelectTrigger className="h-9 w-auto min-w-[180px] text-sm" aria-label={`Who ${diet.name} applies to`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Entire family</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={`member:${m.id}`}>
                    {m.display_name || m.full_name || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(diet.avoid_ingredients || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
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