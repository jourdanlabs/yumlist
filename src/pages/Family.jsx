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
import FamilySharing from "@/components/FamilySharing";
import AddMemberCard from "@/components/AddMemberCard";

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
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (user?.family_id) {
      base44.entities.Family.get(user.family_id).then(setFamily).catch(() => {});
      base44.entities.User.filter({ family_id: user.family_id }).then(setMembers).catch(() => setMembers([]));
    }
  }, [user?.family_id]);

  const create = async () => {
    if (!name.trim()) { toast({ title: "Enter a family name", variant: "destructive" }); return; }
    setBusy(true);
    try {
      await base44.functions.invoke('createFamily', { name: name.trim() });
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
      const res = await base44.functions.invoke('joinFamilyByCode', { invite_code: code.trim() });
      const fam = res.data;
      if (!fam?.found) { toast({ title: "No family found with that code", variant: "destructive" }); setBusy(false); return; }
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
      await base44.functions.invoke('leaveFamily', {});
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
          <h1 className="font-heading text-2xl font-semibold text-orange-700">{user.family_name}</h1>
          <p className="text-green-600 text-sm">Your family pantry is set up.</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground">No members found.</p>
            )}
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {(m.full_name || m.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.full_name || "Unnamed member"}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                {m.id === user.id && <span className="ml-auto text-xs text-muted-foreground">You</span>}
              </div>
            ))}
          </CardContent>
        </Card>
        <AddMemberCard onAdded={() => {
          base44.entities.User.filter({ family_id: user.family_id }).then(setMembers).catch(() => {});
        }} />
        <FamilySharing />
        <Button variant="outline" className="w-full text-destructive" onClick={leave} disabled={busy}>
          Leave family
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto px-4 py-8 md:py-16 space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-xl font-semibold">Create or join a family</h1>
        <p className="text-muted-foreground text-sm">A family lets everyone share one pantry of items and recipes.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fam-name" className="text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Create a family</Label>
            <Input id="fam-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="The Smith Family" />
            <Button className="w-full" onClick={create} disabled={busy}>Create</Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground uppercase">or</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fam-code" className="text-sm font-medium flex items-center gap-2"><LogIn className="w-4 h-4" /> Join with a code</Label>
            <Input id="fam-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABC123" className="font-mono text-base tracking-widest" />
            <Button variant="secondary" className="w-full" onClick={join} disabled={busy}>Join</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}