import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Search, Check } from "lucide-react";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";

export default function FindRecipesDialog({ open, onOpenChange, familyId, onImported }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState([]);

  const search = async () => {
    const q = query.trim();
    if (q.length < 2 || searching) return;
    setSearching(true);
    try {
      const res = await base44.functions.invoke("searchRecipes", { query: q });
      setResults(res.data?.recipes || []);
      setSaved([]);
    } catch (e) {
      toast({ title: "Could not search recipes", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const save = async (recipe) => {
    setSaving(recipe.external_id);
    try {
      await base44.entities.Recipe.create({
        family_id: familyId,
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image_url: recipe.image_url || "",
        source: recipe.area ? `TheMealDB · ${recipe.area}` : "TheMealDB",
      });
      setSaved((list) => [...list, recipe.external_id]);
      toast({ title: `"${recipe.title}" saved` });
      onImported?.();
    } catch (e) {
      toast({ title: "Could not save that recipe", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find recipes</DialogTitle>
          <DialogDescription>
            Search a public recipe collection and save what you like to your family.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") search(); }}
              placeholder="Chicken, pasta, curry…"
              className="pl-9"
            />
          </div>
          <Button onClick={search} disabled={searching || query.trim().length < 2} className="shrink-0">
            {searching ? "Searching…" : "Search"}
          </Button>
        </div>

        {results !== null && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recipes matched that search.</p>
            ) : (
              results.map((recipe) => {
                const isSaved = saved.includes(recipe.external_id);
                return (
                  <div key={recipe.external_id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {recipe.image_url && (
                        <Image src={recipe.image_url} alt={recipe.title} className="w-full h-full" fittingType="fill" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{recipe.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {[recipe.category, recipe.area].filter(Boolean).join(" · ")} · {recipe.ingredients.length} ingredients
                      </p>
                      <Button
                        size="sm"
                        variant={isSaved ? "secondary" : "outline"}
                        className="mt-2"
                        disabled={isSaved || saving === recipe.external_id}
                        onClick={() => save(recipe)}
                      >
                        {isSaved ? <><Check className="w-4 h-4 mr-1" /> Saved</> : saving === recipe.external_id ? "Saving…" : "Save to my recipes"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}