import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Link2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AffiliateProgramRow from "@/components/admin/AffiliateProgramRow";

export default function AffiliateProgramsCard() {
  const [programs, setPrograms] = useState([]);
  const [clicks, setClicks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retailer, setRetailer] = useState("");
  const [template, setTemplate] = useState("");

  const load = async () => {
    const [list, agg] = await Promise.all([
      base44.entities.AffiliateProgram.list("-created_date", 100),
      base44.entities.AffiliateClick.aggregate({ groupBy: "retailer" }),
    ]);
    setPrograms(list);
    const counts = {};
    (agg?.rows || []).forEach((r) => { counts[r.retailer] = r.count; });
    setClicks(counts);
  };

  useEffect(() => {
    load().catch((e) => toast({ title: "Could not load affiliate programs", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!retailer.trim() || !template.trim()) {
      toast({ title: "Store name and link template are required", variant: "destructive" });
      return;
    }
    if (!template.includes("{query}")) {
      toast({ title: "Template needs {query}", description: "Where the item names should go in the link.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.AffiliateProgram.create({
        retailer: retailer.trim(),
        link_template: template.trim(),
        active: true,
      });
      setRetailer("");
      setTemplate("");
      await load();
      toast({ title: "Affiliate program added" });
    } catch (err) {
      toast({ title: "Could not add program", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (program, active) => {
    setPrograms((prev) => prev.map((p) => (p.id === program.id ? { ...p, active } : p)));
    try {
      await base44.entities.AffiliateProgram.update(program.id, { active });
    } catch (err) {
      toast({ title: "Could not update program", description: err.message, variant: "destructive" });
      load();
    }
  };

  const handleDelete = async (program) => {
    setPrograms((prev) => prev.filter((p) => p.id !== program.id));
    try {
      await base44.entities.AffiliateProgram.delete(program.id);
      toast({ title: "Program removed" });
    } catch (err) {
      toast({ title: "Could not remove program", description: err.message, variant: "destructive" });
      load();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="w-4 h-4" /> Affiliate links
        </CardTitle>
        <CardDescription>
          Add each store's affiliate link template. When a shopper taps "Shop at" in the price comparison, the link opens with your
          affiliate ID and the click is recorded. Use {"{query}"} where the item names should go.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="affiliateRetailer">Store name</Label>
            <Input
              id="affiliateRetailer"
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
              placeholder="Walmart"
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="affiliateTemplate">Link template</Label>
            <Input
              id="affiliateTemplate"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="https://www.amazon.com/s?k={query}&tag=YOUR-TAG-20"
              maxLength={500}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add
          </Button>
        </form>

        {loading ? (
          <div className="h-16 rounded-lg bg-muted animate-pulse" />
        ) : programs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No affiliate programs yet. Add one above and it will appear as a shop link for that store in Best Local Prices.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {programs.map((program) => (
              <AffiliateProgramRow
                key={program.id}
                program={program}
                clicks={clicks[program.retailer] || 0}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}