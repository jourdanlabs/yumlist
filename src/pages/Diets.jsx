import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Salad } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDiets } from "@/hooks/useDiets";
import DietResultCard from "@/components/diets/DietResultCard";
import DietLibraryList from "@/components/diets/DietLibraryList";

export default function Diets() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const { diets, loading, reload } = useDiets(familyId);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [adding, setAdding] = useState(null);

  const search = async () => {
    const q = query.trim();
    if (q.length < 2 || searching) return;
    setSearching(true);
    try {
      const res = await base44.functions.invoke("searchDiets", { query: q });
      setResults(res.data?.diets || []);
    } catch (e) {
      toast({ title: "Could not search diets", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const addDiet = async (diet) => {
    setAdding(diet.name);
    try {
      await base44.entities.Diet.create({
        family_id: familyId,
        name: diet.name,
        summary: diet.summary || "",
        avoid_ingredients: diet.avoid_ingredients || [],
        rules: diet.rules || [],
        active: false,
        source: "search",
      });
      await reload();
      toast({
        title: `${diet.name} added`,
        description: "Turn it on to apply it to your pantry and recipes.",
      });
    } catch (e) {
      toast({ title: "Could not add that diet", variant: "destructive" });
    } finally {
      setAdding(null);
    }
  };

  const toggleDiet = async (diet) => {
    try {
      await base44.entities.Diet.update(diet.id, { active: !diet.active });
      await reload();
    } catch (e) {
      toast({ title: "Could not update that diet", variant: "destructive" });
    }
  };

  const removeDiet = async (diet) => {
    try {
      await base44.entities.Diet.delete(diet.id);
      await reload();
      toast({ title: `${diet.name} removed` });
    } catch (e) {
      toast({ title: "Could not remove that diet", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-lg md:text-2xl font-semibold flex items-center gap-2">
          <Salad className="w-5 h-5 text-primary" /> Diets
        </h1>
        <p className="text-sm text-muted-foreground">
          Search for a diet, add it, then switch it on to flag pantry items and recipes that don't fit.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1 rounded-lg border border-border bg-card p-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") search(); }}
              placeholder="Search diets — keto, vegan, gluten-free…"
              className="pl-9 bg-card border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button onClick={search} disabled={searching || query.trim().length < 2} className="shrink-0">
            {searching ? "Searching…" : "Search"}
          </Button>
        </div>

        {results !== null && (
          <div className="space-y-3 pt-1">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No diets matched that search.</p>
            ) : (
              results.map((diet) => (
                <DietResultCard key={diet.name} diet={diet} onAdd={addDiet} adding={adding} />
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-base font-semibold">Family diets</h2>
        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <DietLibraryList diets={diets} onToggle={toggleDiet} onDelete={removeDiet} />
        )}
      </div>
    </div>
  );
}