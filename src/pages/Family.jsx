import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, LogIn, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Family() {
  const { user, refresh } = useCurrentUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [family, setFamily] = useState(null);

  useEffect(() => {
    if (user?.family_id) {
      base44.entities.Family.get(user.family_id).then(setFamily).catch(() => {});
    }
  }, [user?.family_id]);

  const create = async () => {
    if (!name.trim()) { toast({ title: "Enter a family name", variant: "destructive" }); return; }
    setBusy(true);
    try {
      const fam = await base44.entities.Family.create({ name: name.trim(), invite_code: makeCode() });
      await base44.auth.updateMe({ family_id: fam.id, family_name: fam.name });
      await refresh();
      toast({ title: "Family created" });
      navigate("/");
    } catch (e) {
      toast({ title: "Could not create family", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    if (!code.trim()) { toast({ title: "Enter an invite code", variant: "destructive" }); return; }
    setBusy(true);
    try {
      const fams = await base44.entities.Family.filter({ invite_code: code.trim().toUpperCase() });
      if (!fams.length) { toast({ title: "No family found with that code", variant: "destructive" }); setBusy(false); return; }
      const fam = fams[0];
      await base44.auth.updateMe({ family_id: fam.id, family_name: fam.name });
      await refresh();
      toast({ title: `Joined ${fam.name}` });
      navigate("/");
    } catch (e) {
      toast({ title: "Could not join family", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    try {
      await base44.auth.updateMe({ family_id: "", family_name: "" });
      await refresh();
      toast({ title: "Left family" });
    } catch (e) {
      toast({ title: "Could not leave family", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(family?.invite_code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (user && user.family_id) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">{user.family_name}</h1>
          <p className="text-muted-foreground text-sm">Your family pantry is set up.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Share this code so family members can join your pantry.</p>
            <div className="flex items-center gap-2">
              <Input readOnly value={family?.invite_code || ""} className="font-mono text-lg tracking-widest" />
            </div>
            <Button variant="secondary" className="w-full" onClick={copyCode}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy code"}
            </Button>
          </CardContent>
        </Card>
        <Button variant="outline" className="w-full text-destructive" onClick={leave} disabled={busy}>
          Leave family
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
          <Users className="w-7 h-7" />
        </div>
        <h1 className="font-heading text-2xl font-semibold">Create or join a family</h1>
        <p className="text-muted-foreground text-sm">A family lets everyone share one pantry of items and recipes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4" /> Create a family</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="fam-name">Family name</Label>
            <Input id="fam-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="The Smith Family" />
          </div>
          <Button className="w-full" onClick={create} disabled={busy}>Create</Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <div className="h-px bg-border flex-1" />
        <span className="text-xs text-muted-foreground uppercase">or</span>
        <div className="h-px bg-border flex-1" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><LogIn className="w-4 h-4" /> Join with a code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="fam-code">Invite code</Label>
            <Input id="fam-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABC123" className="font-mono text-lg tracking-widest" />
          </div>
          <Button variant="secondary" className="w-full" onClick={join} disabled={busy}>Join</Button>
        </CardContent>
      </Card>
    </div>
  );
}