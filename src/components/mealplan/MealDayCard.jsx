import React from "react";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";

export default function MealDayCard({ day, meals, isToday, onAdd, onRemove }) {
  const iso = format(day, "yyyy-MM-dd");

  return (
    <div
      className={`rounded-2xl border p-3 flex flex-col gap-2 ${
        isToday ? "border-green-600 bg-green-50 dark:bg-green-950/30" : "border-border bg-card"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            isToday ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
          }`}
        >
          {format(day, "EEE")}
        </span>
        <span className={`text-sm font-semibold ${isToday ? "text-green-700 dark:text-green-400" : ""}`}>
          {format(day, "MMM d")}
        </span>
      </div>

      <div className="space-y-1.5 flex-1">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="flex items-start gap-1 rounded-lg bg-orange-100 dark:bg-orange-950/40 pl-2 pr-1 py-1.5"
          >
            <span className="text-sm font-medium leading-tight flex-1 min-w-0 break-words text-orange-900 dark:text-orange-100">
              {meal.recipe_title}
            </span>
            <button
              type="button"
              onClick={() => onRemove(meal)}
              aria-label={`Remove ${meal.recipe_title}`}
              className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-orange-900/60 dark:text-orange-100/60 hover:text-orange-900 dark:hover:text-orange-100 hover:bg-orange-200 dark:hover:bg-orange-900/50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onAdd(iso)}
          className="w-full min-h-[44px] rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-green-600 hover:text-green-700 dark:hover:text-green-400 flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> {meals.length ? "Add another" : "Add meal"}
        </button>
      </div>
    </div>
  );
}