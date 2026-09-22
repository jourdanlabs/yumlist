import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { base44 } from "@/api/base44Client";
import { startOfWeek, format, subWeeks, eachDayOfInterval, isSameWeek, parseISO } from "date-fns";

const WEEKS = 8;

export default function ConsumptionChart({ familyId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;
    let active = true;
    (async () => {
      try {
        const logs = await base44.entities.ConsumptionLog.filter({ family_id: familyId }, "-consumed_date", 500);
        if (!active) return;
        const now = new Date();
        const weeks = [];
        for (let i = WEEKS - 1; i >= 0; i--) {
          const ref = subWeeks(now, i);
          const weekStart = startOfWeek(ref, { weekStartsOn: 1 });
          const label = format(weekStart, "MMM d");
          weeks.push({ label, count: 0, weekStart });
        }
        logs.forEach((log) => {
          const d = log.consumed_date ? parseISO(log.consumed_date) : new Date(log.created_date);
          for (const w of weeks) {
            if (isSameWeek(d, w.weekStart, { weekStartsOn: 1 })) {
              w.count += log.quantity || 1;
              break;
            }
          }
        });
        setData(weeks.map(({ label, count }) => ({ label, count })));
      } catch {
        if (active) setData([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [familyId]);

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Weekly consumption</h2>
          <p className="text-sm text-muted-foreground">Items your family used up · last {WEEKS} weeks</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-heading font-semibold">{total}</div>
          <div className="text-xs text-muted-foreground">total used</div>
        </div>
      </div>
      {loading ? (
        <div className="h-56 rounded-xl bg-muted animate-pulse" />
      ) : total === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-muted-foreground text-center border border-dashed border-border rounded-xl">
          No consumption logged yet. Remove items from your pantry to start tracking.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
              formatter={(v) => [`${v} item${v !== 1 ? "s" : ""}`, "Consumed"]}
            />
            <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}