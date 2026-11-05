import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Loader2, Printer, ShoppingCart, CheckCheck, CalendarPlus, ChefHat, Search, Store, X, MapPin, Check } from "lucide-react";
import ScheduleTripDialog from "@/components/ScheduleTripDialog";
import RecipePicker from "@/components/shopping/RecipePicker";
import RecipeRequestSummary from "@/components/shopping/RecipeRequestSummary";
import BuyTodayList from "@/components/shopping/BuyTodayList";
import BestPricesDialog from "@/components/BestPricesDialog";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { GROCERY_CATEGORIES, categoryStyle, normalizeCategory } from "@/lib/groceryCategories";
import { capitalize } from "@/lib/utils";

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

  // Items requested from a recipe are shown inside the recipe request list instead.
  const recipeShopping = useMemo(
    () => filteredShopping.filter((i) => !!(i.recipe_title || "").trim()),
    [filteredShopping]
  );

  // Every recipe-requested item, added or not, so each can be selected or rejected.
  const recipeRequests = useMemo(() => {
    const list = items.filter((i) => (i.recipe_title || "").trim());
    return q
      ? list.filter((i) =>
          (i.name || "").toLowerCase().includes(q) ||
          (i.recipe_title || "").toLowerCase().includes(q)
        )
      : list;
  }, [items, q]);

  const grouped = useMemo(() => {
    const order = GROCERY_CATEGORIES.reduce((acc, c, i) => { acc[c] = i; return acc; }, {});
    const groups = {};
    filteredShopping
      .filter((item) => !(item.recipe_title || "").trim())
      .slice(0, visibleCount)
      .forEach((item) => {
      const cat = normalizeCategory(item.category) || "Other";
      (groups[cat] = groups[cat] || []).push(item);
    });
    return Object.keys(groups)
      .sort((a, b) => (order[a] ?? 99) - (order[b] ?? 99))
      .map((cat) => ({ category: cat, items: groups[cat] }));
  }, [filteredShopping, visibleCount]);

  const boughtIds = Object.keys(checked).filter((id) => checked[id] === "bought");
  const skippedIds = Object.keys(checked).filter((id) => checked[id] === "skipped");
  const markedCount = boughtIds.length + skippedIds.length;
  const allChecked = filteredShopping.length > 0 && markedCount === filteredShopping.length;

  // Mark a row bought or skipped; tapping the same mark again clears it.
  // A bought recipe ingredient also notifies the person who requested it.
  const setStatus = (id, status) => {
    const next = checked[id] === status ? undefined : status;
    setChecked((c) => {
      const n = { ...c };
      if (next) n[id] = next;
      else delete n[id];
      return n;
    });
    const item = items.find((i) => i.id === id);
    if (!item?.recipe_title) return;
    const patch = next === "bought"
      ? { bought_at: new Date().toISOString(), bought_by_name: user?.display_name || user?.full_name || user?.email || "" }
      : { bought_at: null, bought_by_name: "" };
    base44.entities.GroceryItem.update(id, patch).catch(() => {
      toast({ title: "Could not update the requester's notification", variant: "destructive" });
    });
  };
  const toggle = (id) => setStatus(id, "bought");
  const skip = (id) => setStatus(id, "skipped");
  const toggleAll = () => {
    if (allChecked) {
      setChecked({});
    } else {
      const next = {};
      filteredShopping.forEach((i) => { next[i.id] = "bought"; });
      setChecked(next);
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

  // Add or reject a batch of recipe items in one go.
  const setRecipeItems = async (ids, on) => {
    if (!ids.length) return;
    const prevItems = items;
    const idSet = new Set(ids);
    setItems((prev) => prev.map((i) => idSet.has(i.id) ? { ...i, on_shopping_list: on } : i));
    if (!on) {
      setChecked((c) => {
        const next = { ...c };
        ids.forEach((id) => delete next[id]);
        return next;
      });
    }
    try {
      await base44.entities.GroceryItem.updateMany(
        { id: { $in: ids } },
        { $set: { on_shopping_list: on } }
      );
    } catch (e) {
      setItems(prevItems);
      toast({ title: on ? "Could not add to shopping list" : "Could not update shopping list", variant: "destructive" });
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

  // Finishing the trip logs one purchase per bought item (this is what the weekly chart counts)
  // and takes both bought and skipped items off the list.
  const finishTrip = async () => {
    if (markedCount === 0) {
      toast({ title: "Mark items as bought or skipped first", variant: "destructive" });
      return;
    }
    setRestocking(true);
    try {
      if (boughtIds.length) {
        const today = new Date().toISOString().slice(0, 10);
        await base44.entities.ConsumptionLog.bulkCreate(
          boughtIds.map((id) => ({
            family_id: familyId,
            item_name: items.find((i) => i.id === id)?.name || "",
            quantity: 1,
            consumed_date: today,
          }))
        );
      }
      await base44.entities.GroceryItem.updateMany(
        { id: { $in: [...boughtIds, ...skippedIds] } },
        { $set: { on_shopping_list: false } }
      );
      toast({
        title: `Logged ${boughtIds.length} purchase${boughtIds.length === 1 ? "" : "s"}`,
        description: skippedIds.length ? `${skippedIds.length} skipped` : undefined,
      });
      setChecked({});
      await load();
    } catch (e) {
      toast({ title: "Could not finish the trip", variant: "destructive" });
    } finally {
      setRestocking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Shop list
        </h1>
        <p className="text-sm text-muted-foreground">
          Add ingredients straight from a recipe to build your list.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button onClick={notifyAtStore} disabled={atStore} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {atStore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Store className="w-4 h-4 mr-2" />}
          At the Store
        </Button>
        {shopping.length > 0 && (
          <Button onClick={() => setTripOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
            <CalendarPlus className="w-4 h-4 mr-2" /> Schedule Trip
          </Button>
        )}
        {shopping.length > 0 && (
          <Button onClick={() => setPricesOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
            <MapPin className="w-4 h-4 mr-2" /> Find Best Prices
          </Button>
        )}
        {shopping.length > 0 && (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.print()}>
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
        <h1 className="text-2xl font-bold">Shop List</h1>
        <p className="text-sm text-muted-foreground">
          {user?.family_name || "YumList"} · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <hr className="my-3 border-black" />
        {recipeShopping.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold uppercase tracking-wide border-b border-black pb-1 mb-2">
              Recipe requests
            </h2>
            {Object.keys(
              recipeShopping.reduce((acc, i) => { acc[i.recipe_title] = true; return acc; }, {})
            ).map((title) => {
              const group = recipeShopping.filter((i) => i.recipe_title === title);
              return (
                <div key={title} className="mb-2">
                  <div className="text-sm font-semibold">
                    {title}
                    <span className="font-normal text-muted-foreground">
                      {" "}· requested by {group[0]?.requested_by_name || "a family member"}
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-sm">
                    {group.map((i) => <li key={i.id}>{capitalize(i.name)}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <>
          <BuyTodayList
            items={filteredShopping}
            checked={checked}
            onToggle={toggle}
            onSkip={skip}
            onRemove={removeFromShopping}
          />
          <RecipeRequestSummary
            items={recipeRequests}
            checked={checked}
            onToggle={toggle}
            onSkip={skip}
            onRemove={removeFromShopping}
            onSetState={setRecipeItems}
          />
          {filteredShopping.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {q ? "No items match your search." : "Your shopping list is empty. Add ingredients from a recipe below."}
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
                  {allChecked ? "Clear marks" : "Mark all bought"}
                </Button>
                <Button
                  size="sm"
                  onClick={finishTrip}
                  disabled={restocking || markedCount === 0}
                >
                  {restocking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCheck className="w-4 h-4 mr-2" />}
                  Finish trip ({markedCount})
                </Button>
                <span className="text-sm text-muted-foreground">
                  {boughtIds.length} bought · {skippedIds.length} skipped
                </span>
              </div>
            </div>
          )}

          <RecipePicker
            familyId={familyId}
            userName={user?.full_name || user?.email || ""}
            onAdded={load}
          />
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
            const status = checked[item.id];
            const bought = status === "bought";
            const skipped = status === "skipped";
            return (
              <div key={item.id} className="flex items-center gap-2 px-4 py-3 min-h-[44px] hover:bg-accent/40 transition-colors">
                <button
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className={`font-medium truncate ${bought ? "line-through text-muted-foreground" : skipped ? "text-muted-foreground italic" : ""}`}>
                    {capitalize(item.name)}
                  </div>
                  {item.brand && <span className="text-sm text-muted-foreground truncate block mt-0.5">{item.brand}</span>}
                  {item.recipe_title && (
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs sm:text-sm text-muted-foreground no-print">
                      <span className="inline-flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="italic">{item.recipe_title}</span>
                      </span>
                      <span>· requested by</span>
                      <span className="font-medium text-foreground">
                        {item.requested_by_name || "a family member"}
                      </span>
                    </div>
                  )}
                  {skipped && (
                    <span className="inline-block mt-1 text-[11px] uppercase tracking-wide text-amber-600 no-print">Skipped</span>
                  )}
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={bought ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggle(item.id)}
                      className={`no-print text-xs px-2 ${bought ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                      aria-label={bought ? "Undo bought" : "Mark as bought"}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Bought
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{bought ? "Undo bought" : "Mark as bought"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="no-print text-muted-foreground hover:text-destructive transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Remove from list"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove from list</TooltipContent>
                </Tooltip>
                <span className="print-only text-sm text-muted-foreground whitespace-nowrap">
                  {item.recipe_title ? ` · ${item.recipe_title}` : ""}
                  {item.requested_by_name ? ` · by ${item.requested_by_name}` : ""}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}