import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, Copy, Check, Trash2 } from "lucide-react";

export default function ReceivedShares({ notes, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);

  if (!notes.length) return null;

  const copy = (note) => {
    navigator.clipboard.writeText(note.body || "");
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Inbox className="w-4 h-4" /> Shared with you</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{note.title}</div>
                <div className="text-xs text-muted-foreground">
                  From {note.sender_name || "a family member"}
                  {note.created_date ? ` · ${new Date(note.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copy(note)}
                  className="text-muted-foreground hover:text-foreground transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Copy shared content"
                >
                  {copiedId === note.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDelete(note)}
                  className="text-muted-foreground hover:text-destructive transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Remove shared item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-body max-h-40 overflow-y-auto">{note.body}</pre>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}