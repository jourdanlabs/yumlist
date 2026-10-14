import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, Users, Activity, TrendingUp, Smartphone, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DAY = 86400000;

function weekStart(dateStr) {
  const d = new Date(dateStr);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export default function Admin() {
  const { user, loading: userLoading } = useCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") { setLoading(false); return; }
    base44.entities.User.list("-created_date", 500)
      .then(setUsers)
      .catch((e) => setError(e?.message || "Could not load users"))
      .finally(() => setLoading(false));
  }, [user?.role]);

  const stats = useMemo(() => {
    const now = Date.now();
    const isActive = (u, days) => u.last_active && now - new Date(u.last_active).getTime() <= days * DAY;
    const active7 = users.filter((u) => isActive(u, 7));
    const active30 = users.filter((u) => isActive(u, 30));
    const signedUpOver7d = users.filter((u) => u.created_date && now - new Date(u.created_date).getTime() > 7 * DAY);
    const retainedOver7d = signedUpOver7d.filter((u) => isActive(u, 7));
    const retentionRate = signedUpOver7d.length ? Math.round((retainedOver7d.length / signedUpOver7d.length) * 100) : 0;
    const stickiness = active30.length ? Math.round((active7.length / active30.length) * 100) : 0;

    const sources = {};
    users.forEach((u) => {
      const s = u.download_source || "Unknown";
      if (!sources[s]) sources[s] = { total: 0, active: 0 };
      sources[s].total += 1;
      if (isActive(u, 7)) sources[s].active += 1;
    });
    const bySource = Object.entries(sources)
      .map(([source, v]) => ({ source, ...v, pct: v.total ? Math.round((v.active / v.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total);

    const cohortsMap = {};
    users.forEach((u) => {
      if (!u.created_date) return;
      const wk = weekStart(u.created_date);
      if (!cohortsMap[wk]) cohortsMap[wk] = { week: wk, size: 0, active: 0 };
      cohortsMap[wk].size += 1;
      if (isActive(u, 7)) cohortsMap[wk].active += 1;
    });
    const cohorts = Object.values(cohortsMap)
      .sort((a, b) => a.week.localeCompare(b.week))
      .map((c) => ({ ...c, retention: c.size ? Math.round((c.active / c.size) * 100) : 0 }));

    return { total: users.length, active7: active7.length, active30: active30.length, retentionRate, stickiness, bySource, cohorts };
  }, [users]);

  if (userLoading || (loading && user?.role === "admin")) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Admins only. You don't have access to this page.</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-24 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">User growth, install source, and retention analytics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total users" value={stats.total} />
        <StatCard icon={Activity} label="Active (7 days)" value={stats.active7} sub={`${stats.total ? Math.round((stats.active7 / stats.total) * 100) : 0}% of total`} />
        <StatCard icon={Gauge} label="Stickiness" value={`${stats.stickiness}%`} sub="WAU / MAU" />
        <StatCard icon={TrendingUp} label="Retention" value={`${stats.retentionRate}%`} sub="Active 7d of users >7d old" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Download source</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-xs">
              <tr>
                <th className="text-left font-medium px-4 py-2">Source</th>
                <th className="text-right font-medium px-4 py-2">Users</th>
                <th className="text-right font-medium px-4 py-2">Active (7d)</th>
                <th className="text-right font-medium px-4 py-2">% Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.bySource.map((s) => (
                <tr key={s.source}>
                  <td className="px-4 py-2.5 flex items-center gap-2"><Smartphone className="w-3.5 h-3.5 text-muted-foreground" />{s.source}</td>
                  <td className="text-right px-4 py-2.5">{s.total}</td>
                  <td className="text-right px-4 py-2.5">{s.active}</td>
                  <td className="text-right px-4 py-2.5">{s.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">New users per week</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.cohorts.map((c) => ({ week: c.week.slice(5), users: c.size, active: c.active }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="users" name="New users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="active" name="Active (7d)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Cohort retention</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-xs">
              <tr>
                <th className="text-left font-medium px-4 py-2">Signup week</th>
                <th className="text-right font-medium px-4 py-2">Cohort size</th>
                <th className="text-right font-medium px-4 py-2">Active (7d)</th>
                <th className="text-right font-medium px-4 py-2">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.cohorts.slice().reverse().map((c) => (
                <tr key={c.week}>
                  <td className="px-4 py-2.5">{c.week}</td>
                  <td className="text-right px-4 py-2.5">{c.size}</td>
                  <td className="text-right px-4 py-2.5">{c.active}</td>
                  <td className="text-right px-4 py-2.5">{c.retention}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Icon className="w-4 h-4" />{label}
        </div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}