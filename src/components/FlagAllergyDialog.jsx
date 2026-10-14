import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "@/components/MobileSelect";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const flagTypes = [
  { value: "allergy", label: "Allergy" },
  { value: "sensitivity", label: "Sensitivity" },
];

const severities = ["mild", "moderate", "severe"];

export default function FlagAllergyDialog({ open, onOpenChange, itemName, familyId, onFlagged }) {
  const { toast } = useToast();
  const [flagType, setFlagType] = useState("allergy");
  const [severity, setSeverity] = useState("moderate");
  const [memberName, setMemberName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [customMember, setCustomMember] = useState(false);

  useEffect(() => {
    if (open && familyId) {
      base44.entities.User.filter({ family_id: familyId })
        .then((res) => setMembers(Array.isArray(res) ? res : res.items || []))
        .catch(() => setMembers([]));
      setFlagType("allergy");
      setSeverity("moderate");
      setMemberName("");
      setNotes("");
      setCustomMember(false);
    }
  }, [open, familyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke("flagAllergy", {
        item_name: itemName,
        flag_type: flagType,
        severity,
        member_name: memberName,
        notes,
      });
      toast({
        title: `${flagType === "allergy" ? "Allergy" : "Sensitivity"} flagged`,
        description: `"${itemName}" flagged for your family.`,
      });
      onFlagged?.();
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Could not save flag", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag an allergy or sensitivity</DialogTitle>
          <DialogDescription>
            Mark &ldquo;{itemName}&rdquo; so your family knows to watch out for it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              {flagTypes.map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setFlagType(ft.value)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    flagType === ft.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {ft.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <div className="flex gap-2">
              {severities.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition ${
                    severity === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Who has it (optional)</Label>
            <MobileSelect
              value={customMember ? "__custom" : memberName || "none"}
              onChange={(val) => {
                if (val === "none") { setMemberName(""); setCustomMember(false); }
                else if (val === "__custom") { setMemberName(""); setCustomMember(true); }
                else { setMemberName(val); setCustomMember(false); }
              }}
              placeholder="Select a family member"
              label="Who has it"
              options={[
                { value: "none", label: "No one / skip" },
                ...members.map((m) => ({ value: m.full_name || m.email, label: m.full_name || m.email })),
                { value: "__custom", label: "Someone not listed…" },
              ]}
            />
            {customMember && (
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Type a name"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. reactions, alternatives…"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}