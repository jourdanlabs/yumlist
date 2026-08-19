import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScanLine, Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function AddRecipeDialog({ open, onOpenChange, familyId, onAdded }) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [scanImage, setScanImage] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", ingredients: "", instructions: "", image_url: "", source: "" });

  const reset = () => {
    setForm({ title: "", ingredients: "", instructions: "", image_url: "", source: "" });
    setScanImage(null);
  };

  const handleScanImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setScanImage(file_url);
      setForm((f) => ({ ...f, image_url: file_url }));
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const extract = async () => {
    if (!scanImage) {
      toast({ title: "Upload a recipe photo first", variant: "destructive" });
      return;
    }
    setExtracting(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "Extract the recipe from this image. Return the recipe title, a list of ingredients (each as a short string with quantity), and the step-by-step instructions as plain text. If the source (book, website, author) is visible, include it.",
        file_urls: [scanImage],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            ingredients: { type: "array", items: { type: "string" } },
            instructions: { type: "string" },
            source: { type: "string" },
          },
        },
      });
      const data = res.data || res;
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        ingredients: Array.isArray(data.ingredients) ? data.ingredients.join("\n") : f.ingredients,
        instructions: data.instructions || f.instructions,
        source: data.source || f.source,
      }));
      toast({ title: "Recipe extracted", description: "Review and edit before saving." });
    } catch (e) {
      toast({ title: "Extraction failed", description: e.message, variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const handleManualImage = async (e) => {
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
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const ingredients = form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean);
      await base44.entities.Recipe.create({
        title: form.title.trim(),
        ingredients,
        instructions: form.instructions.trim(),
        image_url: form.image_url,
        source: form.source.trim() || "Manual entry",
        family_id: familyId,
      });
      toast({ title: "Recipe added" });
      reset();
      onOpenChange(false);
      onAdded();
    } catch (e) {
      toast({ title: "Could not add recipe", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add recipe</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="scan">Scan recipe</TabsTrigger>
          </TabsList>
          <TabsContent value="scan" className="pt-4 space-y-4">
            <div className="text-sm text-muted-foreground">
              Snap or upload a photo of a recipe card, book page, or screen — AI will extract the title, ingredients, and steps.
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                  <Upload className="w-4 h-4" /> Upload photo
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleScanImage} />
              </label>
              {scanImage && <span className="text-xs text-muted-foreground">Photo added</span>}
            </div>
            <Button onClick={extract} disabled={extracting || !scanImage} variant="secondary" className="w-full">
              {extracting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanLine className="w-4 h-4 mr-2" />}
              {extracting ? "Extracting…" : "Extract recipe"}
            </Button>
          </TabsContent>
          <TabsContent value="manual" className="pt-4 space-y-4">
            <RecipeForm form={form} setForm={setForm} onImage={handleManualImage} />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Add recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecipeForm({ form, setForm, onImage }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="r-title">Title *</Label>
        <Input id="r-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Grandma's lasagna" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-ing">Ingredients (one per line)</Label>
        <Textarea id="r-ing" rows={5} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} placeholder={"1 cup flour\n2 eggs\nPinch of salt"} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-inst">Instructions</Label>
        <Textarea id="r-inst" rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Mix and bake…" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-src">Source</Label>
        <Input id="r-src" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Family cookbook, website…" />
      </div>
      <div className="space-y-2">
        <Label>Photo</Label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
              <Upload className="w-4 h-4" /> Upload
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={onImage} />
          </label>
          {form.image_url && <span className="text-xs text-muted-foreground">Photo added</span>}
        </div>
      </div>
    </>
  );
}