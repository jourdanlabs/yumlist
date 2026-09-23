import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { GROCERY_CATEGORIES } from "@/lib/groceryCategories";
import VoiceButton from "@/components/VoiceButton";

const UNITS = ["units", "packs", "boxes", "bottles", "cans", "bags", "kg", "g", "L", "mL"];

export default function EditItemDialog({ open, onOpenChange, item, onSaved }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        brand: item.brand || "",
        barcode: item.barcode || "",
        category: item.category || "",
        image_url: item.image_url || "",
        quantity: item.quantity ?? 1,
        unit: item.unit || "units",
        expiration_date: item.expiration_date || "",
      });
    }
  }, [item]);

  if (!form) return null;

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, image_url: file_url }));
    } catch {
      toast({ title: "Image upload failed", variant: "destructive" });
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.GroceryItem.update(item.id, { ...form, quantity: Number(form.quantity) || 0 });
      toast({ title: "Item updated" });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({ title: "Could not update item", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 -mr-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="e-name">Name *</Label>
            <div className="flex items-center gap-2">
              <Input id="e-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="flex-1" />
              <VoiceButton onTranscript={(text) => setForm({ ...form, name: (form.name ? form.name + " " : "") + text })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-brand">Brand</Label>
            <div className="flex items-center gap-2">
              <Input id="e-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="flex-1" />
              <VoiceButton onTranscript={(text) => setForm({ ...form, brand: (form.brand ? form.brand + " " : "") + text })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="e-cat">Category</Label>
              <select
                id="e-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select…</option>
                {GROCERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-barcode">Barcode</Label>
              <Input id="e-barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="e-qty">Quantity</Label>
              <Input id="e-qty" type="number" min="0" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-unit">Unit</Label>
              <select
                id="e-unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-exp">Expiration date</Label>
            <Input id="e-exp" type="date" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                  <Upload className="w-4 h-4" /> Upload
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
              {form.image_url && <span className="text-xs text-muted-foreground">Image set</span>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}