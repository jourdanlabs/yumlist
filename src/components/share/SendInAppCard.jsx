import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import UserSearchPicker from "@/components/party/UserSearchPicker";
import { buildRecipeText } from "@/lib/shareText";

export default function SendInAppCard({ recipes, summary, senderName, familyName, onSent }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState([]);
  const [shareValue, setShareValue] = useState("tastes");
  const [sending, setSending] = useState(false);

  const handleSelect = (picked) => setSelected([picked]);
  const handleRemove = () => setSelected([]);

  const send = async () => {
    const target = selected[0];
    if (!target) { toast({ title: "Pick an app user first", variant: "destructive" }); return; }

    const isTastes = shareValue === "tastes";
    const recipe = isTastes ? null : recipes.find((r) => `recipe:${r.id}` === shareValue);
    const title = isTastes ? `${senderName}'s likes & dislikes` : recipe?.title || "Shared recipe";
    const body = isTastes ? summary : buildRecipeText({ recipe, sharedBy: senderName, familyName });

    setSending(true);
    try {
      await base44.entities.ShareNote.create({
        recipient_id: target.id,
        recipient_name: target.full_name,
        sender_name: senderName,
        title,
        body,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Send className="w-4 h-4" /> Send to someone on YumList</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserSearchPicker selected={selected} onSelect={handleSelect} onRemove={handleRemove} />

        <div className="space-y-2">
          <Label>What to send</Label>
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
        </div>

        <Button className="w-full" onClick={send} disabled={sending || selected.length === 0}>
          {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {sending ? "Sending…" : "Send in app"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">They'll see it in their Share tab.</p>
      </CardContent>
    </Card>
  );
}