import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReactionBar({ likes, dislikes, neutrals, myReaction, onReact }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onReact("like")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border",
          myReaction === "like"
            ? "bg-emerald-500 text-white border-emerald-500"
            : "bg-card text-muted-foreground border-border hover:text-emerald-600 hover:border-emerald-300"
        )}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        <span>{likes}</span>
      </button>
      <button
        type="button"
        onClick={() => onReact("neutral")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border",
          myReaction === "neutral"
            ? "bg-slate-400 text-white border-slate-400"
            : "bg-card text-muted-foreground border-border hover:text-slate-600 hover:border-slate-300"
        )}
      >
        <span className="text-sm leading-none">🤷</span>
        <span>{neutrals}</span>
      </button>
      <button
        type="button"
        onClick={() => onReact("dislike")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border",
          myReaction === "dislike"
            ? "bg-rose-500 text-white border-rose-500"
            : "bg-card text-muted-foreground border-border hover:text-rose-600 hover:border-rose-300"
        )}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
        <span>{dislikes}</span>
      </button>
    </div>
  );
}