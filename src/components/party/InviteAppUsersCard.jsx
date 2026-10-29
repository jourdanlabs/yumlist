import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import UserSearchPicker from "@/components/party/UserSearchPicker";

export default function InviteAppUsersCard({ event }) {
  const [picked, setPicked] = useState([]);
  const [sending, setSending] = useState(false);

  const addUser = (u) =>
    setPicked((list) => (list.some((p) => p.id === u.id) ? list : [...list, u]));
  const removeUser = (id) => setPicked((list) => list.filter((p) => p.id !== id));

  const send = async () => {
    if (picked.length === 0 || sending) return;
    setSending(true);
    try {
      const res = await base44.functions.invoke("sendPartyInvites", {
        event_id: event.id,
        user_ids: picked.map((u) => u.id),
        app_url: window.location.origin,
      });
      const data = res.data || {};
      const sent = data.sent || 0;
      toast({
        title: `${sent} invite${sent === 1 ? "" : "s"} sent`,
        description: data.failed ? `${data.failed} could not be delivered.` : undefined,
      });
      setPicked([]);
    } catch (e) {
      toast({ title: "Could not send invites", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Invite people on YumList</h2>
          <p className="text-sm text-muted-foreground">
            Search for someone already using the app and send them the guest link.
          </p>
        </div>

        <UserSearchPicker selected={picked} onSelect={addUser} onRemove={removeUser} />

        <Button className="w-full" onClick={send} disabled={picked.length === 0 || sending}>
          <Send className="w-4 h-4 mr-2" />
          {sending
            ? "Sending…"
            : `Send invite${picked.length === 1 ? "" : "s"}${picked.length ? ` (${picked.length})` : ""}`}
        </Button>
      </CardContent>
    </Card>
  );
}