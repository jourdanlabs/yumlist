import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AddMemberCard({ onAdded }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState(null);

  const search = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("searchUserByEmail", { email: email.trim() });
      setResult(res.data);
    } catch (e) {
      toast({ title: "Search failed", description: e.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const add = async () => {
    setAdding(true);
    try {
      const res = await base44.functions.invoke("addFamilyMember", { email: email.trim() });
      if (res.data.already_member) {
        toast({ title: "Already a member", description: `${res.data.user.full_name || res.data.user.email} is already in your family.` });
      } else {
        toast({
          title: "Invitation sent",
          description: `${res.data.user.full_name || res.data.user.email} will receive an email with your invite code.`,
        });
      }
      setEmail("");
      setResult(null);
      onAdded?.();
    } catch (e) {
      toast({ title: "Could not send invitation", description: e.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Invite a member
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Search for an existing user by their email. We'll send them an email with your invite code so they can join your family.
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <Button variant="secondary" onClick={search} disabled={searching || !email.trim()}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        {result && !result.found && (
          <p className="text-sm text-muted-foreground">No user found with that email.</p>
        )}
        {result && result.found && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {(result.user.full_name || result.user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{result.user.full_name || "Unnamed member"}</p>
              <p className="text-xs text-muted-foreground truncate">{result.user.email}</p>
              {result.user.has_family && (
                <p className="text-xs text-amber-600 mt-0.5">Already in a family — they must leave before you can add them.</p>
              )}
            </div>
            <Button size="sm" onClick={add} disabled={adding || result.user.has_family}>
              {adding ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Invite
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}