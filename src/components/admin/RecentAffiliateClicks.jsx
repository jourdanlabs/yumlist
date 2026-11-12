import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import moment from "moment";

export default function RecentAffiliateClicks() {
  const [clicks, setClicks] = useState(null);
  const [names, setNames] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.AffiliateClick.list("-created_date", 50),
      base44.entities.User.list(),
    ])
      .then(([list, users]) => {
        setClicks(list || []);
        const map = {};
        (users || []).forEach((u) => {
          map[u.id] = u.full_name || u.email;
        });
        setNames(map);
      })
      .catch(() => setClicks([]));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Store className="w-4 h-4" /> Recent store choices
        </CardTitle>
        <CardDescription>
          The store someone picked when comparing local prices, newest first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clicks === null ? (
          <div className="h-16 rounded-lg bg-muted animate-pulse" />
        ) : clicks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No store choices recorded yet. They show up here when someone taps "Shop at" in Best Local Prices.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {clicks.map((click) => (
              <div key={click.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{click.retailer}</div>
                  {click.item_query && (
                    <div className="text-xs text-muted-foreground truncate">{click.item_query}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs truncate max-w-[140px]">{names[click.user_id] || "Unknown shopper"}</div>
                  <div className="text-xs text-muted-foreground">{moment(click.created_date).fromNow()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}