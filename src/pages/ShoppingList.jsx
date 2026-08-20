import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Loader2, Package, RefreshCw, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { GROCERY_CATEGORIES, categoryStyle, normalizeCategory } from "@/lib/groceryCategories";

const LOW_THRESHOLD = 2;
const RESTOCK_DEFAULT = 5;

export default function ShoppingList() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState({});
  const [restocking, setRestocking] = useState(false);

  const load = async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      const data = await base44.entities.GroceryItem.filter({ family_id: familyId }, "name");
      setItems(data);
    } catch (e) {
      toast({ title: "Could not load pantry", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [familyId]);

  const shopping = useMemo(
    () => items.filter((i) => (i.quantity ?? 1) <= LOW_THRESHOLD),
    [items]
  );

  const finished = useMemo(() => shopping.filter((i) => (i.quantity ?? 1) <= 0), [shopping]);
  const low = useMemo(() => shopping.filter((i) => (i.quantity ?? 1) > 0), [shopping]);

  const checkedIds = Object.keys(checked).filter((id) => checked[id]);
  const allChecked = shopping.length > 0 && checkedIds.length === shopping.length;

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const toggleAll = () => {
    if (allChecked) {
      setChecked({});
    } else {
      const next = {};
      shopping.forEach((i) => { next[i.id] = true; });
      setChecked(next);
    }
  };

  const restockSelected = async () => {
    if (checkedIds.length === 0) {
      toast({ title: "Select items to restock", variant: "destructive" });
      return;
    }
    setRestocking(true);
    try {
      await base44.entities.GroceryItem.bulkUpdate(
        checkedIds.map((id) => ({ id, quantity: RESTOCK_DEFAULT }))
      );
      toast({ title: `Restocked ${checkedIds.length} item${checkedIds.length > 1 ? "s" : ""}` });
      setChecked({});
      await load();
    } catch (e) {
      toast({ title: "Could not restock", variant: "destructive" });
    } finally {
      setRestocking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" /> Shopping list
          </h1>
          <p className="text-sm text-muted-foreground">
            Auto-built from pantry items that are running low or finished.
          </p>
        </div>
        {shopping.length > 0 && (
          <Button onClick={restockSelected} disabled={restocking || checkedIds.length === 0}>
            {restocking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Restock selected ({checkedIds.length})
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : shopping.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Everything's well stocked — no items need restocking right now.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Section
            title="Finished"
            items={finished}
            checked={checked}
            onToggle={toggle}
            accent="destructive"
          />
          <Section
            title="Running low"
            items={low}
            checked={checked}
            onToggle={toggle}
            accent="amber"
          />

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={toggleAll}>
              {allChecked ? "Clear selection" : "Select all"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {checkedIds.length} of {shopping.length} selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, items, checked, onToggle, accent }) {
  if (items.length === 0) return null;
  const headerTone = accent === "destructive"
    ? "text-destructive"
    : "text-amber-600 dark:text-amber-400";
  return (
    <div>
      <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${headerTone}`}>
        {title} · {items.length}
      </h2>
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {items.map((item) => {
            const qty = item.quantity ?? 1;
            const unit = item.unit || "units";
            const isChecked = !!checked[item.id];
            return (
              <label key={item.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/40 transition-colors">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(item.id)}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.brand && <span className="text-xs text-muted-foreground truncate">{item.brand}</span>}
                    {item.category && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${categoryStyle(normalizeCategory(item.category))}`}>
                        {normalizeCategory(item.category)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full whitespace-nowrap ${qty <= 0 ? "bg-destructive/10 text-destructive" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>
                  <Package className="w-3 h-3" />
                  {qty <= 0 ? "Out of stock" : `${qty} ${unit}`}
                </span>
              </label>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}