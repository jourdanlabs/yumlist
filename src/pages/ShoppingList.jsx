import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Loader2, Package, Printer, RefreshCw, ShoppingCart, CheckCheck, CalendarPlus, Search, Store, X, MapPin } from "lucide-react";
import ScheduleTripDialog from "@/components/ScheduleTripDialog";
import PantryPicker from "@/components/PantryPicker";
import BestPricesDialog from "@/components/BestPricesDialog";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { GROCERY_CATEGORIES, categoryStyle, normalizeCategory } from "@/lib/groceryCategories";
import { capitalize } from "@/lib/utils";

const RESTOCK_DEFAULT = 5;

export default function ShoppingList() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState({});
  const [restocking, setRestocking] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [atStore, setAtStore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);
  const [pricesOpen, setPricesOpen] = useState(false);

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

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("app:refresh", handler);
    return () => window.removeEventListener("app:refresh", handler);
  }, [familyId]);

  useEffect(() => { setVisibleCount(30); }, [query]);

  // Shopping list = items explicitly marked to buy (recipe ingredients auto-set this on creation)
  const shopping = useMemo(
    () => items.filter((i) => i.on_shopping_list),
    [items]
  );

  // Pantry items available to manually add (not already on the list)
  const pantryAvailable = useMemo(
    () => items.filter((i) => !i.on_shopping_list),
    [items]
  );

  const q = query.trim().toLowerCase();
  const filteredShopping = useMemo(
    () => q
      ? shopping.filter((i) =>
          (i.name || "").toLowerCase().includes(q) ||
          (i.brand || "").toLowerCase().includes(q) ||
          (i.recipe_title || "").toLowerCase().includes(q)
        )
      : shopping,
    [shopping, q]
  );

  const grouped = useMemo(() => {
    const order = GROCERY_CATEGORIES.reduce((acc, c, i) => { acc[c] = i; return acc; }, {});
    const groups = {};
    filteredShopping.slice(0, visibleCount).forEach((item) => {
      const cat = normalizeCategory(item.category) || "Other";
      (groups[cat] = groups[cat] || []).push(item);
    });
    return Object.keys(groups)
      .sort((a, b) => (order[a] ?? 99) - (order[b] ?? 99))
      .map((cat) => ({ category: cat, items: groups[cat] }));
  }, [filteredShopping, visibleCount]);

  const checkedIds = Object.keys(checked).filter((id) => checked[id]);
  const allChecked = filteredShopping.length > 0 && checkedIds.length === filteredShopping.length;

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const toggleAll = () => {
    if (allChecked) {
      setChecked({});
    } else {
      const next = {};
      filteredShopping.forEach((i) => { next[i.id] = true; });
      setChecked(next);
    }
  };

  const addToShopping = async (id) => {
    const prevItems = items;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, on_shopping_list: true } : i));
    try {
      await base44.entities.GroceryItem.update(id, { on_shopping_list: true });
    } catch (e) {
      setItems(prevItems);
      toast({ title: "Could not add to shopping list", variant: "destructive" });
    }
  };

  const removeFromShopping = async (id) => {
    const prevItems = items;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, on_shopping_list: false } : i));
    setChecked((c) => { const n = { ...c }; delete n[id]; return n; });
    try {
      await base44.entities.GroceryItem.update(id, { on_shopping_list: false });
    } catch (e) {
      setItems(prevItems);
      toast({ title: "Could not remove from shopping list", variant: "destructive" });
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
        checkedIds.map((id) => ({ id, quantity: RESTOCK_DEFAULT, on_shopping_list: false }))
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

  const notifyAtStore = async () => {
    setAtStore(true);
    try {
      const res = await base44.functions.invoke("notifyAtStore", {});
      const sent = res?.data?.sent ?? 0;
      if (sent > 0) {
        toast({ title: `Notified ${sent} family member${sent > 1 ? "s" : ""} you're at the store` });
      } else {
        toast({ title: "No other family members to notify", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Could not notify family", variant: "destructive" });
    } finally {
      setAtStore(false);
    }
  };

  const clearChecked = async () => {
    if (checkedIds.length === 0) {
      toast({ title: "Check off items first to clear them", variant: "destructive" });
      return;
    }
    setRestocking(true);
    try {
      await base44.entities.GroceryItem.bulkUpdate(
        checkedIds.map((id) => ({ id, quantity: RESTOCK_DEFAULT, on_shopping_list: false }))
      );
      toast({ title: `Cleared ${checkedIds.length} checked item${checkedIds.length > 1 ? "s" : ""} from your list` });
      setChecked({});
      await load();
    } catch (e) {
      toast({ title: "Could not clear checked items", variant: "destructive" });
    } finally {
      setRestocking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Shopping list
        </h1>
        <p className="text-sm text-muted-foreground">
          Recipe ingredients are added here automatically. Pick pantry items to restock from the list below.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button onClick={notifyAtStore} disabled={atStore}>
          {atStore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Store className="w-4 h-4 mr-2" />}
          At the Store
        </Button>
        {shopping.length > 0 && (
          <Button onClick={restockSelected} disabled={restocking || checkedIds.length === 0}>
            {restocking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Restock selected ({checkedIds.length})
          </Button>
        )}
        {shopping.length > 0 && (
          <Button onClick={() => setTripOpen(true)}>
            <CalendarPlus className="w-4 h-4 mr-2" /> Schedule trip
          </Button>
        )}
        {shopping.length > 0 && (
          <Button onClick={() => setPricesOpen(true)} className="bg-card text-foreground border border-input hover:bg-accent">
            <MapPin className="w-4 h-4 mr-2" /> Find best prices
          </Button>
        )}
        {shopping.length > 0 && (
          <Button className="bg-card text-foreground border border-input hover:bg-accent" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        )}
      </div>

      <ScheduleTripDialog open={tripOpen} onOpenChange={setTripOpen} itemCount={shopping.length} />
      <BestPricesDialog open={pricesOpen} onOpenChange={setPricesOpen} items={shopping} />

      <div className="relative rounded-lg border border-border bg-card p-2 no-print">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items while shopping…"
          className="pl-9 bg-card border-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="print-only mb-6">
        <h1 className="text-2xl font-bold">Shopping List</h1>
        <p className="text-sm text-muted-foreground">
          {user?.family_name || "YumList"} · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <hr className="my-3 border-black" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <>
          {filteredShopping.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {q ? "No items match your search." : "Your shopping list is empty. Request recipe ingredients or add pantry items below."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <CategorySection
                  key={group.category}
                  category={group.category}
                  items={group.items}
                  checked={checked}
                  onToggle={toggle}
                  onRemove={removeFromShopping}
                />
              ))}

              {filteredShopping.length > visibleCount && (
                <div className="flex justify-center pt-2 no-print">
                  <Button variant="outline" size="sm" onClick={() => setVisibleCount((c) => c + 30)}>
                    Load more ({filteredShopping.length - visibleCount} remaining)
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 no-print flex-wrap">
                <Button variant="outline" size="sm" onClick={toggleAll}>
                  {allChecked ? "Clear selection" : "Select all"}
                </Button>
                <Button
                  size="sm"
                  onClick={clearChecked}
                  disabled={restocking || checkedIds.length === 0}
                >
                  {restocking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCheck className="w-4 h-4 mr-2" />}
                  Clear checked ({checkedIds.length})
                </Button>
                <span className="text-sm text-muted-foreground">
                  {checkedIds.length} of {filteredShopping.length} selected
                </span>
              </div>
            </div>
          )}

          <PantryPicker items={pantryAvailable} onAdd={addToShopping} />
        </>
      )}
    </div>
  );
}

function CategorySection({ category, items, checked, onToggle, onRemove }) {
  if (items.length === 0) return null;
  return (
    <div className="print-break">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full no-print ${categoryStyle(category)}`}>
          {category}
        </span>
        <span className="text-sm text-muted-foreground no-print">{items.length}</span>
        <h2 className="print-only text-lg font-bold uppercase tracking-wide border-b border-black pb-1 mb-2">
          {category}
        </h2>
      </div>
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
                    {capitalize(item.name)}
                  </div>
                  {item.brand && <span className="text-xs text-muted-foreground truncate block mt-0.5">{item.brand}</span>}
                  {item.recipe_title && (
                    <span className="text-xs text-muted-foreground/80 truncate block mt-0.5 flex items-center gap-1">
                      <span className="no-print">For:</span>
                      <span className="italic">{item.recipe_title}</span>
                      {item.requested_by_name && <span className="no-print">· requested by {item.requested_by_name}</span>}
                    </span>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full whitespace-nowrap no-print ${qty <= 0 ? "bg-destructive/10 text-destructive" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>
                  <Package className="w-3 h-3" />
                  {qty <= 0 ? "Out of stock" : `${qty} ${unit}`}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(item.id); }}
                  className="no-print text-muted-foreground hover:text-destructive transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Remove from list"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="print-only text-sm text-muted-foreground whitespace-nowrap">
                  {qty <= 0 ? "(out of stock)" : `have ${qty} ${unit}`}
                  {item.recipe_title ? ` · ${item.recipe_title}` : ""}
                  {item.requested_by_name ? ` · by ${item.requested_by_name}` : ""}
                </span>
              </label>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}