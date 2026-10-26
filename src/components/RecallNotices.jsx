import React from "react";
import { AlertOctagon, Trash2, X } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { recallKey } from "@/lib/recallKey";

const SOURCE_LABELS = {
  liked: "Liked",
  purchased: "In pantry",
  consumed: "Previously bought",
};

function classificationTone(classification) {
  if (classification === "Class I") return "bg-destructive/15 text-destructive";
  if (classification === "Class II") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
}

function formatDate(value) {
  if (!value || value.length !== 8) return "";
  const d = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function RecallNotices({ alerts, onDismiss, onDismissAll }) {
  if (!alerts || alerts.length === 0) return null;
  const canClear = typeof onDismiss === "function";

  return (
    <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2 text-destructive">
          <AlertOctagon className="w-5 h-5" /> Recall alerts · {alerts.length}
        </h2>
        {canClear && alerts.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={() => onDismissAll?.()}
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </Button>
        )}
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mt-1">
        Recent FDA food recalls that may affect items your family bought or liked. Check the product details against what you have. Clear one once you have checked it, or clear them all.
      </p>
      <div className="mt-3 space-y-2">
        {alerts.map((a, i) => (
          <div key={recallKey(a) || i} className="rounded-lg border border-destructive/20 bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {capitalize(a.item_name)}
                  {a.brand && <span className="text-muted-foreground font-normal"> · {a.brand}</span>}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {a.recall.recalling_firm}
                  {a.recall.recall_initiation_date ? ` · ${formatDate(a.recall.recall_initiation_date)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {a.recall.classification && (
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${classificationTone(a.recall.classification)}`}>
                    {a.recall.classification}
                  </span>
                )}
                {canClear && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Clear the recall alert for ${a.item_name}`}
                    onClick={() => onDismiss(a)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            {a.recall.reason_for_recall && (
              <p className="text-xs md:text-sm text-muted-foreground mt-2">{a.recall.reason_for_recall}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {a.match === "name" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  Possible match
                </span>
              )}
              {a.sources.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {SOURCE_LABELS[s] || s}
                </span>
              ))}
              {a.recall.recall_number && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  #{a.recall.recall_number}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}