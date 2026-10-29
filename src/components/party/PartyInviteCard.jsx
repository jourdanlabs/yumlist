import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Mail } from "lucide-react";
import { partyLink } from "@/lib/partyLink";
import InviteByEmailDialog from "@/components/party/InviteByEmailDialog";

function dateLabel(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function PartyInviteCard({ event, hostName, requestCount }) {
  const link = partyLink(event.invite_token);
  const [copied, setCopied] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{event.name}</h2>
          <p className="text-sm text-muted-foreground">
            {dateLabel(event.event_date) ? `${dateLabel(event.event_date)} · ` : ""}
            {requestCount} guest request{requestCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest-link">Guest link</Label>
          <div className="flex gap-2">
            <Input
              id="guest-link"
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
              className="text-xs"
            />
            <Button variant="outline" onClick={copy} className="shrink-0" aria-label="Copy guest link">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone with this link can add preferences without signing in.
          </p>
        </div>

        <Button className="w-full" onClick={() => setEmailOpen(true)}>
          <Mail className="w-4 h-4 mr-2" /> Request by email
        </Button>
      </CardContent>

      <InviteByEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        event={event}
        hostName={hostName}
        link={link}
      />
    </Card>
  );
}