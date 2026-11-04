import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, Loader2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

function ingredientsOf(recipe) {
  const names = [];
  const seen = new Set();
  (recipe.ingredients || []).forEach((ing) => {
    const trimmed = (ing || "").trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) return;
    seen.add(key);
    names.push(trimmed);
  });
  return names;
}

export default function RecipePicker({ familyId, userName, onAdded }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [checked, setChecked] = useState({});
  const [addingKey, setAddingKey] = useState(null);

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

  const toggleExpand = (recipe) => {
    if (expandedId === recipe.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(recipe.id);
    setChecked((c) => {
      if (c[recipe.id]) return c;
      const next = {};
      ingredientsOf(recipe).forEach((name) => { next[name] = true; });
      return { ...c, [recipe.id]: next };
    });
  };

  const toggleIngredient = (recipeId, name) => {
    setChecked((c) => ({ ...c, [recipeId]: { ...c[recipeId], [name]: !c[recipeId]?.[name] } }));
  };

  const addItems = async (recipe, names, key) => {
    if (names.length === 0) {
      toast({ title: "Select at least one ingredient", variant: "destructive" });
      return;
    }
    setAddingKey(key);
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
      toast({
        title: `Added ${names.length} item${names.length > 1 ? "s" : ""} from "${recipe.title}"`,
        description: userName ? `Requested by ${userName}` : undefined,
      });
      onAdded?.();
    } catch (e) {
      toast({ title: "Could not add ingredients", variant: "destructive" });
    } finally {
      setAddingKey(null);
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
              <CardContent className="p-0 divide-y divide-border max-h-96 overflow-y-auto overscroll-none">
                {filtered.map((recipe) => {
                  const names = ingredientsOf(recipe);
                  const isOpen = expandedId === recipe.id;
                  const picked = names.filter((n) => checked[recipe.id]?.[n]);
                  return (
                    <div key={recipe.id} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExpand(recipe)}
                          className="flex-1 min-w-0 text-left"
                          aria-expanded={isOpen}
                        >
                          <div className="font-medium truncate">{recipe.title}</div>
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {names.length} ingredient{names.length === 1 ? "" : "s"} · tap to choose
                          </span>
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addItems(recipe, names, `${recipe.id}-all`)}
                          disabled={addingKey === `${recipe.id}-all` || names.length === 0}
                        >
                          {addingKey === `${recipe.id}-all` ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3 mr-1" />
                          )}
                          Add all
                        </Button>
                      </div>

                      {isOpen && (
                        <div className="mt-3 space-y-1">
                          {names.map((name) => (
                            <label
                              key={name}
                              className="flex items-center gap-3 min-h-[44px] px-2 rounded-md hover:bg-accent/40 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={!!checked[recipe.id]?.[name]}
                                onChange={() => toggleIngredient(recipe.id, name)}
                                className="w-4 h-4 rounded border-input accent-primary"
                              />
                              <span className="text-sm">{name}</span>
                            </label>
                          ))}
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => addItems(recipe, picked, `${recipe.id}-some`)}
                              disabled={addingKey === `${recipe.id}-some` || picked.length === 0}
                            >
                              {addingKey === `${recipe.id}-some` ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3 mr-1" />
                              )}
                              Add selected ({picked.length})
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setExpandedId(null)}>
                              Done
                            </Button>
                          </div>
                        </div>
                      )}
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