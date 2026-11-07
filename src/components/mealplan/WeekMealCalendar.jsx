import React, { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import MealDayCard from "@/components/mealplan/MealDayCard";
import AddMealDialog from "@/components/mealplan/AddMealDialog";

export default function WeekMealCalendar({ familyId }) {
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [meals, setMeals] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerDate, setPickerDate] = useState(null);
  const [saving, setSaving] = useState(false);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const startStr = format(days[0], "yyyy-MM-dd");
  const endStr = format(days[6], "yyyy-MM-dd");

  const load = useCallback(() => {
    if (!familyId) return;
    setLoading(true);
    Promise.all([
      base44.entities.MealPlan.filter(
        { family_id: familyId, planned_date: { $gte: startStr, $lte: endStr } },
        "planned_date",
        100
      ),
      base44.entities.Recipe.filter({ family_id: familyId }, "-created_date", 300),
    ])
      .then(([planned, recipesList]) => {
        setMeals(planned || []);
        setRecipes(recipesList || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [familyId, startStr, endStr]);

  useEffect(() => { load(); }, [load]);

  const pickRecipe = async (recipe) => {
    if (!pickerDate) return;
    setSaving(true);
    try {
      const created = await base44.entities.MealPlan.create({
        family_id: familyId,
        planned_date: pickerDate,
        recipe_id: recipe.id,
        recipe_title: recipe.title,
      });
      setMeals((prev) => [...prev, created]);
      toast({ title: `Planned ${recipe.title}`, description: format(parseISO(pickerDate), "EEEE, MMM d") });
      setPickerDate(null);
    } catch (e) {
      toast({ title: "Could not plan that meal", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeMeal = async (meal) => {
    setMeals((prev) => prev.filter((m) => m.id !== meal.id));
    try {
      await base44.entities.MealPlan.delete(meal.id);
    } catch (e) {
      toast({ title: "Could not remove that meal", variant: "destructive" });
      load();
    }
  };

  const today = new Date();
  const isThisWeek = isSameDay(weekStart, startOfWeek(today, { weekStartsOn: 1 }));

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-600" /> Meal calendar
          </h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading your week…"
              : `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}`}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isThisWeek && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekStart(startOfWeek(today, { weekStartsOn: 1 }))}
            >
              This week
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous week"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next week"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          return (
            <MealDayCard
              key={iso}
              day={day}
              isToday={isSameDay(day, today)}
              meals={meals.filter((m) => m.planned_date === iso)}
              onAdd={setPickerDate}
              onRemove={removeMeal}
            />
          );
        })}
      </div>

      <AddMealDialog
        open={!!pickerDate}
        onOpenChange={(next) => { if (!next && !saving) setPickerDate(null); }}
        dateLabel={pickerDate ? format(parseISO(pickerDate), "EEEE, MMM d") : ""}
        recipes={recipes}
        onPick={pickRecipe}
        saving={saving}
      />
    </section>
  );
}