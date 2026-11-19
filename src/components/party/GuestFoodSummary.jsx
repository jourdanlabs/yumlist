import React from "react";
import { AlertTriangle, ThumbsDown } from "lucide-react";
import { capitalize } from "@/lib/utils";

export default function GuestFoodSummary({
  allergies = [],
  dislikes = [],
  enteredAllergies = "",
  enteredDislikes = "",
}) {
  const allergyText = (enteredAllergies || "").trim();
  const dislikeText = (enteredDislikes || "").trim();
  if (allergies.length === 0 && dislikes.length === 0 && !allergyText && !dislikeText) return null;

  return (
    <div className="space-y-2 mb-3">
      {(allergies.length > 0 || allergyText) && (
        <div className="rounded-lg bg-destructive/10 px-2 py-1.5">
          <p className="text-xs font-medium text-destructive flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Allergies & sensitivities
          </p>
          <div className="flex flex-wrap gap-1">
            {allergies.map((flag) => (
              <span
                key={flag.id}
                className="rounded-full border border-destructive/40 bg-card px-2 py-0.5 text-xs text-destructive"
              >
                {capitalize(flag.item_name)} · {flag.flag_type} · {flag.severity}
              </span>
            ))}
            {allergyText && <span className="text-xs text-destructive break-words">{allergyText}</span>}
          </div>
        </div>
      )}

      {(dislikes.length > 0 || dislikeText) && (
        <div className="rounded-lg bg-amber-500/10 px-2 py-1.5">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
            <ThumbsDown className="w-3.5 h-3.5 shrink-0" /> Dislikes
          </p>
          <div className="flex flex-wrap gap-1">
            {dislikes.map((name) => (
              <span
                key={name}
                className="rounded-full border border-amber-500/40 bg-card px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400"
              >
                {capitalize(name)}
              </span>
            ))}
            {dislikeText && (
              <span className="text-xs text-amber-700 dark:text-amber-400 break-words">{dislikeText}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}