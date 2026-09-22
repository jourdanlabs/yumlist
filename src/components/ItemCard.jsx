import React from "react";
import { Image } from "@/components/ui/image";
import { Trash2, CalendarClock, Package } from "lucide-react";
import ReactionBar from "@/components/ReactionBar";
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

export default function ItemCard({ item, counts, onReact, onDelete }) {
  const qty = item.quantity ?? 1;
  const unit = item.unit || "units";
  const exp = expiryStatus(item.expiration_date);
  const outOfStock = qty <= 0;

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex gap-4 p-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} className="w-full h-full" fittingType="fill" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">{itemEmoji(item)}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium truncate">{capitalize(item.name)}</h3>
              {item.brand && <p className="text-sm text-muted-foreground truncate">{item.brand}</p>}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {item.category && (
                  <span className="inline-block text-[11px] uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${outOfStock ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                  <Package className="w-3 h-3" />
                  {outOfStock ? "Out of stock" : `${qty} ${unit}`}
                </span>
                {exp && (
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${toneClasses[exp.tone]}`}>
                    <CalendarClock className="w-3 h-3" />
                    {exp.label}
                  </span>
                )}
              </div>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                aria-label="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-3">
            <ReactionBar likes={counts.likes} dislikes={counts.dislikes} myReaction={counts.myReaction} onReact={onReact} />
          </div>
        </div>
      </div>
    </div>
  );
}