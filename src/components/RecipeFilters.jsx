import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Users, X, Filter } from "lucide-react";
import { GROCERY_CATEGORIES, categoryStyle, normalizeCategory } from "@/lib/groceryCategories";

export default function RecipeFilters({
  categories,
  selectedCategories,
  onToggleCategory,
  matchMode,
  onMatchModeChange,
  likeUserCount,
  likeItemCount,
  onClear,
  activeCount,
}) {
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <Filter className="w-4 h-4" /> Filters
        </h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 px-2 text-xs">
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Family likes */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <ThumbsUp className="w-3.5 h-3.5" /> Family likes
        </div>
        <div className="space-y-1">
          {[
            { v: "off", label: "Off" },
            { v: "one", label: "Any member" },
            { v: "all", label: "All members" },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => onMatchModeChange(opt.v)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors ${
                matchMode === opt.v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {opt.v === "all" && <Users className="w-3.5 h-3.5" />}
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground px-1">
          {likeUserCount > 0
            ? `${likeUserCount} ${likeUserCount === 1 ? "member" : "members"} · ${likeItemCount} liked ${likeItemCount === 1 ? "item" : "items"}`
            : "No likes yet"}
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Category</div>
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1">No categories from your pantry items yet.</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const active = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-left transition-colors hover:bg-accent"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      active ? "bg-primary border-primary" : "border-input"
                    }`}
                  >
                    {active && <span className="w-2 h-2 rounded-sm bg-primary-foreground" />}
                  </span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryStyle(cat)}`}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}