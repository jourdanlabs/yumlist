import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Carrot, ChefHat, ThumbsUp, ArrowRight } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Home() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.family_id) return;
    let active = true;
    Promise.all([
      base44.entities.GroceryItem.filter({ family_id: user.family_id }, "-created_date", 5),
      base44.entities.Recipe.filter({ family_id: user.family_id }, "-created_date", 5),
    ]).then(([i, r]) => {
      if (active) { setItems(i); setRecipes(r); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.family_id]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {user?.family_name ? `${user.family_name}'s Pantry` : "Family Pantry"}
        </h1>
        <p className="text-muted-foreground mt-1">Track what your family loves — and what they don't.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Carrot} label="Grocery items" value={loading ? "—" : items.length === 5 ? "5+" : items.length} to="/items" />
        <StatCard icon={ChefHat} label="Recipes" value={loading ? "—" : recipes.length === 5 ? "5+" : recipes.length} to="/recipes" />
        <StatCard icon={ThumbsUp} label="Share your likes" value="" to="/share" wide />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg font-semibold">Recent items</h2>
            <Link to="/items" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              <SkeletonRows />
            ) : items.length === 0 ? (
              <Empty text="No items yet. Add your first grocery item." />
            ) : (
              items.map((it) => (
                <Card key={it.id}><CardContent className="py-3 px-4 flex items-center justify-between">
                  <span className="font-medium truncate">{it.name}</span>
                  <span className="text-xs text-muted-foreground truncate ml-2">{it.brand}</span>
                </CardContent></Card>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg font-semibold">Recent recipes</h2>
            <Link to="/recipes" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              <SkeletonRows />
            ) : recipes.length === 0 ? (
              <Empty text="No recipes yet. Add your first recipe." />
            ) : (
              recipes.map((r) => (
                <Card key={r.id}><CardContent className="py-3 px-4">
                  <span className="font-medium truncate block">{r.title}</span>
                  <span className="text-xs text-muted-foreground">{(r.ingredients || []).length} ingredients</span>
                </CardContent></Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to, wide }) {
  return (
    <Link to={to} className={`${wide ? "col-span-2 md:col-span-1" : ""}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-heading font-semibold leading-none">{value}</div>
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">{text}</div>;
}