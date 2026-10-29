import React from "react";
import { Salad } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DietBadge({ diets, className }) {
  if (!diets || diets.length === 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400",
        className
      )}
    >
      <Salad className="w-3 h-3" />
      Off {diets.join(", ")}
    </span>
  );
}