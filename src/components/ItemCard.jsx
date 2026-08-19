import React from "react";
import { Image } from "@/components/ui/image";
import { Trash2 } from "lucide-react";
import ReactionBar from "@/components/ReactionBar";

export default function ItemCard({ item, counts, onReact, onDelete }) {
  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex gap-4 p-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} className="w-full h-full" fittingType="fill" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🥫</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium truncate">{item.name}</h3>
              {item.brand && <p className="text-sm text-muted-foreground truncate">{item.brand}</p>}
              {item.category && (
                <span className="inline-block mt-1 text-[11px] uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              )}
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