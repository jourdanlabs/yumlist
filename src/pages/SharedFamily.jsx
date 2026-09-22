import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Check, Carrot, ChefHat, ShieldOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { itemEmoji } from "@/lib/itemEmoji";

export default function SharedFamily() {
  const { familyId } = useParams();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const myFam = user?.family_id;

  const [family, setFamily] = useState(null);
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!myFam || !familyId) return;
      try {
        const [a, b] = await Promise.all([
          base44.entities.FamilyShare.filter({ requester_family_id: myFam, target_family_id: familyId, status: "accepted" }),
          base44.entities.FamilyShare.filter({ requester_family_id: familyId, target_family_id: myFam, status: "accepted" }),
        ]);
        if (!a.length && !b.length) { setAllowed(false); setLoading(false); return; }
        setAllowed(true);
        const [fam, its, recs] = await Promise.all([
          base44.entities.Family.get(familyId).catch(() => null),
          base44.entities.GroceryItem.filter({ family_id: familyId }, "-created_date", 100),
          base44.entities.Recipe.filter({ family_id: familyId }, "-created_date", 100),
        ]);
        if (!active) return;
        setFamily(fam);
        setItems(its);
        setRecipes(recs);
      } catch {}
      finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [myFam, familyId]);

  const flash = (id) => { setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); };

  const copyItem = async (it) => {
    try {
      await base44.entities.GroceryItem.create({
        name: it.name, brand: it.brand || "", barcode: it.barcode || "", image_url: it.image_url || "",
        category: it.category || "", quantity: it.quantity || 1, unit: it.unit || "units",
        expiration_date: it.expiration_date || "", family_id: myFam,
      });
      flash(it.id);
      toast({ title: `Copied ${it.name} to your pantry` });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const copyRecipe = async (r) => {
    try {
      await base44.entities.Recipe.create({
        title: r.title, ingredients: r.ingredients || [], instructions: r.instructions || "",
        image_url: r.image_url || "", source: r.source || "Shared", family_id: myFam,
      });
      flash(r.id);
      toast({ title: `Copied ${r.title} to your recipes` });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  if (!allowed) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <ShieldOff className="w-10 h-10 mx-auto text-muted-foreground" />
        <h1 className="font-heading text-xl font-semibold">Not sharing with this family</h1>
        <p className="text-sm text-muted-foreground">You don't have an active sharing connection with this family.</p>
        <Button variant="outline" onClick={() => navigate("/family")}>Back to Family</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/family")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-semibold">{family?.name || "Shared family"}</h1>
          <p className="text-sm text-muted-foreground">Viewing shared pantry · tap copy to add to yours</p>
        </div>
      </div>

      <Tabs defaultValue="pantry">
        <TabsList>
          <TabsTrigger value="pantry"><Carrot className="w-4 h-4 mr-1" /> Pantry ({items.length})</TabsTrigger>
          <TabsTrigger value="recipes"><ChefHat className="w-4 h-4 mr-1" /> Recipes ({recipes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pantry" className="space-y-2 mt-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No items in this pantry.</p>
          ) : (
            items.map((it) => (
              <Card key={it.id}>
                <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{itemEmoji(it.name)}</span>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {it.brand ? `${it.brand} · ` : ""}{it.quantity} {it.unit}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => copyItem(it)}>
                    {copiedId === it.id ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copiedId === it.id ? "Copied" : "Copy"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="recipes" className="space-y-2 mt-4">
          {recipes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No recipes shared.</p>
          ) : (
            recipes.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {(r.ingredients || []).length} ingredients{r.source ? ` · ${r.source}` : ""}
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => copyRecipe(r)}>
                    {copiedId === r.id ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copiedId === r.id ? "Copied" : "Copy"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}