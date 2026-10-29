import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Mail, MessageSquare, Copy, Check, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import UserSearchPicker from "@/components/party/UserSearchPicker";
import { buildRecipeText } from "@/lib/shareText";

export default function ShareWithFriendsCard({ recipes = [], summary, senderName, familyName, onSent }) {
  const { toast } = useToast();
  const [shareValue, setShareValue] = useState("tastes");
  const [selected, setSelected] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const recipe = shareValue === "tastes" ? null : recipes.find((r) => `recipe:${r.id}` === shareValue);
  const isTastes = !recipe;
  const preview = isTastes ? summary : buildRecipeText({ recipe, sharedBy: senderName, familyName });
  const title = isTastes ? `${senderName}'s likes & dislikes` : recipe?.title || "Shared recipe";

  const copy = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: "Copied to clipboard" });
  };

  const sendInApp = async () => {
    const target = selected[0];
    if (!target) { toast({ title: "Pick an app user first", variant: "destructive" }); return; }
    setSending(true);
    try {
      await base44.entities.ShareNote.create({
        recipient_id: target.id,
        recipient_name: target.full_name,
        sender_name: senderName,
        title,
        body: preview,
        kind: isTastes ? "tastes" : "recipe",
      });
      toast({ title: `Shared with ${target.full_name}` });
      setSelected([]);
      onSent?.();
    } catch (e) {
      toast({ title: "Couldn't send that share", description: e?.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const sendEmail = () => {
    if (!recipient.trim()) { toast({ title: "Enter an email address", variant: "destructive" }); return; }
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(preview)}`;
    toast({ title: "Opened in your email app" });
  };

  const sendText = () => {
    if (!recipient.trim()) { toast({ title: "Enter a phone number", variant: "destructive" }); return; }
    window.location.href = `sms:${encodeURIComponent(recipient)}?&body=${encodeURIComponent(preview)}`;
    toast({ title: "Opened in your messaging app" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Share2 className="w-4 h-4" /> Share with friends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>What to share</Label>
          <Select value={shareValue} onValueChange={setShareValue}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tastes">Your likes & dislikes</SelectItem>
              {recipes.map((r) => (
                <SelectItem key={r.id} value={`recipe:${r.id}`}>{r.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {recipes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              You don't have any recipes yet. <Link to="/recipes" className="text-primary hover:underline">Add one on the Recipes page</Link> to share it.
            </p>
          )}
        </div>

        <Textarea readOnly value={preview} rows={8} className="text-xs" />
        <Button variant="secondary" className="w-full" onClick={copy}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied" : "Copy"}
        </Button>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2"><Send className="w-4 h-4" /> Send to someone on YumList</p>
          <UserSearchPicker selected={selected} onSelect={(picked) => setSelected([picked])} onRemove={() => setSelected([])} />
          <Button className="w-full" onClick={sendInApp} disabled={sending || selected.length === 0}>
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {sending ? "Sending…" : "Send in app"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">They'll see it in their Share tab.</p>
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2"><Mail className="w-4 h-4" /> Send by email or text</p>
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Email or phone number"
          />
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={sendEmail}><Mail className="w-4 h-4 mr-2" /> Send email</Button>
            <Button variant="outline" onClick={sendText}><MessageSquare className="w-4 h-4 mr-2" /> Send text</Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">These open your device's apps with the message pre-filled.</p>
        </div>
      </CardContent>
    </Card>
  );
}