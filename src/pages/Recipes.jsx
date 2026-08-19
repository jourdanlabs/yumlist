import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReactions } from "@/hooks/useReactions";
import RecipeCard from "@/components/RecipeCard";
import AddRecipeDialog from "@/components/AddRecipeDialog";

export default function Recipes() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const { countsFor, react, reload: reloadReactions } = useReactions(familyId, "recipe", user?.id);
  const { toast } = useToast();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

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

  useEffect(() => { load(); }, [familyId]);

  const handleDelete = async (recipe) => {
    try {
      await base44.entities.Recipe.delete(recipe.id);
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      toast({ title: "Recipe removed" });
    } catch (e) {
      toast({ title: "Could not delete", variant: "destructive" });
    }
  };

  const filtered = recipes.filter((r) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (r.title || "").toLowerCase().includes(q) || (r.ingredients || []).some((i) => i.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Recipes</h1>
          <p className="text-sm text-muted-foreground">Recipes your family has collected.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="flex-shrink-0">
          <Plus className="w-4 h-4 mr-1" /> Add recipe
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes or ingredients…" className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">{query ? "No recipes match your search." : "No recipes yet. Add your first recipe."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              counts={countsFor(recipe.id)}
              onReact={(r) => react(recipe.id, r)}
              onDelete={() => handleDelete(recipe)}
            />
          ))}
        </div>
      )}

      <AddRecipeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        familyId={familyId}
        onAdded={() => { load(); reloadReactions(); }}
      />
    </div>
  );
}