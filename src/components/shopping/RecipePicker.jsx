import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, Loader2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function RecipePicker({ familyId, userName, onAdded }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (!open || !familyId || recipes !== null) return;
    setLoading(true);
    base44.entities.Recipe.filter({ family_id: familyId }, "title")
      .then((data) => setRecipes(Array.isArray(data) ? data : data?.items || []))
      .catch(() => {
        setRecipes([]);
        toast({ title: "Could not load recipes", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [open, familyId, recipes]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const list = recipes || [];
    if (!q) return list;
    return list.filter((r) =>
      (r.title || "").toLowerCase().includes(q) ||
      (r.ingredients || []).some((i) => (i || "").toLowerCase().includes(q))
    );
  }, [recipes, q]);

  const addRecipe = async (recipe) => {
    const names = [];
    const seen = new Set();
    (recipe.ingredients || []).forEach((ing) => {
      const trimmed = (ing || "").trim();
      const key = trimmed.toLowerCase();
      if (!trimmed || seen.has(key)) return;
      seen.add(key);
      names.push(trimmed);
    });
    if (names.length === 0) {
      toast({ title: "This recipe has no ingredients to add", variant: "destructive" });
      return;
    }
    setAddingId(recipe.id);
    try {
      await base44.entities.GroceryItem.bulkCreate(
        names.map((name) => ({
          name,
          family_id: familyId,
          category: "Other",
          recipe_title: recipe.title,
          requested_by_name: userName || "",
          on_shopping_list: true,
        }))
      );
      toast({ title: `Added ${names.length} ingredient${names.length > 1 ? "s" : ""} from "${recipe.title}"` });
      onAdded?.();
    } catch (e) {
      toast({ title: "Could not add ingredients", variant: "destructive" });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="pt-2 no-print">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 min-h-[44px] px-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add from a recipe
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="relative rounded-lg border border-border bg-card p-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes or ingredients…"
              className="pl-9 bg-card border-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 py-6 text-center border border-dashed border-border rounded-xl">
              {q ? "No recipes match your search." : "No recipes yet. Add one on the Recipes page."}
            </p>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border max-h-80 overflow-y-auto overscroll-none">
                {filtered.map((recipe) => {
                  const count = (recipe.ingredients || []).filter((i) => i && i.trim()).length;
                  return (
                    <div key={recipe.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{recipe.title}</div>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          {count} ingredient{count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addRecipe(recipe)}
                        disabled={addingId === recipe.id}
                      >
                        {addingId === recipe.id ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3 mr-1" />
                        )}
                        Add
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}