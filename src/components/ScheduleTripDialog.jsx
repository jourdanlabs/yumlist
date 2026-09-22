import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CalendarPlus, Loader2, Link2, Unlink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CONNECTOR_ID = "6ab299dec4bfe525f1bb5806";

export default function ScheduleTripDialog({ open, onOpenChange, itemCount }) {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");

  const checkConnection = async () => {
    setChecking(true);
    try {
      // Probe with an empty payload: a connected account returns 400 (validation),
      // a disconnected account returns 500 (connector error).
      await base44.functions.invoke("scheduleShoppingTrip", { start: "" });
      setConnected(true);
    } catch (e) {
      setConnected(e?.response?.status === 400);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (open) {
      checkConnection();
      // default to tomorrow 10:00
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      setDate(d.toISOString().slice(0, 10));
      setTime("10:00");
    }
  }, [open]);

  const handleConnect = async () => {
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, "_blank");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          checkConnection();
        }
      }, 500);
    } catch (e) {
      toast({ title: "Could not start Google connection", variant: "destructive" });
    }
  };

  const handleDisconnect = async () => {
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
      setConnected(false);
      toast({ title: "Google Calendar disconnected" });
    } catch (e) {
      toast({ title: "Could not disconnect", variant: "destructive" });
    }
  };

  const handleSchedule = async () => {
    if (!date || !time) {
      toast({ title: "Pick a date and time", variant: "destructive" });
      return;
    }
    const start = `${date}T${time}:00`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Etc/UTC";
    setScheduling(true);
    try {
      const res = await base44.functions.invoke("scheduleShoppingTrip", {
        start,
        duration_minutes: Number(duration) || 60,
        item_count: itemCount,
        timezone,
      });
      toast({ title: "Shopping trip added to your Google Calendar" });
      if (res?.data?.html_link) window.open(res.data.html_link, "_blank");
      onOpenChange(false);
    } catch (e) {
      const msg = (e?.response?.data?.error || e?.message || "").toString();
      toast({ title: msg || "Could not schedule trip", variant: "destructive" });
    } finally {
      setScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" /> Schedule shopping trip
          </DialogTitle>
          <DialogDescription>
            Add a shopping trip to your Google Calendar so the family knows when you're going.
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !connected ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Google Calendar to schedule trips. Each family member connects their own account.
            </p>
            <Button onClick={handleConnect} className="w-full">
              <Link2 className="w-4 h-4 mr-2" /> Connect Google Calendar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">Google Calendar connected</span>
              <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                <Unlink className="w-3.5 h-3.5 mr-1.5" /> Disconnect
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="trip-date">Date</Label>
                <Input id="trip-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trip-time">Time</Label>
                <Input id="trip-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-duration">Duration (minutes)</Label>
              <Input id="trip-duration" type="number" min="15" step="15" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            {itemCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {itemCount} item{itemCount > 1 ? "s" : ""} on your shopping list will be noted in the event.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {connected && (
            <Button onClick={handleSchedule} disabled={scheduling}>
              {scheduling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarPlus className="w-4 h-4 mr-2" />}
              Add to calendar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}