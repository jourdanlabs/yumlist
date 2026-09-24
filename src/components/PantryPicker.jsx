import React, { useMemo, useState } from "react";
import { Plus, Search, Package, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { capitalize } from "@/lib/utils";

export default function PantryPicker({ items, onAdd }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => q
      ? items.filter((i) =>
          (i.name || "").toLowerCase().includes(q) ||
          (i.brand || "").toLowerCase().includes(q)
        )
      : items,
    [items, q]
  );

  if (items.length === 0) return null;

  return (
    <div className="pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Add from pantry ({items.length})</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <div className="relative rounded-lg border border-border bg-white p-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pantry items…"
              className="pl-9 bg-white border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Card>
            <CardContent className="p-0 divide-y divide-border max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-6 text-center">No items match your search.</p>
              ) : (
                filtered.map((item) => {
                  const qty = item.quantity ?? 1;
                  const unit = item.unit || "units";
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{capitalize(item.name)}</div>
                        {item.brand && <span className="text-xs text-muted-foreground truncate block mt-0.5">{item.brand}</span>}
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full whitespace-nowrap ${qty <= 0 ? "bg-destructive/10 text-destructive" : qty <= 2 ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-green-500/15 text-green-700 dark:text-green-400"}`}>
                        <Package className="w-3 h-3" />
                        {qty <= 0 ? "Out of stock" : `${qty} ${unit}`}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => onAdd(item.id)}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}