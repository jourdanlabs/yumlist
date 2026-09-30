import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import BarcodeScanner from "@/components/BarcodeScanner";
import { GROCERY_CATEGORIES, detectCategory } from "@/lib/groceryCategories";
import VoiceButton from "@/components/VoiceButton";
import MobileSelect from "@/components/MobileSelect";

export default function AddItemDialog({ open, onOpenChange, familyId, onAdded, initialTab = "manual", onTabChange }) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [looking, setLooking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [form, setForm] = useState({ name: "", brand: "", barcode: "", category: "", image_url: "", quantity: 1, unit: "units", expiration_date: "" });

  const handleTabChange = (val) => {
    setActiveTab(val);
    onTabChange?.(val);
  };

  const reset = () => setForm({ name: "", brand: "", barcode: "", category: "", image_url: "", quantity: 1, unit: "units", expiration_date: "" });

  const handleDetected = async (code) => {
    setScanning(false);
    setLooking(true);
    try {
      const res = await base44.functions.invoke("lookupBarcode", { barcode: code });
      const data = res.data;
      if (data.found) {
        setForm({
          name: data.name || "",
          brand: data.brand || "",
          barcode: data.barcode,
          category: data.category || detectCategory(data.name) || "",
          image_url: data.image_url || "",
          quantity: 1,
          unit: "units",
          expiration_date: "",
        });
        toast({ title: "Product found", description: data.name || data.brand || "Prefilled from barcode" });
      } else {
        setForm((f) => ({ ...f, barcode: data.barcode || code }));
        toast({ title: "No match found", description: "Enter the details manually." });
      }
    } catch (e) {
      setForm((f) => ({ ...f, barcode: code }));
      toast({ title: "Lookup failed", description: "Enter the details manually.", variant: "destructive" });
    } finally {
      setLooking(false);
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, image_url: file_url }));
    } catch (err) {
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
      await base44.entities.GroceryItem.create({ ...form, family_id: familyId });
      toast({ title: "Item added to pantry" });
      reset();
      onOpenChange(false);
      onAdded();
    } catch (e) {
      toast({ title: "Could not add item", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add grocery item</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="overflow-y-auto pr-1 -mr-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="scan">Scan barcode</TabsTrigger>
          </TabsList>
          <TabsContent value="scan" className="pt-4">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <ScanLine className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Use your camera to scan a product barcode and auto-fill the details.</p>
              <Button onClick={() => setScanning(true)}>Start scanning</Button>
            </div>
          </TabsContent>
          <TabsContent value="manual" className="pt-4 space-y-4">
            <FormFields form={form} setForm={setForm} onImage={handleImage} looking={looking} />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || looking}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Add item
          </Button>
        </DialogFooter>
      </DialogContent>
      {scanning && (
        <BarcodeScanner onDetected={handleDetected} onClose={() => setScanning(false)} />
      )}
    </Dialog>
  );
}

function FormFields({ form, setForm, onImage, looking }) {
  return (
    <>
      {looking && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Looking up product…
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="i-name">Name *</Label>
        <div className="flex items-center gap-2">
          <Input
            id="i-name"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, name, category: f.category || detectCategory(name) }));
            }}
            placeholder="e.g. Whole milk"
            className="flex-1"
          />
          <VoiceButton onTranscript={(text) => {
            const name = (form.name ? form.name + " " : "") + text;
            setForm((f) => ({ ...f, name, category: f.category || detectCategory(name) }));
          }} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="i-brand">Brand</Label>
        <div className="flex items-center gap-2">
          <Input id="i-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Organic Valley" className="flex-1" />
          <VoiceButton onTranscript={(text) => setForm({ ...form, brand: (form.brand ? form.brand + " " : "") + text })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="i-cat">Category</Label>
          <MobileSelect
            id="i-cat"
            value={form.category}
            onChange={(val) => setForm({ ...form, category: val })}
            placeholder="Select…"
            label="Category"
            options={[{ value: "", label: "None" }, ...GROCERY_CATEGORIES.map((c) => ({ value: c, label: c }))]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="i-barcode">Barcode</Label>
          <Input id="i-barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Optional" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="i-qty">Quantity</Label>
          <Input id="i-qty" type="number" min="0" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="i-unit">Unit</Label>
          <MobileSelect
            id="i-unit"
            value={form.unit}
            onChange={(val) => setForm({ ...form, unit: val })}
            placeholder="Select…"
            label="Unit"
            options={["units", "packs", "boxes", "bottles", "cans", "bags", "kg", "g", "L", "mL"].map((u) => ({ value: u, label: u }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="i-exp">Expiration date</Label>
        <Input id="i-exp" type="date" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Image</Label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
              <Upload className="w-4 h-4" /> Upload
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={onImage} />
          </label>
          {form.image_url && <span className="text-xs text-muted-foreground">Image added</span>}
        </div>
      </div>
    </>
  );
}