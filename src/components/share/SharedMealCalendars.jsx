import React, { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";

export default function SharedMealCalendars() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const load = useCallback(() => {
    setLoading(true);
    base44.functions
      .invoke("getSharedMealCalendars", {
        start: format(days[0], "yyyy-MM-dd"),
        end: format(days[6], "yyyy-MM-dd"),
      })
      .then((res) => setFamilies(res.data?.families || []))
      .catch(() => setFamilies([]))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const today = new Date();
  const isThisWeek = isSameDay(weekStart, startOfWeek(today, { weekStartsOn: 1 }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Shared meal calendars
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isThisWeek && (
              <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(today, { weekStartsOn: 1 }))}>
                This week
              </Button>
            )}
            <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => setWeekStart((d) => addDays(d, -7))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Next week" onClick={() => setWeekStart((d) => addDays(d, 7))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your meal calendar is shared with the families you're connected to, and you can see what they're planning this week.
        </p>

        {loading ? (
          <div className="h-24 rounded-xl bg-muted animate-pulse" />
        ) : families.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Connect with another family on the Family page to see what they're planning.
          </p>
        ) : (
          families.map((family) => {
            const planned = days
              .map((day) => ({
                day,
                meals: family.meals.filter((m) => m.planned_date === format(day, "yyyy-MM-dd")),
              }))
              .filter((entry) => entry.meals.length > 0);

            return (
              <div key={family.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="font-medium text-sm truncate">{family.name}</span>
                </div>
                {planned.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing planned this week.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {planned.map(({ day, meals }) => (
                      <li key={format(day, "yyyy-MM-dd")} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                        <span className="font-medium text-muted-foreground shrink-0 w-24">
                          {format(day, "EEE, MMM d")}
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          {meals.map((meal) => (
                            <span
                              key={meal.id}
                              className="rounded-md bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 text-orange-900 dark:text-orange-100"
                            >
                              {meal.recipe_title}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}