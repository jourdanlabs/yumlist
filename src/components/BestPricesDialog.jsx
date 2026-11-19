import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Loader2, Store, RefreshCw, Trophy, TrendingDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import StorePriceCard from "@/components/prices/StorePriceCard";

export default function BestPricesDialog({ open, onOpenChange, items }) {
  const toast = useToast().toast;
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [shopBusy, setShopBusy] = useState(null);

  const handleShop = async (store) => {
    const query = items.map((i) => i.name).filter(Boolean).join(", ").slice(0, 120);
    setShopBusy(store.name);
    try {
      const res = await base44.functions.invoke("logAffiliateClick", { retailer: store.name, query });
      const url = res?.data?.url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast({
          title: `No affiliate link for ${store.name} yet`,
          description: "Add one under Affiliate links to earn from this store. The choice was still recorded.",
        });
      }
    } catch (e) {
      toast({ title: "Could not open store link", description: e.message, variant: "destructive" });
    } finally {
      setShopBusy(null);
    }
  };

  const handleSearch = () => {
    setError(null);
    setResults(null);
    setLocating(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        setLoading(true);
        try {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          const res = await base44.functions.invoke("findBestPrices", {
            items: items.map((i) => ({ name: i.name, brand: i.brand })),
            location,
          });
          setResults(res?.data?.result || null);
        } catch (e) {
          setError("Could not fetch prices. Please try again.");
          toast({ title: "Price search failed", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLocating(false);
        const msg = err.code === err.PERMISSION_DENIED
          ? "Location permission denied. Enable location access to find local store prices."
          : "Could not get your location. Please try again.";
        setError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClose = (open) => {
    if (!open) {
      setResults(null);
      setError(null);
    }
    onOpenChange(open);
  };

  const stores = results?.stores || [];
  const ranked = [...stores].sort((a, b) => {
    const av = a.total == null ? Infinity : a.total;
    const bv = b.total == null ? Infinity : b.total;
    return av - bv;
  });
  const totals = ranked.map((s) => s.total).filter((t) => typeof t === "number");
  const savings = totals.length > 1 ? Math.max(...totals) - Math.min(...totals) : 0;
  const bestStore = ranked.find((s) => s.total != null);
  const previewNames = items.map((i) => i.name).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col gap-3 max-h-[92vh] p-4 sm:p-6 w-full max-w-full inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl overflow-hidden sm:inset-auto sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
        <div className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-muted sm:hidden" />

        <DialogHeader className="pr-8 text-left space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" /> Best Local Prices
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Comparing {items.length} item{items.length > 1 ? "s" : ""} at grocery stores near you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3 -mr-1 pr-1">
          {!results && !loading && !locating && (
            <div className="space-y-4 py-2">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="rounded-xl border border-border bg-muted/40 p-4 text-center space-y-3">
                <Store className="w-9 h-9 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  We use your current location once to estimate prices at nearby stores.
                </p>
                {previewNames.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {previewNames.slice(0, 5).map((name, i) => (
                      <span key={i} className="rounded-full bg-background border border-border px-2 py-0.5 text-xs text-foreground">
                        {name}
                      </span>
                    ))}
                    {previewNames.length > 5 && (
                      <span className="rounded-full bg-background border border-border px-2 py-0.5 text-xs text-muted-foreground">
                        +{previewNames.length - 5} more
                      </span>
                    )}
                  </div>
                )}
                <Button onClick={handleSearch} className="w-full sm:w-auto">
                  <MapPin className="w-4 h-4 mr-2" /> Share location & find prices
                </Button>
              </div>
            </div>
          )}

          {(locating || loading) && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {locating ? "Getting your location…" : "Searching local store prices…"}
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-3">
              {bestStore && (
                <div className="rounded-xl border border-green-400 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-3 sm:p-4 flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Cheapest overall</div>
                    <div className="font-semibold text-base text-foreground break-words">{bestStore.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Estimated total{" "}
                      <span className="font-bold text-green-700 dark:text-green-400">
                        ${bestStore.total.toFixed(2)}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                        <TrendingDown className="w-3.5 h-3.5" /> Save up to ${savings.toFixed(2)} vs. other stores
                      </div>
                    )}
                  </div>
                </div>
              )}

              {results.notes && (
                <p className="text-xs text-muted-foreground italic px-1">{results.notes}</p>
              )}

              <div className="space-y-2.5">
                {ranked.map((store, idx) => (
                  <StorePriceCard
                    key={idx}
                    store={store}
                    rank={idx}
                    isBest={idx === 0 && store.total != null}
                    busy={shopBusy === store.name}
                    onShop={handleShop}
                  />
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={handleSearch}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh prices
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}