import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PartyPopper, Trash2, UtensilsCrossed, ListChecks } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CreatePartyForm from "@/components/party/CreatePartyForm";
import PartyInviteCard from "@/components/party/PartyInviteCard";
import InviteAppUsersCard from "@/components/party/InviteAppUsersCard";
import GuestPreferencesList from "@/components/party/GuestPreferencesList";
import BroughtRecipesList from "@/components/party/BroughtRecipesList";
import PartyHostListCard from "@/components/party/PartyHostListCard";

export default function Party() {
  const { user } = useCurrentUser();
  const familyId = user?.family_id;
  const [event, setEvent] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [partyItems, setPartyItems] = useState([]);
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
      let hostList = [];
      if (current) {
        const [prefs, own] = await Promise.all([
          base44.entities.PartyPreference.filter(
            { event_id: current.id },
            { sort: "-created_date", limit: 300 }
          ),
          base44.entities.PartyItem.filter(
            { event_id: current.id },
            { sort: "-created_date", limit: 200 }
          ),
        ]);
        guestList = prefs.items || [];
        hostList = own.items || [];
      }
      if (!active) return;
      setEvent(current);
      setPreferences(guestList);
      setPartyItems(hostList);
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
    setPartyItems([]);
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

  const addPartyItem = async (kind, title) => {
    const created = await base44.entities.PartyItem.create({
      family_id: familyId,
      event_id: event.id,
      kind,
      title,
    });
    setPartyItems((list) => [created, ...list]);
  };

  const removePartyItem = async (item) => {
    const previous = partyItems;
    setPartyItems((list) => list.filter((p) => p.id !== item.id));
    try {
      await base44.entities.PartyItem.delete(item.id);
    } catch (e) {
      setPartyItems(previous);
      toast({ title: "Could not remove that", variant: "destructive" });
    }
  };

  const clearList = async () => {
    if (!event) return;
    try {
      await base44.entities.PartyPreference.deleteMany({ event_id: event.id });
      await base44.entities.PartyItem.deleteMany({ event_id: event.id });
      await base44.entities.PartyEvent.delete(event.id);
      setEvent(null);
      setPreferences([]);
      setPartyItems([]);
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
          <PartyPopper className="w-6 h-6 text-primary" /> Plan a Party
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

          <InviteAppUsersCard event={event} />

          <PartyHostListCard
            icon={UtensilsCrossed}
            title="What we're bringing"
            description="Recipes or dishes your household is making for the party."
            items={partyItems.filter((item) => item.kind === "bringing")}
            placeholder="Grandma's potato salad"
            emptyText="Nothing added yet. Add what your household will bring."
            onAdd={(title) => addPartyItem("bringing", title)}
            onRemove={removePartyItem}
          />

          <PartyHostListCard
            icon={ListChecks}
            title="Needed for the party"
            description="Recipes or items still needed so nothing gets forgotten."
            items={partyItems.filter((item) => item.kind === "needed")}
            placeholder="Ice, paper plates, apple pie"
            emptyText="Nothing needed yet. Add the recipes or items you still need."
            onAdd={(title) => addPartyItem("needed", title)}
            onRemove={removePartyItem}
          />

          <GuestPreferencesList preferences={preferences} onRemove={removePreference} />

          <BroughtRecipesList preferences={preferences} />

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