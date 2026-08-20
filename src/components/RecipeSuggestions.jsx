import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Plus, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function RecipeSuggestions({ likedNames, matchMode, familyId, onSaved }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  const find = async () => {
    const names = [...likedNames];
    if (names.length === 0) {
      toast({ title: "No liked items to match yet", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResults([]);
    setSavedIds(new Set());
    try {
      const modeText =
        matchMode === "all"
          ? "Each recipe MUST use ALL of these liked ingredients"
          : "Each recipe should use AT LEAST ONE of these liked ingredients";
      const prompt = `${modeText}: ${names.join(", ")}. Suggest 6 practical, family-friendly recipes. For each, return a title, a list of ingredients (with quantities), and brief step-by-step instructions. Keep instructions concise.`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  ingredients: { type: "array", items: { type: "string" } },
                  instructions: { type: "string" },
                },
              },
            },
          },
        },
      });
      setResults(res.recipes || []);
    } catch (e) {
      toast({ title: "Could not fetch suggestions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const save = async (recipe) => {
    try {
      await base44.entities.Recipe.create({
        title: recipe.title,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || "",
        family_id: familyId,
        source: "Suggested",
      });
      setSavedIds((prev) => new Set(prev).add(recipe.title));
      toast({ title: "Saved to your recipes" });
      onSaved?.();
    } catch (e) {
      toast({ title: "Could not save recipe", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={find} disabled={loading} variant="secondary">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {loading ? "Looking up recipes…" : "Auto-find recipes"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Suggests recipes from the family's {likedNames.size} liked {likedNames.size === 1 ? "item" : "items"} ({matchMode === "all" ? "all members" : "any member"}).
        </span>
      </div>

      {loading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {results.map((recipe, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <CardTitle className="text-base">{recipe.title}</CardTitle>
                <Button size="sm" variant="outline" onClick={() => save(recipe)} disabled={savedIds.has(recipe.title)}>
                  {savedIds.has(recipe.title) ? <Check className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                  {savedIds.has(recipe.title) ? "Saved" : "Save"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <div className="font-medium mb-1">Ingredients</div>
                  <ul className="text-muted-foreground list-disc pl-5 space-y-0.5">
                    {(recipe.ingredients || []).map((ing, i) => <li key={i}>{ing}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">Instructions</div>
                  <p className="text-muted-foreground whitespace-pre-line">{recipe.instructions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}