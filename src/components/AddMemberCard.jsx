import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AddMemberCard({ onAdded }) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [results, setResults] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke("searchUserByEmail", { query: query.trim() });
      setResults(res.data?.users || []);
    } catch (e) {
      toast({ title: "Search failed", description: e.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const invite = async (member) => {
    setAddingId(member.id);
    try {
      const res = await base44.functions.invoke("addFamilyMember", { email: member.email });
      if (res.data.already_member) {
        toast({ title: "Already a member", description: `${member.name} is already in your family.` });
      } else {
        toast({
          title: "Invitation sent",
          description: `${member.name} will receive an email with your invite code.`,
        });
      }
      setQuery("");
      setResults(null);
      onAdded?.();
    } catch (e) {
      toast({ title: "Could not send invitation", description: e.message, variant: "destructive" });
    } finally {
      setAddingId(null);
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
          Search for an existing user by their username or email address. We'll send them an email with your invite code so they can join your family.
        </p>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Username or name@example.com"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <Button variant="secondary" onClick={search} disabled={searching || !query.trim()}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        {results && results.length === 0 && (
          <p className="text-sm text-muted-foreground">No user found with that username or email.</p>
        )}
        {results?.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {(member.name || member.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{member.name || "Unnamed member"}</p>
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              {member.family_is_yours ? (
                <p className="text-xs text-emerald-600 mt-0.5">Family: {member.family_name || "your family"} (already a member)</p>
              ) : member.has_family ? (
                <p className="text-xs text-amber-600 mt-0.5">
                  Family: {member.family_name || "another family"} — they must leave before you can add them.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">Not in a family yet</p>
              )}
            </div>
            <Button size="sm" onClick={() => invite(member)} disabled={addingId === member.id || member.has_family}>
              {addingId === member.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Invite
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}