import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, X } from "lucide-react";

export default function UserSearchPicker({ selected, onSelect, onRemove }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) { setResults([]); setSearching(false); return; }
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      base44.functions
        .invoke("searchAppUsers", { query: q })
        .then((res) => { if (active) setResults((res.data && res.data.users) || []); })
        .catch(() => { if (active) setResults([]); })
        .finally(() => { if (active) setSearching(false); });
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  const available = results.filter((u) => !selected.some((s) => s.id === u.id));
  const tooShort = query.trim().length > 0 && query.trim().length < 3;

  return (
    <div className="space-y-2">
      <Label htmlFor="user-search">Search app users</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="user-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or email"
          className="pl-9"
        />
      </div>

      {searching && <p className="text-xs text-muted-foreground">Searching…</p>}
      {tooShort && <p className="text-xs text-muted-foreground">Type at least 3 characters.</p>}
      {!searching && !tooShort && query.trim().length >= 3 && available.length === 0 && (
        <p className="text-xs text-muted-foreground">No other users match that.</p>
      )}

      {available.length > 0 && (
        <div className="rounded-lg border border-border divide-y divide-border max-h-40 overflow-y-auto">
          {available.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-2 px-3 py-1.5">
              <span className="text-sm truncate">{u.full_name}</span>
              <Button variant="ghost" size="sm" onClick={() => onSelect(u)}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1"
            >
              {u.full_name}
              <button type="button" onClick={() => onRemove(u.id)} aria-label={`Remove ${u.full_name}`}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}