import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Trophy } from "lucide-react";

export default function QuizLeaderboard({ refreshKey = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("family");

  useEffect(() => {
    let active = true;
    setLoading(true);
    base44.functions
      .invoke("getQuizLeaderboard", {})
      .then((res) => {
        if (active) setData(res.data || { families: [] });
      })
      .catch(() => {
        if (active) setData({ families: [] });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading leaderboard…
      </div>
    );
  }

  const families = data?.families || [];
  const me = data?.me;
  const hasConnected = families.length > 1;
  const shown = scope === "all" ? families : families.filter((f) => f.isMine);
  const rows = shown
    .flatMap((f) => f.members.map((m) => ({ ...m, familyName: f.name })))
    .sort((a, b) => b.total_correct - a.total_correct || String(a.user_name).localeCompare(String(b.user_name)));

  return (
    <div className="space-y-3 border-t pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" /> Leaderboard
        </span>
        {hasConnected && (
          <div className="flex rounded-lg border overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setScope("family")}
              className={`px-2.5 py-1.5 min-h-[36px] ${scope === "family" ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              My family
            </button>
            <button
              type="button"
              onClick={() => setScope("all")}
              className={`px-2.5 py-1.5 min-h-[36px] ${scope === "all" ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              All connected
            </button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No scores yet. Finish a round and you will be first on the board.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {rows.map((row, i) => {
            const isMe = row.user_id === me;
            return (
              <li
                key={`${row.user_id}-${row.familyName}`}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${isMe ? "bg-primary/10 border border-primary/20" : "bg-muted/40"}`}
              >
                <span className="w-6 text-center text-sm font-semibold text-muted-foreground shrink-0">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {row.user_name}
                    {isMe && <span className="text-xs text-muted-foreground"> (you)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {row.familyName} · {row.rounds} {row.rounds === 1 ? "round" : "rounds"} · best {row.best}
                  </div>
                </div>
                <span className="text-sm font-semibold shrink-0">{row.total_correct}</span>
              </li>
            );
          })}
        </ol>
      )}
      <p className="text-xs text-muted-foreground">
        Ranked by total correct answers across every round played.
      </p>
    </div>
  );
}