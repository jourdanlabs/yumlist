import React from "react";
import { AlertOctagon, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { capitalize } from "@/lib/utils";

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

export default function RecallBadge({ recall, onDismiss }) {
  const details = recall?.recall;
  if (!details) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-destructive/15 text-destructive hover:bg-destructive/25 transition min-h-[32px]"
          aria-label={`Recall details for ${recall.item_name || "this item"}`}
        >
          <AlertOctagon className="w-3 h-3" />
          Recall
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {capitalize(recall.item_name || "Recalled product")}
              {recall.brand && <span className="text-muted-foreground font-normal"> · {recall.brand}</span>}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {details.recalling_firm}
              {details.recall_initiation_date ? ` · ${formatDate(details.recall_initiation_date)}` : ""}
            </p>
          </div>
          {details.classification && (
            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${classificationTone(details.classification)}`}>
              {details.classification}
            </span>
          )}
        </div>

        {details.reason_for_recall && (
          <p className="text-sm text-muted-foreground">{details.reason_for_recall}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {recall.match === "name" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
              Possible match
            </span>
          )}
          {(recall.sources || []).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {SOURCE_LABELS[s] || s}
            </span>
          ))}
          {details.recall_number && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              #{details.recall_number}
            </span>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(recall)}
            className="w-full flex items-center justify-center gap-1 text-sm text-destructive hover:bg-destructive/10 rounded-md py-2 min-h-[44px] transition"
          >
            <X className="w-4 h-4" /> Clear this alert
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}