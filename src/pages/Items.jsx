import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReactions } from "@/hooks/useReactions";
import ItemCard from "@/components/ItemCard";
import AddItemDialog from "@/components/AddItemDialog";
import ImportItemsDialog from "@/components/ImportItemsDialog";
import EditItemDialog from "@/components/EditItemDialog";

export default function Items() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const { countsFor, react, reload: reloadReactions } = useReactions(familyId, "item", user?.id);
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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

  useEffect(() => { load(); }, [familyId]);

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
    try {
      await base44.entities.ConsumptionLog.create({
        family_id: familyId,
        item_name: item.name,
        quantity: item.quantity || 1,
        consumed_date: new Date().toISOString().slice(0, 10),
      });
      await base44.entities.GroceryItem.delete(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast({ title: "Item removed", description: "Logged as consumed for weekly tracking." });
    } catch (e) {
      toast({ title: "Could not delete", variant: "destructive" });
    }
  };

  const filtered = items
    .filter((i) => !i.recipe_title)
    .filter((i) => {
      const q = query.toLowerCase();
      if (!q) return true;
      return (i.name || "").toLowerCase().includes(q) || (i.brand || "").toLowerCase().includes(q) || (i.category || "").toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Pantry</h1>
          <p className="text-sm text-muted-foreground">Grocery items your family has added.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-1" /> Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add item
          </Button>
        </div>
      </div>

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
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              counts={countsFor(item.id)}
              onReact={(r) => react(item.id, r)}
              onDelete={() => handleDelete(item)}
              onUpdate={(quantity) => handleUpdateQty(item, quantity)}
              onEdit={(it) => setEditing(it)}
            />
          ))}
        </div>
      )}

      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        familyId={familyId}
        onAdded={() => { load(); reloadReactions(); }}
      />
      <ImportItemsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        familyId={familyId}
        onImported={() => { load(); reloadReactions(); }}
      />
      <EditItemDialog
        open={!!editing}
        onOpenChange={(o) => { if (!o) setEditing(null); }}
        item={editing}
        onSaved={() => { load(); reloadReactions(); }}
      />
    </div>
  );
}