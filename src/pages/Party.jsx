import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PartyPopper, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CreatePartyForm from "@/components/party/CreatePartyForm";
import PartyInviteCard from "@/components/party/PartyInviteCard";
import GuestPreferencesList from "@/components/party/GuestPreferencesList";

export default function Party() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const [event, setEvent] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;
    let active = true;
    (async () => {
      const page = await base44.entities.PartyEvent.filter(
        { family_id: familyId },
        { sort: "-created_date", limit: 1 }
      );
      const current = (page.items || [])[0] || null;
      let guestList = [];
      if (current) {
        const prefs = await base44.entities.PartyPreference.filter(
          { event_id: current.id },
          { sort: "-created_date", limit: 300 }
        );
        guestList = prefs.items || [];
      }
      if (!active) return;
      setEvent(current);
      setPreferences(guestList);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [familyId]);

  const createEvent = async ({ name, event_date }) => {
    const created = await base44.entities.PartyEvent.create({
      family_id: familyId,
      name,
      event_date: event_date || "",
      invite_token: crypto.randomUUID().replace(/-/g, ""),
    });
    setEvent(created);
    setPreferences([]);
  };

  const removePreference = async (pref) => {
    const previous = preferences;
    setPreferences((list) => list.filter((p) => p.id !== pref.id));
    try {
      await base44.entities.PartyPreference.delete(pref.id);
    } catch (e) {
      setPreferences(previous);
      toast({ title: "Could not remove that request", variant: "destructive" });
    }
  };

  const clearList = async () => {
    if (!event) return;
    try {
      await base44.entities.PartyPreference.deleteMany({ event_id: event.id });
      await base44.entities.PartyEvent.delete(event.id);
      setEvent(null);
      setPreferences([]);
      toast({ title: "Party list cleared", description: "The guest link no longer works." });
    } catch (e) {
      toast({ title: "Could not clear the list", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-semibold flex items-center gap-2">
          <PartyPopper className="w-6 h-6 text-primary" /> Party guest list
        </h1>
        <p className="text-sm text-muted-foreground">
          Collect what your guests want, then clear the list once the party is over.
        </p>
      </div>

      {!event ? (
        <CreatePartyForm onCreate={createEvent} />
      ) : (
        <>
          <PartyInviteCard
            event={event}
            hostName={user?.full_name}
            requestCount={preferences.length}
          />

          <GuestPreferencesList preferences={preferences} onRemove={removePreference} />

          <Card>
            <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Party over? Clearing removes every guest request and retires the link.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="shrink-0">
                    <Trash2 className="w-4 h-4 mr-2" /> Clear party list
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear this party list?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {preferences.length} guest request{preferences.length === 1 ? "" : "s"} will be
                      deleted and the invite link will stop working. Your pantry and recipes are not affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearList}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear list
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}