import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Send, Check, X, Eye, Link2Off, Loader2, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function FamilySharing() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const myFam = user?.family_id;

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [shares, setShares] = useState([]);
  const [families, setFamilies] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadShares = useCallback(async () => {
    if (!myFam) return;
    const [outgoing, incoming] = await Promise.all([
      base44.entities.FamilyShare.filter({ requester_family_id: myFam }, "-created_date", 100),
      base44.entities.FamilyShare.filter({ target_family_id: myFam }, "-created_date", 100),
    ]);
    const all = [...outgoing, ...incoming];
    setShares(all);
    const ids = new Set(
      all.map((s) => (s.requester_family_id === myFam ? s.target_family_id : s.requester_family_id))
    );
    const res = await base44.functions.invoke('getFamilyNames', { ids: [...ids] });
    setFamilies(res.data?.names || {});
  }, [myFam]);

  useEffect(() => {
    let active = true;
    (async () => {
      try { await loadShares(); } catch {}
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [loadShares]);

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await base44.functions.invoke("searchFamilies", { query: query.trim() });
      setResults(res.data?.families || []);
    } catch {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const otherId = (s) => (s.requester_family_id === myFam ? s.target_family_id : s.requester_family_id);
  const findShare = (famId) => shares.find((s) => otherId(s) === famId && s.status !== "disconnected");

  const sendRequest = async (famId, famName) => {
    setBusyId(famId);
    try {
      await base44.entities.FamilyShare.create({
        requester_family_id: myFam,
        target_family_id: famId,
        status: "pending",
        requested_by_name: user?.full_name || user?.email || "",
      });
      toast({ title: `Request sent to ${famName}` });
      await loadShares();
    } catch {
      toast({ title: "Could not send request", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const acceptRequest = async (s) => {
    setBusyId(s.id);
    try {
      await base44.entities.FamilyShare.update(s.id, { status: "accepted" });
      toast({ title: "Sharing accepted" });
      await loadShares();
    } catch {
      toast({ title: "Could not accept", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const removeShare = async (s, label) => {
    setBusyId(s.id);
    try {
      await base44.entities.FamilyShare.delete(s.id);
      toast({ title: label });
      await loadShares();
    } catch {
      toast({ title: "Could not update", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const incoming = shares.filter((s) => s.target_family_id === myFam && s.status === "pending");
  const connected = shares.filter((s) => s.status === "accepted");
  const outgoingPending = shares.filter((s) => s.requester_family_id === myFam && s.status === "pending");
  const nameFor = (id) => families[id] || "Family";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Share with other families</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Search for another family to share pantries, recipes, and shopping lists. They can view and copy your items.
        </p>

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search family name…"
          />
          <Button onClick={doSearch} disabled={searching} variant="secondary">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((f) => {
              const sh = findShare(f.id);
              return (
                <div key={f.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40">
                  <span className="text-sm font-medium truncate">{f.name}</span>
                  {sh?.status === "accepted" ? (
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/shared/${f.id}`)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  ) : sh?.status === "pending" && sh.requester_family_id === myFam ? (
                    <span className="text-xs text-muted-foreground">Requested</span>
                  ) : sh?.status === "pending" ? (
                    <Button size="sm" variant="secondary" onClick={() => acceptRequest(sh)}>
                      <Check className="w-4 h-4 mr-1" /> Accept
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => sendRequest(f.id, f.name)} disabled={busyId === f.id}>
                      {busyId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                      Request
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {results.length === 0 && query && !searching && (
          <p className="text-sm text-muted-foreground">No families found. Try a different name.</p>
        )}

        {incoming.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Incoming requests</div>
            {incoming.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{nameFor(s.requester_family_id)}</div>
                  <div className="text-xs text-muted-foreground">Wants to share with your family</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptRequest(s)} disabled={busyId === s.id}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeShare(s, "Request declined")} disabled={busyId === s.id}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {connected.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Connected families</div>
            {connected.map((s) => {
              const fid = otherId(s);
              return (
                <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-500/20">
                  <span className="text-sm font-medium truncate">{nameFor(fid)}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/shared/${fid}`)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeShare(s, "Disconnected")} disabled={busyId === s.id}>
                      <Link2Off className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {outgoingPending.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Pending requests you sent</div>
            {outgoingPending.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40">
                <span className="text-sm truncate">{nameFor(s.target_family_id)}</span>
                <Button size="sm" variant="ghost" onClick={() => removeShare(s, "Request cancelled")} disabled={busyId === s.id}>
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        )}

        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      </CardContent>
    </Card>
  );
}