import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ListChecks, X, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReactions } from "@/hooks/useReactions";
import { normalizeCategory } from "@/lib/groceryCategories";
import RecipeCard from "@/components/RecipeCard";
import AddRecipeDialog from "@/components/AddRecipeDialog";
import RecipeSuggestions from "@/components/RecipeSuggestions";
import RecipeFilters from "@/components/RecipeFilters";
import SuggestionBoard from "@/components/SuggestionBoard";

export default function Recipes() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const { countsFor, react, reload: reloadReactions } = useReactions(familyId, "recipe", user?.id);
  const { toast } = useToast();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [matchMode, setMatchMode] = useState("off"); // "off" | "one" | "all"
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [itemLikes, setItemLikes] = useState([]);
  const [planMode, setPlanMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [planning, setPlanning] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    if (!familyId) return;
    Promise.all([
      base44.entities.GroceryItem.filter({ family_id: familyId }),
      base44.entities.Reaction.filter({ family_id: familyId, target_type: "item" }),
    ]).then(([its, rx]) => {
      setItems(its);
      setItemLikes((rx || []).filter((r) => r.reaction === "like"));
    }).catch(() => {});
  }, [familyId]);

  // userId -> Set of lowercased liked item names
  const likedNamesByUser = useMemo(() => {
    const itemById = {};
    items.forEach((i) => { itemById[i.id] = i; });
    const map = {};
    itemLikes.forEach((r) => {
      const item = itemById[r.target_id];
      if (!item || !item.name) return;
      if (!map[r.created_by_id]) map[r.created_by_id] = new Set();
      map[r.created_by_id].add(item.name.toLowerCase());
    });
    return map;
  }, [items, itemLikes]);

  const allLikedNames = useMemo(() => {
    const s = new Set();
    Object.values(likedNamesByUser).forEach((set) => set.forEach((n) => s.add(n)));
    return s;
  }, [likedNamesByUser]);

  const recipeMatchesLikes = (recipe, mode) => {
    const ings = (recipe.ingredients || []).map((i) => (i || "").toLowerCase());
    const hasName = (name) => ings.some((i) => i.includes(name) || name.includes(i));
    if (mode === "one") return [...allLikedNames].some(hasName);
    const users = Object.keys(likedNamesByUser);
    if (users.length === 0) return false;
    return users.every((u) => [...likedNamesByUser[u]].some(hasName));
  };

  const load = async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      const data = await base44.entities.Recipe.filter({ family_id: familyId }, "-created_date");
      setRecipes(data);
    } catch (e) {
      toast({ title: "Could not load recipes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (!familyId) return;
    try {
      const data = await base44.entities.RecipeSuggestion.filter({ family_id: familyId, status: "active" }, "-created_date");
      setSuggestions(data);
    } catch (e) {}
  };

  useEffect(() => { load(); loadSuggestions(); }, [familyId]);

  useEffect(() => {
    const handler = () => { load(); loadSuggestions(); };
    window.addEventListener("app:refresh", handler);
    return () => window.removeEventListener("app:refresh", handler);
  }, [familyId]);

  useEffect(() => { setVisibleCount(30); }, [query, matchMode, selectedCategories]);

  const handleRequest = async (recipe) => {
    const ings = (recipe.ingredients || []).filter((i) => i && i.trim());
    if (ings.length === 0) {
      toast({ title: "This recipe has no ingredients to add", variant: "destructive" });
      return;
    }
    toast({ title: `Adding ${ings.length} ingredient${ings.length > 1 ? "s" : ""} from "${recipe.title}"…` });
    try {
      await base44.entities.GroceryItem.bulkCreate(
        ings.map((ing) => ({
          name: ing.trim(),
          family_id: familyId,
          quantity: 0,
          unit: "units",
          category: "Other",
          recipe_title: recipe.title,
          requested_by_name: user?.full_name || user?.email || "",
          on_shopping_list: true,
        }))
      );
      toast({ title: `Added ${ings.length} ingredient${ings.length > 1 ? "s" : ""} from "${recipe.title}" to your shopping list` });
    } catch (e) {
      toast({ title: "Could not request recipe — ingredients not added", variant: "destructive" });
    }
  };

  const handleSuggest = async (recipe) => {
    try {
      await base44.entities.RecipeSuggestion.create({
        family_id: familyId,
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        suggested_by_name: user?.full_name || user?.email || "",
        status: "active",
      });
      toast({ title: `Suggested "${recipe.title}" to your family` });
      loadSuggestions();
    } catch (e) {
      toast({ title: "Could not suggest recipe", variant: "destructive" });
    }
  };

  const handleShopSuggestion = async (recipe, suggestionId) => {
    await handleRequest(recipe);
    try {
      await base44.entities.RecipeSuggestion.update(suggestionId, { status: "shopped" });
      loadSuggestions();
    } catch (e) {}
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitPlanMode = () => {
    setPlanMode(false);
    setSelectedIds(new Set());
  };

  const planWeek = async () => {
    const selected = recipes.filter((r) => selectedIds.has(r.id));
    if (selected.length === 0) return;
    // Merge ingredients across selected recipes, deduping by normalized name.
    const merged = {};
    selected.forEach((recipe) => {
      (recipe.ingredients || []).forEach((ing) => {
        const trimmed = (ing || "").trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        if (!merged[key]) merged[key] = { name: trimmed, recipes: new Set() };
        merged[key].recipes.add(recipe.title);
      });
    });
    const records = Object.values(merged).map((m) => ({
      name: m.name,
      family_id: familyId,
      quantity: 0,
      unit: "units",
      category: "Other",
      recipe_title: [...m.recipes].join(", "),
      requested_by_name: user?.full_name || user?.email || "",
      on_shopping_list: true,
    }));
    setPlanning(true);
    try {
      await base44.entities.GroceryItem.bulkCreate(records);
      toast({ title: `Added ${records.length} ingredient${records.length > 1 ? "s" : ""} from ${selected.length} recipe${selected.length > 1 ? "s" : ""} to your shopping list` });
      exitPlanMode();
    } catch (e) {
      toast({ title: "Could not add ingredients", variant: "destructive" });
    } finally {
      setPlanning(false);
    }
  };

  const handleDelete = async (recipe) => {
    try {
      await base44.entities.Recipe.delete(recipe.id);
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      toast({ title: "Recipe removed" });
    } catch (e) {
      toast({ title: "Could not delete", variant: "destructive" });
    }
  };

  const likeUserCount = Object.keys(likedNamesByUser).length;
  const likeItemCount = allLikedNames.size;

  // Map lowercased ingredient names -> grocery category, and collect categories present in pantry
  const nameToCategory = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      if (i.name) map[i.name.toLowerCase()] = normalizeCategory(i.category) || "Other";
    });
    return map;
  }, [items]);

  const pantryCategories = useMemo(() => {
    const set = new Set(Object.values(nameToCategory));
    return [...set].sort();
  }, [nameToCategory]);

  const recipeCategories = (recipe) => {
    const cats = new Set();
    (recipe.ingredients || []).forEach((ing) => {
      const key = (ing || "").toLowerCase();
      if (nameToCategory[key]) cats.add(nameToCategory[key]);
    });
    return cats;
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMatchMode("off");
  };

  const filtered = recipes.filter((r) => {
    const q = query.toLowerCase();
    const matchesQuery = !q || (r.title || "").toLowerCase().includes(q) || (r.ingredients || []).some((i) => i.toLowerCase().includes(q));
    const matchesLikes = matchMode === "off" || recipeMatchesLikes(r, matchMode);
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((c) => recipeCategories(r).has(c));
    return matchesQuery && matchesLikes && matchesCategory;
  });

  const activeFilterCount = selectedCategories.length + (matchMode !== "off" ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg md:text-2xl font-semibold">Recipes</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Recipes your family has collected.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant={planMode ? "default" : "outline"}
            onClick={() => planMode ? exitPlanMode() : setPlanMode(true)}
          >
            <ListChecks className="w-4 h-4 mr-1" /> {planMode ? "Done" : "Plan week"}
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add recipe
          </Button>
        </div>
      </div>

      <div className="relative rounded-lg border border-border bg-card p-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes or ingredients…" className="pl-9 bg-card border-0 shadow-none focus-visible:ring-0" />
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        <RecipeFilters
          categories={pantryCategories}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          matchMode={matchMode}
          onMatchModeChange={setMatchMode}
          likeUserCount={likeUserCount}
          likeItemCount={likeItemCount}
          onClear={clearFilters}
          activeCount={activeFilterCount}
        />

        <div className="space-y-6">
          {matchMode !== "off" && (
            <RecipeSuggestions
              likedNames={allLikedNames}
              matchMode={matchMode}
              familyId={familyId}
              onSaved={load}
            />
          )}

          <SuggestionBoard
            suggestions={suggestions}
            familyId={familyId}
            userId={user?.id}
            recipes={recipes}
            onShop={handleShopSuggestion}
          />

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground">
                {matchMode !== "off" && likeItemCount > 0
                  ? "No recipes match the family's likes yet."
                  : matchMode !== "off"
                  ? "No likes yet — tap the thumbs-up on pantry items first."
                  : selectedCategories.length > 0
                  ? "No recipes use ingredients from the selected categories."
                  : query
                  ? "No recipes match your search."
                  : "No recipes yet. Add your first recipe."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filtered.slice(0, visibleCount).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    counts={countsFor(recipe.id)}
                    onReact={(r) => react(recipe.id, r)}
                    onDelete={() => handleDelete(recipe)}
                    onRequest={() => handleRequest(recipe)}
                    onSuggest={() => handleSuggest(recipe)}
                    alreadySuggested={suggestions.some((s) => s.recipe_id === recipe.id)}
                    selectable={planMode}
                    selected={selectedIds.has(recipe.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </div>

              {filtered.length > visibleCount && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + 30)}>
                    Load more ({filtered.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}

          {planMode && selectedIds.size > 0 && (
            <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card shadow-lg px-4 py-3">
              <div className="text-sm">
                <span className="font-medium">{selectedIds.size} recipe{selectedIds.size > 1 ? "s" : ""} selected</span>
                <span className="text-muted-foreground ml-2">
                  · {recipes.filter((r) => selectedIds.has(r.id)).reduce((n, r) => n + (r.ingredients || []).filter((i) => i && i.trim()).length, 0)} ingredients (merged)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
                <Button size="sm" onClick={planWeek} disabled={planning}>
                  <ShoppingCart className="w-4 h-4 mr-1" /> Add to shopping list
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddRecipeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        familyId={familyId}
        onAdded={() => { load(); reloadReactions(); }}
      />
    </div>
  );
}