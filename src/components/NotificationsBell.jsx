import React, { useState, useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const REACTION_LABEL = {
  like: "liked",
  dislike: "disliked",
  neutral: "marked neutral",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsBell({ className }) {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastSeen, setLastSeen] = useState(() => {
    const stored = localStorage.getItem(`fp_notif_seen_${familyId || "x"}`);
    return stored ? Number(stored) : 0;
  });

  useEffect(() => {
    if (!familyId) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [members, reactions, requestedItems, recipes, items] = await Promise.all([
          base44.entities.User.filter({ family_id: familyId }),
          base44.entities.Reaction.filter({ family_id: familyId }, "-created_date", 30),
          base44.entities.GroceryItem.filter({ family_id: familyId }, "-created_date", 50),
          base44.entities.Recipe.filter({ family_id: familyId }),
          base44.entities.GroceryItem.filter({ family_id: familyId }),
        ]);

        const memberName = (id) => {
          const m = members.find((mm) => mm.id === id);
          return m?.full_name || m?.email || "A member";
        };

        const recipeName = (id) => recipes.find((r) => r.id === id)?.title || "a recipe";
        const itemName = (id) => items.find((i) => i.id === id)?.name || "an item";

        const reactionNotifs = reactions
          .filter((r) => r.created_by_id !== user?.id)
          .map((r) => ({
            id: r.id,
            type: "reaction",
            who: memberName(r.created_by_id),
            verb: REACTION_LABEL[r.reaction] || "reacted to",
            target: r.target_type === "recipe" ? recipeName(r.target_id) : itemName(r.target_id),
            targetLabel: r.target_type === "recipe" ? "recipe" : "item",
            date: r.created_date,
          }));

        const requestNotifs = requestedItems
          .filter((i) => i.recipe_title && (i.requested_by_name || "") !== (user?.full_name || user?.email || ""))
          .map((i) => ({
            id: `req-${i.id}`,
            type: "request",
            who: i.requested_by_name || "A member",
            verb: "requested ingredients for",
            target: i.recipe_title,
            targetLabel: "recipe",
            date: i.created_date,
          }));

        const all = [...reactionNotifs, ...requestNotifs]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 20);
        if (active) setNotifications(all);
      } catch (e) {
        // ignore - notifications are non-critical
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [familyId, user?.id, user?.full_name, user?.email]);

  const newCount = useMemo(
    () => notifications.filter((n) => new Date(n.date).getTime() > lastSeen).length,
    [notifications, lastSeen]
  );

  const handleOpenChange = (v) => {
    setOpen(v);
    if (v && notifications.length) {
      const now = Date.now();
      const latest = Math.max(...notifications.map((n) => new Date(n.date).getTime()));
      const seen = Math.max(now, latest);
      localStorage.setItem(`fp_notif_seen_${familyId}`, String(seen));
      setLastSeen(seen);
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn("relative inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors", className)}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {newCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
              {newCount > 9 ? "9+" : newCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-3 py-2.5 border-b border-border font-semibold text-sm">Notifications</div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">No recent activity</div>
          ) : (
            notifications.map((n) => {
              const isNew = new Date(n.date).getTime() > lastSeen;
              return (
                <div key={n.id} className={cn("px-3 py-2.5 border-b border-border last:border-0 flex gap-2", isNew && "bg-accent/50")}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-snug">
                      <span className="font-medium">{n.who}</span>{" "}
                      <span className="text-muted-foreground">{n.verb}</span>{" "}
                      <span className="font-medium truncate">{n.target}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.date)}</div>
                  </div>
                  {isNew && <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}