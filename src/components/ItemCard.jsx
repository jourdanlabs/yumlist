import React from "react";
import { Image } from "@/components/ui/image";
import { Trash2, CalendarClock, Pencil, AlertTriangle } from "lucide-react";
import ReactionBar from "@/components/ReactionBar";
import RecallBadge from "@/components/RecallBadge";
import DietBadge from "@/components/diets/DietBadge";
import { capitalize } from "@/lib/utils";
import { itemEmoji } from "@/lib/itemEmoji";

function expiryStatus(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  const days = Math.round((d - now) / 86400000);
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, tone: "expired" };
  if (days <= 3) return { label: days === 0 ? "Expires today" : `Expires in ${days}d`, tone: "soon" };
  return { label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), tone: "ok" };
}

const toneClasses = {
  expired: "bg-destructive/10 text-destructive",
  soon: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  ok: "bg-muted text-muted-foreground",
};

export default function ItemCard({ item, counts, onReact, onDelete, onEdit, allergyFlag, onFlag, recall, onDismissRecall, dietConflicts = [] }) {
  const exp = expiryStatus(item.expiration_date);

  const actions = (
    <div className="flex items-center gap-1">
      {onFlag && (
        <button
          onClick={() => onFlag(item)}
          className={`transition min-w-[44px] min-h-[44px] flex items-center justify-center ${allergyFlag ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:text-amber-600"}`}
          aria-label="Flag allergy or sensitivity"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={() => onEdit(item)}
          className="text-muted-foreground hover:text-primary transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Edit item"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(item)}
          className="text-muted-foreground hover:text-destructive transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} className="w-full h-full" fittingType="fill" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl">{itemEmoji(item)}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-medium truncate">{capitalize(item.name)}</h3>
              {item.brand && <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.brand}</p>}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1">
                {item.category && (
                  <span className="inline-block text-xs sm:text-sm uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                )}
                {exp && (
                  <span className={`inline-flex items-center gap-1 text-xs sm:text-sm px-2 py-0.5 rounded-full ${toneClasses[exp.tone]}`}>
                    <CalendarClock className="w-3 h-3" />
                    {exp.label}
                  </span>
                )}
                <RecallBadge recall={recall} onDismiss={onDismissRecall} />
                {allergyFlag && (
                  <span className={`inline-flex items-center gap-1 text-xs sm:text-sm px-2 py-0.5 rounded-full ${allergyFlag.flag_type === "allergy" ? "bg-destructive/15 text-destructive" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {allergyFlag.flag_type === "allergy" ? "Allergy" : "Sensitivity"}
                    {allergyFlag.member_name && <span className="opacity-80">· {allergyFlag.member_name}</span>}
                  </span>
                )}
                <DietBadge diets={dietConflicts} />
              </div>
            </div>
            <div className="hidden sm:block">{actions}</div>
          </div>
          <div className="mt-2 sm:mt-3">
            <ReactionBar likes={counts.likes} dislikes={counts.dislikes} myReaction={counts.myReaction} onReact={onReact} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-border py-1 sm:hidden">
        {actions}
      </div>
    </div>
  );
}