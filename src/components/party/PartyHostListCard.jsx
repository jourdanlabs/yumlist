import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { capitalize } from "@/lib/utils";

export default function PartyHostListCard({
  icon: Icon,
  title,
  description,
  items,
  placeholder,
  emptyText,
  onAdd,
  onRemove,
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    setSaving(true);
    try {
      await onAdd(text);
      setValue("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div>
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            {title}
            {items.length > 0 ? ` · ${items.length}` : ""}
          </h2>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            maxLength={120}
            aria-label={title}
          />
          <Button type="submit" size="icon" disabled={saving || !value.trim()} aria-label={`Add to ${title}`}>
            <Plus className="w-4 h-4" />
          </Button>
        </form>

        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
                <p className="text-sm break-words min-w-0">{capitalize(item.title)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  aria-label={`Remove ${item.title}`}
                  onClick={() => onRemove(item)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}