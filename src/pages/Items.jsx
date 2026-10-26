import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload, Receipt, ScanLine } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReactions } from "@/hooks/useReactions";
import ItemCard from "@/components/ItemCard";
import AddItemDialog from "@/components/AddItemDialog";
import ImportItemsDialog from "@/components/ImportItemsDialog";
import ScanReceiptDialog from "@/components/ScanReceiptDialog";
import EditItemDialog from "@/components/EditItemDialog";
import FlagAllergyDialog from "@/components/FlagAllergyDialog";
import RecallNotices from "@/components/RecallNotices";
import { useRecalls } from "@/hooks/useRecalls";

export default function Items() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const { countsFor, react, reload: reloadReactions } = useReactions(familyId, "item", user?.id);
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState("manual");
  const [importOpen, setImportOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [flagging, setFlagging] = useState(null);
  const [allergyFlags, setAllergyFlags] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const { alerts, dismiss, dismissAll } = useRecalls(familyId);

  const openBarcodeScan = () => {
    setAddTab("scan");
    setAddOpen(true);
  };

  const handleAddOpenChange = (o) => {
    setAddOpen(o);
    if (!o) setAddTab("manual");
  };

  const load = async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      const data = await base44.entities.GroceryItem.filter({ family_id: familyId }, "-created_date");
      setItems(data);
    } catch (e) {
      toast({ title: "Could not load items", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadFlags = async () => {
    if (!familyId) return;
    try {
      const data = await base44.entities.AllergyFlag.filter({ family_id: familyId }, "-created_date");
      setAllergyFlags(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => { load(); loadFlags(); }, [familyId]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("app:refresh", handler);
    return () => window.removeEventListener("app:refresh", handler);
  }, [familyId]);

  useEffect(() => { setVisibleCount(30); }, [query]);

  const handleUpdateQty = async (item, quantity) => {
    const prevItems = items;
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity } : i));
    try {
      await base44.entities.GroceryItem.update(item.id, { quantity });
    } catch (e) {
      setItems(prevItems);
      toast({ title: "Could not update count", variant: "destructive" });
    }
  };

  const handleDelete = async (item) => {
    const prevItems = items;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await base44.entities.ConsumptionLog.create({
        family_id: familyId,
        item_name: item.name,
        quantity: item.quantity || 1,
        consumed_date: new Date().toISOString().slice(0, 10),
      });
      await base44.entities.GroceryItem.delete(item.id);
      toast({ title: "Item removed", description: "Logged as consumed for weekly tracking." });
    } catch (e) {
      setItems(prevItems);
      toast({ title: "Could not delete", variant: "destructive" });
    }
  };

  const recallByName = alerts.reduce((acc, a) => {
    const key = (a.item_name || "").toLowerCase().trim();
    if (key && !acc[key]) acc[key] = a;
    return acc;
  }, {});

  const flagsByName = allergyFlags.reduce((acc, f) => {
    const key = (f.item_name || "").toLowerCase();
    if (!acc[key]) acc[key] = f;
    return acc;
  }, {});

  const filtered = items
    .filter((i) => !i.recipe_title)
    .filter((i) => {
      const q = query.toLowerCase();
      if (!q) return true;
      return (i.name || "").toLowerCase().includes(q) || (i.brand || "").toLowerCase().includes(q) || (i.category || "").toLowerCase().includes(q);
    });

  const visibleFiltered = filtered.slice(0, visibleCount);
  const grouped = visibleFiltered.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Pantry</h1>
          <p className="text-sm text-muted-foreground">Grocery items your family has added.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <Button variant="outline" onClick={openBarcodeScan}>
            <ScanLine className="w-4 h-4 mr-1" /> Scan barcode
          </Button>
          <Button variant="outline" onClick={() => setReceiptOpen(true)}>
            <Receipt className="w-4 h-4 mr-1" /> Scan receipt
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-1" /> Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add item
          </Button>
        </div>
      </div>

      <RecallNotices alerts={alerts} onDismiss={dismiss} onDismissAll={dismissAll} />

      <div className="relative rounded-lg border border-border bg-card p-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items…" className="pl-9 bg-card border-0 shadow-none focus-visible:ring-0" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">{query ? "No items match your search." : "Your pantry is empty. Add your first item."}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
                {cat}
                <span className="text-sm font-normal text-muted-foreground">({grouped[cat].length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {grouped[cat].map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    counts={countsFor(item.id)}
                    onReact={(r) => react(item.id, r)}
                    onDelete={() => handleDelete(item)}
                    onUpdate={(quantity) => handleUpdateQty(item, quantity)}
                    onEdit={(it) => setEditing(it)}
                    allergyFlag={flagsByName[(item.name || "").toLowerCase()]}
                    recall={recallByName[(item.name || "").toLowerCase().trim()]}
                    onFlag={(it) => setFlagging(it)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > visibleCount && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + 30)}>
            Load more ({filtered.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      <AddItemDialog
        open={addOpen}
        onOpenChange={handleAddOpenChange}
        familyId={familyId}
        initialTab={addTab}
        onAdded={() => { load(); reloadReactions(); }}
      />
      <ImportItemsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        familyId={familyId}
        onImported={() => { load(); reloadReactions(); }}
      />
      <ScanReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        familyId={familyId}
        onImported={() => { load(); reloadReactions(); }}
      />
      <EditItemDialog
        open={!!editing}
        onOpenChange={(o) => { if (!o) setEditing(null); }}
        item={editing}
        onSaved={() => { load(); reloadReactions(); }}
      />
      <FlagAllergyDialog
        open={!!flagging}
        onOpenChange={(o) => { if (!o) setFlagging(null); }}
        itemName={flagging?.name}
        familyId={familyId}
        onFlagged={() => loadFlags()}
      />
    </div>
  );
}