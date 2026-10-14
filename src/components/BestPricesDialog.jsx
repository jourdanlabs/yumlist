import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Loader2, Store, Trophy, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function BestPricesDialog({ open, onOpenChange, items }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Best Local Prices
          </DialogTitle>
          <DialogDescription>
            Compare prices for your {items.length} shopping list item{items.length > 1 ? "s" : ""} at nearby stores.
          </DialogDescription>
        </DialogHeader>

        {!results && !loading && !locating && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="text-center py-6 space-y-3">
              <Store className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                We'll use your current location to find the best prices at grocery stores near you.
              </p>
              <Button onClick={handleSearch}>
                <MapPin className="w-4 h-4 mr-2" /> Share location & find prices
              </Button>
            </div>
          </div>
        )}

        {(locating || loading) && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {locating ? "Getting your location…" : "Searching local store prices…"}
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            {results.best_store && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-4 flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Best overall price</div>
                    <div className="font-semibold text-lg">{results.best_store}</div>
                    <div className="text-sm text-muted-foreground">
                      Estimated total: <span className="font-bold text-primary">${results.best_total?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {results.notes && (
              <p className="text-xs text-muted-foreground italic">{results.notes}</p>
            )}

            <div className="space-y-3">
              {(results.stores || []).map((store, idx) => (
                <Card key={idx}>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{store.name}</div>
                        {store.distance_miles != null && (
                          <div className="text-xs text-muted-foreground">{store.distance_miles.toFixed(1)} miles away</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Estimated total</div>
                        <div className="font-bold text-lg">${store.total?.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-2 space-y-1">
                      {(store.items || []).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate pr-2">{item.name}</span>
                          <span className={item.price == null ? "text-muted-foreground/50" : "font-medium"}>
                            {item.price == null ? "N/A" : `$${item.price.toFixed(2)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full" onClick={handleSearch}>
              <DollarSign className="w-4 h-4 mr-2" /> Refresh prices
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}