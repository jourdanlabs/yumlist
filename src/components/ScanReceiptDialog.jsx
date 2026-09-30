import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, Loader2, Upload, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { normalizeCategory, detectCategory } from "@/lib/groceryCategories";

const UNITS = ["units", "packs", "boxes", "bottles", "cans", "bags", "kg", "g", "L", "mL"];
const normalizeUnit = (u) => (UNITS.includes(u) ? u : "units");

export default function ScanReceiptDialog({ open, onOpenChange, familyId, onImported }) {
  const { toast } = useToast();
  const [stage, setStage] = useState("idle"); // idle | uploading | extracting | preview | importing | done
  const [previewUrl, setPreviewUrl] = useState("");
  const [parsed, setParsed] = useState([]);
  const [result, setResult] = useState(null);

  const reset = () => {
    setStage("idle");
    setPreviewUrl("");
    setParsed([]);
    setResult(null);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!familyId) {
      toast({ title: "No family selected", variant: "destructive" });
      return;
    }
    reset();
    setStage("uploading");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
      setPreviewUrl(signed_url);
      setStage("extracting");
      const res = await base44.functions.invoke("extractReceiptItems", { file_url: signed_url });
      const data = res.data;
      const rows = Array.isArray(data.output?.items) ? data.output.items : (Array.isArray(data.output) ? data.output : []);
      const valid = rows
        .map((r) => {
          const name = String(r.name || "").trim();
          if (!name) return null;
          return {
            name,
            brand: r.brand ? String(r.brand).trim() : "",
            barcode: "",
            category: normalizeCategory(r.category ? String(r.category).trim() : "") || detectCategory(name) || "",
            quantity: Number(r.quantity) > 0 ? Number(r.quantity) : 1,
            unit: normalizeUnit(r.unit ? String(r.unit).trim() : "units"),
            expiration_date: r.expiration_date ? String(r.expiration_date).trim() : "",
            family_id: familyId,
          };
        })
        .filter(Boolean);

      if (valid.length === 0) {
        setStage("idle");
        toast({ title: "No items found", description: "Try a clearer photo of your receipt.", variant: "destructive" });
      } else {
        setParsed(valid);
        setStage("preview");
      }
    } catch (err) {
      setStage("idle");
      toast({ title: "Could not read receipt", description: err.message, variant: "destructive" });
    }
  };

  const updateRow = (idx, patch) => {
    setParsed((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const removeRow = (idx) => {
    setParsed((prev) => prev.filter((_, i) => i !== idx));
  };

  const confirm = async () => {
    if (parsed.length === 0) {
      toast({ title: "Nothing to add", variant: "destructive" });
      return;
    }
    setStage("importing");
    try {
      const created = await base44.entities.GroceryItem.bulkCreate(parsed);
      setResult({ success: created.length, total: parsed.length });
      setStage("done");
      toast({ title: `${created.length} items added to pantry` });
      onImported();
    } catch (err) {
      setStage("preview");
      toast({ title: "Could not add items", description: err.message, variant: "destructive" });
    }
  };

  const close = () => {
    if (stage === "done") reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && stage !== "uploading" && stage !== "extracting" && stage !== "importing") reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Receipt className="w-5 h-5" /> Scan receipt</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 -mr-1 space-y-4">
          {stage === "idle" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Snap or upload a photo of your grocery receipt. We'll detect the items and add them to your pantry so you can review before saving.
              </p>
              <label className="cursor-pointer block">
                <span className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 w-full">
                  <Upload className="w-4 h-4" /> Choose receipt photo
                </span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
              </label>
            </div>
          )}

          {(stage === "uploading" || stage === "extracting") && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              {previewUrl && (
                <img src={previewUrl} alt="Receipt" className="max-h-40 rounded-md border border-border object-contain" />
              )}
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {stage === "uploading" ? "Uploading receipt…" : "Reading items from receipt…"}
              </p>
            </div>
          )}

          {stage === "preview" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">{parsed.length} item{parsed.length !== 1 ? "s" : ""} detected</span>
                <span className="text-muted-foreground">Review and edit before adding.</span>
              </div>
              <div className="space-y-2">
                {parsed.map((p, i) => (
                  <div key={i} className="rounded-md border border-border p-2 space-y-2 bg-card">
                    <div className="flex items-center gap-2">
                      <Input
                        value={p.name}
                        onChange={(e) => updateRow(i, { name: e.target.value })}
                        placeholder="Item name"
                        className="flex-1 h-8 text-sm"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeRow(i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={p.brand}
                        onChange={(e) => updateRow(i, { brand: e.target.value })}
                        placeholder="Brand"
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        min="0"
                        value={p.quantity}
                        onChange={(e) => updateRow(i, { quantity: Number(e.target.value) || 1 })}
                        className="h-8 text-xs"
                      />
                      <Input
                        value={p.unit}
                        onChange={(e) => updateRow(i, { unit: normalizeUnit(e.target.value) })}
                        placeholder="unit"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {parsed.length === 0 && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> All items removed. Add manually instead.
                </p>
              )}
            </div>
          )}

          {stage === "importing" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Adding {parsed.length} items to your pantry…</p>
            </div>
          )}

          {stage === "done" && result && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="text-lg font-medium">{result.success} items added to pantry</p>
              <p className="text-sm text-muted-foreground">Your pantry has been updated.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {stage === "preview" && (
            <>
              <Button variant="outline" onClick={reset}>Start over</Button>
              <Button onClick={confirm} disabled={parsed.length === 0}>Add {parsed.length} items</Button>
            </>
          )}
          {stage === "done" && <Button onClick={close}>Done</Button>}
          {(stage === "idle" || stage === "uploading" || stage === "extracting" || stage === "importing") && (
            <Button variant="outline" onClick={close} disabled={stage === "uploading" || stage === "extracting" || stage === "importing"}>Cancel</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}