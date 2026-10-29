import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Carrot, ChefHat, ThumbsUp, ArrowRight, AlertTriangle, PartyPopper } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { capitalize } from "@/lib/utils";
import ConsumptionChart from "@/components/ConsumptionChart";
import RecallBadge from "@/components/RecallBadge";
import { useRecalls } from "@/hooks/useRecalls";

const EXPIRY_WINDOW_DAYS = 3;

export default function Home() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const { alerts: recallAlerts, dismiss: dismissRecall } = useRecalls(user?.family_id);

  const recallByName = {};
  recallAlerts.forEach((a) => {
    const key = (a.item_name || "").toLowerCase().trim();
    if (key) recallByName[key] = a;
  });

  const load = () => {
    if (!user?.family_id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      base44.entities.GroceryItem.filter({ family_id: user.family_id }, "-created_date", 100),
      base44.entities.Recipe.filter({ family_id: user.family_id }, "-created_date", 100),
      base44.entities.GroceryItem.filter({ family_id: user.family_id }, "expiration_date", 100),
    ]).then(([i, r, all]) => {
      if (!active) return;
      setItems(i); setRecipes(r);
      const today = new Date();
      setExpiring(
        (all || [])
          .filter((it) => it.expiration_date)
          .map((it) => ({ ...it, daysLeft: differenceInCalendarDays(new Date(it.expiration_date), today) }))
          .filter((it) => it.daysLeft <= EXPIRY_WINDOW_DAYS)
          .sort((a, b) => a.daysLeft - b.daysLeft)
      );
      setLoading(false);
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  };

  useEffect(() => { load(); }, [user?.family_id]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("app:refresh", handler);
    return () => window.removeEventListener("app:refresh", handler);
  }, [user?.family_id]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-green-600">
          Our Pantry
        </h1>
        <p className="text-orange-700 mt-1 font-bold uppercase tracking-wide">Less Guessing. More Yum!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Carrot} label="Grocery items" value={loading ? "—" : items.length} to="/items" />
        <StatCard icon={ChefHat} label="Recipes" value={loading ? "—" : recipes.length} to="/recipes" />
        <StatCard icon={ThumbsUp} label="Share your likes" value="" to="/share" wide />
      </div>

      <Link to="/party" className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">Party guest list</div>
              <div className="text-sm text-muted-foreground">Ask guests by email what they would like, then clear it after the party.</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </Link>

      {!loading && expiring.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" /> Use them soon · {expiring.length}
            </h2>
            <Link to="/items" className="text-sm text-amber-700/80 dark:text-amber-400/80 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1">
              Pantry <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {expiring.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-2 rounded-lg bg-card border border-amber-500/20 px-3 py-2">
                <span className="font-medium text-sm truncate">{capitalize(it.name)}</span>
                <span className={`text-xs font-medium whitespace-nowrap ${it.daysLeft < 0 ? "text-destructive" : it.daysLeft === 0 ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}>
                  {it.daysLeft < 0 ? "Expired" : it.daysLeft === 0 ? "Today" : `${it.daysLeft}d left`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <ConsumptionChart familyId={user?.family_id} />

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
              items.slice(0, 5).map((it) => (
                <Card key={it.id}><CardContent className="py-3 px-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{capitalize(it.name)}</span>
                    <RecallBadge
                      recall={recallByName[(it.name || "").toLowerCase().trim()]}
                      onDismiss={dismissRecall}
                    />
                  </div>
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
              recipes.slice(0, 5).map((r) => (
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