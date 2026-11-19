import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { capitalize } from "@/lib/utils";

export default function MyPartySubmissionRow({ item, onSave, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    item_name: item.item_name || "",
    bringing: item.bringing || "",
    note: item.note || "",
  });

  const startEdit = () => {
    setDraft({
      item_name: item.item_name || "",
      bringing: item.bringing || "",
      note: item.note || "",
    });
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!draft.item_name.trim() && !draft.bringing.trim()) return;
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      /* the invite page shows the message */
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <form onSubmit={save} className="rounded-xl border border-border p-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`item-${item.id}`} className="text-xs">
            What would you like?
          </Label>
          <Input
            id={`item-${item.id}`}
            value={draft.item_name}
            onChange={(e) => setDraft((d) => ({ ...d, item_name: e.target.value }))}
            maxLength={80}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`bringing-${item.id}`} className="text-xs">
            Recipe or dish you're bringing
          </Label>
          <Input
            id={`bringing-${item.id}`}
            value={draft.bringing}
            onChange={(e) => setDraft((d) => ({ ...d, bringing: e.target.value }))}
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`note-${item.id}`} className="text-xs">
            Note
          </Label>
          <Input
            id={`note-${item.id}`}
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            maxLength={300}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={saving} className="flex-1">
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-border p-3 flex items-start justify-between gap-2">
      <div className="min-w-0">
        {item.item_name && <p className="text-sm break-words">{capitalize(item.item_name)}</p>}
        {item.bringing && (
          <p className="text-sm break-words text-muted-foreground">Bringing {capitalize(item.bringing)}</p>
        )}
        {item.note && <p className="text-xs text-muted-foreground break-words">{item.note}</p>}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit what you added"
          onClick={startEdit}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          aria-label="Remove what you added"
          onClick={() => onRemove(item)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}