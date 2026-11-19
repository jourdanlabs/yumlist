import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Loader2, ShoppingCart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StorePriceCard({ store, rank, isBest, busy, onShop }) {
  const [expanded, setExpanded] = useState(false);
  const items = store.items || [];
  const pricedCount = items.filter((i) => i.price != null).length;
  const total = store.total != null ? `$${store.total.toFixed(2)}` : "N/A";

  return (
    <Card className={cn("overflow-hidden", isBest && "border-green-400 bg-green-50 dark:bg-green-950/30 dark:border-green-800")}>
      <CardContent className="p-3 sm:p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isBest ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {rank + 1}
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-sm sm:text-base text-foreground break-words">{store.name}</div>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-1.5">
                {store.distance_miles != null && (
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {store.distance_miles.toFixed(1)} mi
                  </span>
                )}
                {items.length > 0 && <span>{pricedCount} of {items.length} priced</span>}
              </div>
              {isBest && (
                <Badge className="mt-1.5 bg-green-600 text-white hover:bg-green-600 text-[11px] px-1.5 py-0">
                  Best price
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Est. total</div>
            <div className={cn("text-lg font-bold leading-tight", isBest ? "text-green-700 dark:text-green-400" : "text-foreground")}>
              {total}
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-accent min-h-[44px] sm:min-h-0 sm:py-1.5"
          >
            {expanded ? "Hide item prices" : `View ${items.length} item price${items.length > 1 ? "s" : ""}`}
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
        )}

        {expanded && (
          <div className="space-y-1.5 border-t border-border pt-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground break-words">{item.name}</span>
                <span className={cn("shrink-0 font-medium", item.price == null && "text-muted-foreground/60 font-normal")}>
                  {item.price == null ? "N/A" : `$${item.price.toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          size="sm"
          variant={isBest ? "default" : "outline"}
          className="w-full"
          onClick={() => onShop(store)}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          Shop at {store.name}
        </Button>
      </CardContent>
    </Card>
  );
}