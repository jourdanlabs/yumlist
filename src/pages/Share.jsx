import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Mail, MessageSquare, Copy, Check, ThumbsUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Share() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recipient, setRecipient] = useState("");

  useEffect(() => {
    if (!user?.family_id) return;
    let active = true;
    Promise.all([
      base44.entities.GroceryItem.filter({ family_id: user.family_id }),
      base44.entities.Recipe.filter({ family_id: user.family_id }),
      base44.entities.Reaction.filter({ family_id: user.family_id }),
    ]).then(([i, r, rx]) => {
      if (active) { setItems(i); setRecipes(r); setReactions(rx); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.family_id]);

  const myLikes = useMemo(() => {
    const likedItemIds = new Set(
      reactions.filter((r) => r.reaction === "like" && r.created_by_id === user?.id && r.target_type === "item").map((r) => r.target_id)
    );
    const likedRecipeIds = new Set(
      reactions.filter((r) => r.reaction === "like" && r.created_by_id === user?.id && r.target_type === "recipe").map((r) => r.target_id)
    );
    return {
      items: items.filter((i) => likedItemIds.has(i.id)),
      recipes: recipes.filter((r) => likedRecipeIds.has(r.id)),
    };
  }, [items, recipes, reactions, user?.id]);

  const summary = useMemo(() => {
    const name = user?.full_name || user?.email || "A family member";
    const lines = [`${name}'s likes from ${user?.family_name || "Family Pantry"}`, ""];
    if (myLikes.items.length) {
      lines.push("Grocery items I love:");
      myLikes.items.forEach((i) => lines.push(`  • ${i.name}${i.brand ? ` (${i.brand})` : ""}`));
      lines.push("");
    }
    if (myLikes.recipes.length) {
      lines.push("Recipes I love:");
      myLikes.recipes.forEach((r) => lines.push(`  • ${r.title}`));
    }
    if (!myLikes.items.length && !myLikes.recipes.length) {
      lines.push("No likes yet — start tapping the thumbs-up on items and recipes!");
    }
    return lines.join("\n");
  }, [myLikes, user]);

  const copy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: "Copied to clipboard" });
  };

  const sendEmail = () => {
    if (!recipient.trim()) { toast({ title: "Enter an email address", variant: "destructive" }); return; }
    const subject = `${user?.full_name || user?.email || "Family member"}'s likes`;
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
    toast({ title: "Opened in your email app" });
  };

  const sendText = () => {
    if (!recipient.trim()) { toast({ title: "Enter a phone number", variant: "destructive" }); return; }
    window.location.href = `sms:${encodeURIComponent(recipient)}?&body=${encodeURIComponent(summary)}`;
    toast({ title: "Opened in your messaging app" });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Share your likes</h1>
        <p className="text-sm text-muted-foreground">Send what you love to anyone — on the app, by email, or by text.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ThumbsUp className="w-4 h-4" /> Your likes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="h-24 rounded-xl bg-muted animate-pulse" />
          ) : myLikes.items.length === 0 && myLikes.recipes.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't liked anything yet. Tap the thumbs-up on items and recipes to build your shareable list.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium mb-1">Items ({myLikes.items.length})</div>
                <ul className="text-muted-foreground space-y-0.5">
                  {myLikes.items.map((i) => <li key={i.id}>• {i.name}</li>)}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Recipes ({myLikes.recipes.length})</div>
                <ul className="text-muted-foreground space-y-0.5">
                  {myLikes.recipes.map((r) => <li key={r.id}>• {r.title}</li>)}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Share2 className="w-4 h-4" /> Shareable summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea readOnly value={summary} rows={10} className="font-mono text-xs" />
          <Button variant="secondary" className="w-full" onClick={copy}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied" : "Copy summary"}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Email or phone number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={sendEmail}><Mail className="w-4 h-4 mr-2" /> Send email</Button>
            <Button variant="outline" onClick={sendText}><MessageSquare className="w-4 h-4 mr-2" /> Send text</Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">Email and text open your device's apps with the summary pre-filled.</p>
        </CardContent>
      </Card>
    </div>
  );
}