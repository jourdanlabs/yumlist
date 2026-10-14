import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { normalizeCategory } from "@/lib/groceryCategories";

const UNITS = ["units", "packs", "boxes", "bottles", "cans", "bags", "kg", "g", "L", "mL"];

const normalizeUnit = (u) => (UNITS.includes(u) ? u : "units");

export default function ImportItemsDialog({ open, onOpenChange, familyId, onImported }) {
  const { toast } = useToast();
  const [stage, setStage] = useState("idle"); // idle | uploading | extracting | preview | importing | done
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState([]);
  const [errors, setErrors] = useState([]);
  const [result, setResult] = useState(null);

  const reset = () => {
    setStage("idle");
    setFileName("");
    setParsed([]);
    setErrors([]);
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
    setFileName(file.name);
    setStage("uploading");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
      setStage("extracting");
      const res = await base44.functions.invoke('extractPantryFile', { file_url: signed_url });
      const data = res.data;
      const rows = Array.isArray(data.output?.items) ? data.output.items : (Array.isArray(data.output) ? data.output : []);
      const valid = [];
      const invalid = [];
      rows.forEach((r, idx) => {
        if (!r || !String(r.name || "").trim()) {
          invalid.push(`Row ${idx + 1}: missing name`);
          return;
        }
        valid.push({
          name: String(r.name).trim(),
          brand: r.brand ? String(r.brand).trim() : "",
          barcode: r.barcode ? String(r.barcode).trim() : "",
          category: normalizeCategory(r.category ? String(r.category).trim() : ""),
          quantity: Number(r.quantity) > 0 ? Number(r.quantity) : 1,
          unit: normalizeUnit(r.unit ? String(r.unit).trim() : "units"),
          expiration_date: r.expiration_date ? String(r.expiration_date).trim() : "",
          family_id: familyId,
        });
      });
      setParsed(valid);
      setErrors(invalid);
      if (valid.length === 0) {
        setStage("idle");
        toast({ title: "No valid rows found", description: "Make sure your sheet has a 'name' column.", variant: "destructive" });
      } else {
        setStage("preview");
      }
    } catch (err) {
      setStage("idle");
      toast({ title: "Could not read spreadsheet", description: err.message, variant: "destructive" });
    }
  };

  const confirm = async () => {
    setStage("importing");
    try {
      const created = await base44.entities.GroceryItem.bulkCreate(parsed);
      setResult({ success: created.length, total: parsed.length });
      setStage("done");
      toast({ title: `${created.length} items imported` });
      onImported();
    } catch (err) {
      setStage("preview");
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
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
          <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Import pantry items</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 -mr-1 space-y-4">
          {stage === "idle" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload a CSV or Excel file of your pantry. We'll read the columns and add every row to your family pantry at once.
              </p>
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Expected columns</p>
                <p><code className="text-xs">name</code> (required), <code className="text-xs">brand</code>, <code className="text-xs">barcode</code>, <code className="text-xs">category</code>, <code className="text-xs">quantity</code>, <code className="text-xs">unit</code>, <code className="text-xs">expiration_date</code></p>
              </div>
              <label className="cursor-pointer block">
                <span className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 w-full">
                  <Upload className="w-4 h-4" /> Choose file
                </span>
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
              </label>
            </div>
          )}

          {(stage === "uploading" || stage === "extracting") && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {stage === "uploading" ? "Uploading file…" : "Reading spreadsheet rows…"}
              </p>
              {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
            </div>
          )}

          {stage === "preview" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">{parsed.length} item{parsed.length !== 1 ? "s" : ""} ready to import</span>
                {errors.length > 0 && (
                  <span className="text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-amber-500" /> {errors.length} skipped</span>
                )}
              </div>
              {errors.length > 0 && (
                <div className="max-h-24 overflow-y-auto rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700 space-y-0.5">
                  {errors.slice(0, 10).map((e, i) => <div key={i}>{e}</div>)}
                  {errors.length > 10 && <div>…and {errors.length - 10} more</div>}
                </div>
              )}
              <div className="max-h-64 overflow-y-auto overflow-x-auto rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Name</th>
                      <th className="text-left p-2 font-medium">Brand</th>
                      <th className="text-left p-2 font-medium">Category</th>
                      <th className="text-right p-2 font-medium">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((p, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-2">{p.name}</td>
                        <td className="p-2 text-muted-foreground">{p.brand || "—"}</td>
                        <td className="p-2 text-muted-foreground">{p.category}</td>
                        <td className="p-2 text-right">{p.quantity} {p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <p className="text-lg font-medium">{result.success} items imported</p>
              <p className="text-sm text-muted-foreground">Your pantry has been updated.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {stage === "preview" && (
            <>
              <Button variant="outline" onClick={() => { reset(); }}>Start over</Button>
              <Button onClick={confirm}>Import {parsed.length} items</Button>
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