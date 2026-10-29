import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PartyPopper } from "lucide-react";

export default function CreatePartyForm({ onCreate }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Give the party a name so guests know what it is."); return; }
    setError("");
    setSaving(true);
    try {
      await onCreate({ name: name.trim(), event_date: date });
    } catch (err) {
      setError("Could not start the party list. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PartyPopper className="w-4 h-4 text-primary" />
            Start a party list to collect guest preferences. It stays until you clear it.
          </div>
          <div className="space-y-2">
            <Label htmlFor="party-name">Party name</Label>
            <Input
              id="party-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Saturday cookout"
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="party-date">Date (optional)</Label>
            <Input
              id="party-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Starting…" : "Start party list"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}