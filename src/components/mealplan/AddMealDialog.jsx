import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Search } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function AddMealDialog({ open, onOpenChange, dateLabel, recipes, onPick, saving }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) =>
        (r.title || "").toLowerCase().includes(q) ||
        (r.ingredients || []).some((ing) => ing.toLowerCase().includes(q))
    );
  }, [recipes, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cook what on {dateLabel}?</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your recipes"
            className="pl-9"
          />
        </div>

        <div className="-mx-1 overflow-y-auto pr-1 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
              {recipes.length === 0 ? "No recipes saved yet." : "No recipes match that search."}
            </div>
          ) : (
            filtered.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => onPick(recipe)}
                disabled={saving}
                className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-2 text-left hover:bg-accent transition-colors disabled:opacity-60"
              >
                {recipe.image_url ? (
                  <Image
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-12 h-12 rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{recipe.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {(recipe.ingredients || []).length} ingredients
                  </div>
                </div>
                {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </button>
            ))
          )}
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link to="/recipes">Add a new recipe</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}