import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Send } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteByEmailDialog({ open, onOpenChange, event, link }) {
  const [emails, setEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) { setResult(null); setSending(false); }
  }, [open]);

  const valid = emails
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter((e) => EMAIL_RE.test(e));

  const send = async () => {
    if (valid.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("sendPartyInvites", {
        event_id: event.id,
        emails: valid,
        app_url: window.location.origin,
      });
      const data = res.data || {};
      setResult({ sent: data.sent || 0, failed: data.failed || 0 });
    } catch (err) {
      setResult({ error: true });
    } finally {
      setSending(false);
    }
  };

  const openMailApp = () => {
    const subject = `You're invited: ${event.name}`;
    const body = `Add your food preferences for ${event.name}: ${link}`;
    const to = valid.join(",");
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> Request by email
          </DialogTitle>
          <DialogDescription>
            Guests get a link to add their preferences. No account needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="guest-emails">Guest emails</Label>
            <Textarea
              id="guest-emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="alex@example.com, sam@example.com"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Separate addresses with a comma. {valid.length > 0 && `${valid.length} ready to send.`}
            </p>
          </div>

          {result && !result.error && (
            <p className="text-sm text-muted-foreground">
              {result.sent > 0 ? `Sent to ${result.sent} guest${result.sent === 1 ? "" : "s"}. ` : ""}
              {result.failed > 0
                ? `${result.failed} could not be delivered — send those from your own email app below.`
                : ""}
            </p>
          )}
          {result && result.error && (
            <p className="text-sm text-destructive">Could not send right now. Use your email app instead.</p>
          )}

          <div className="grid gap-2">
            <Button onClick={send} disabled={sending || valid.length === 0}>
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Sending…" : "Send invites"}
            </Button>
            <Button variant="outline" onClick={openMailApp} disabled={valid.length === 0}>
              Open in my email app
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}