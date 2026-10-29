import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Check, PartyPopper } from "lucide-react";

function dateLabel(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export default function PartyInvite() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState({ guest_name: "", item_name: "", note: "" });
  const [added, setAdded] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    let active = true;
    base44.functions
      .invoke("getPartyInvite", { token })
      .then((res) => {
        if (!active) return;
        if (res.data && res.data.event) {
          setInvite(res.data);
          setStatus("ready");
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => { if (active) setStatus("invalid"); });
    return () => { active = false; };
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.guest_name.trim() || !form.item_name.trim()) {
      setError("Add your name and at least one thing you would like.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await base44.functions.invoke("submitPartyPreference", { token, ...form });
      setAdded((list) => [...list, form.item_name.trim()]);
      setForm((f) => ({ ...f, item_name: "", note: "" }));
    } catch (err) {
      setError("Could not add that just now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen picnic-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen picnic-bg flex items-center justify-center p-4 safe-top safe-bottom">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-2">
            <PartyPopper className="w-8 h-8 text-muted-foreground mx-auto" />
            <h1 className="font-heading text-lg font-semibold">This invite link is not active</h1>
            <p className="text-sm text-muted-foreground">
              The host may have cleared the party list. Ask them for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen picnic-bg flex items-start justify-center p-4 safe-top safe-bottom">
      <div className="w-full max-w-md py-6 space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <PartyPopper className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">{invite.event.name}</h1>
          <p className="text-sm text-muted-foreground">
            {dateLabel(invite.event.event_date) ? `${dateLabel(invite.event.event_date)} · ` : ""}
            Hosted by {invite.host || "the family"}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add what you would like at the party. It goes straight onto the host's list.
              </p>
              <div className="space-y-2">
                <Label htmlFor="guest-name">Your name</Label>
                <Input
                  id="guest-name"
                  value={form.guest_name}
                  onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))}
                  placeholder="Alex"
                  maxLength={60}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-item">What would you like?</Label>
                <Input
                  id="guest-item"
                  value={form.item_name}
                  onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))}
                  placeholder="Sparkling water"
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-note">Anything else? (optional)</Label>
                <Textarea
                  id="guest-note"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="No nuts please"
                  rows={2}
                  maxLength={300}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Adding…" : "Add to the list"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {added.length > 0 && (
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-medium mb-2">You added</p>
              <ul className="space-y-1">
                {added.map((item, i) => (
                  <li key={`${item}-${i}`} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pb-4">Powered by YumList</p>
      </div>
    </div>
  );
}