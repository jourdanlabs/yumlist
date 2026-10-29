import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ShareRecipeCard from "@/components/share/ShareRecipeCard";
import ShareWithFriendsCard from "@/components/share/ShareWithFriendsCard";
import ReceivedShares from "@/components/share/ReceivedShares";
import { buildTasteSummary } from "@/lib/shareText";

export default function Share() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [allergyFlags, setAllergyFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    if (!user?.family_id) return;
    let active = true;
    Promise.all([
      base44.entities.GroceryItem.filter({ family_id: user.family_id }),
      base44.entities.Recipe.filter({ family_id: user.family_id }),
      base44.entities.Reaction.filter({ family_id: user.family_id }),
      base44.entities.AllergyFlag.filter({ family_id: user.family_id }, "-created_date"),
    ]).then(([i, r, rx, flags]) => {
      if (active) {
        setItems(i);
        setRecipes(r);
        setReactions(rx);
        setAllergyFlags(Array.isArray(flags) ? flags : (flags?.items || []));
        setLoading(false);
      }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.family_id]);

  const loadReceived = () => {
    if (!user?.id) return;
    base44.entities.ShareNote.filter({ recipient_id: user.id }, "-created_date", 20)
      .then((res) => setReceived(Array.isArray(res) ? res : (res?.items || [])))
      .catch(() => {});
  };

  useEffect(() => { loadReceived(); }, [user?.id]);

  const deleteReceived = (note) => {
    base44.entities.ShareNote.delete(note.id)
      .then(() => setReceived((prev) => prev.filter((n) => n.id !== note.id)))
      .catch(() => toast({ title: "Couldn't remove that share", variant: "destructive" }));
  };

  const collectReactions = (type) => {
    const itemIds = new Set(
      reactions.filter((r) => r.reaction === type && r.created_by_id === user?.id && r.target_type === "item").map((r) => r.target_id)
    );
    const recipeIds = new Set(
      reactions.filter((r) => r.reaction === type && r.created_by_id === user?.id && r.target_type === "recipe").map((r) => r.target_id)
    );
    return {
      items: items.filter((i) => itemIds.has(i.id)),
      recipes: recipes.filter((r) => recipeIds.has(r.id)),
    };
  };

  const myLikes = useMemo(() => collectReactions("like"), [items, recipes, reactions, user?.id]);
  const myDislikes = useMemo(() => collectReactions("dislike"), [items, recipes, reactions, user?.id]);

  const myAvoid = useMemo(() => {
    const myNames = [user?.display_name, user?.full_name]
      .filter(Boolean)
      .map((n) => n.trim().toLowerCase());
    return allergyFlags.filter(
      (f) => !f.member_name || myNames.includes(f.member_name.trim().toLowerCase())
    );
  }, [allergyFlags, user?.display_name, user?.full_name]);

  const summary = useMemo(
    () => buildTasteSummary({ user, likes: myLikes, dislikes: myDislikes, avoid: myAvoid }),
    [myLikes, myDislikes, myAvoid, user]
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Share your likes & dislikes</h1>
        <p className="text-sm text-muted-foreground">Send what you love (and don't) to anyone — on the app, by email, or by text.</p>
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
          <CardTitle className="text-base flex items-center gap-2"><ThumbsDown className="w-4 h-4" /> Your dislikes & allergies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="h-24 rounded-xl bg-muted animate-pulse" />
          ) : myDislikes.items.length === 0 && myDislikes.recipes.length === 0 && myAvoid.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing on your avoid list yet. Tap the thumbs-down on items and recipes, or flag an allergy, to build your shareable list.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="font-medium mb-1">Items ({myDislikes.items.length})</div>
                  <ul className="text-muted-foreground space-y-0.5">
                    {myDislikes.items.map((i) => <li key={i.id}>• {i.name}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">Recipes ({myDislikes.recipes.length})</div>
                  <ul className="text-muted-foreground space-y-0.5">
                    {myDislikes.recipes.map((r) => <li key={r.id}>• {r.title}</li>)}
                  </ul>
                </div>
              </div>

              <div>
                <div className="font-medium mb-1">Allergies & sensitivities ({myAvoid.length})</div>
                {myAvoid.length === 0 ? (
                  <p className="text-muted-foreground">None flagged.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {myAvoid.map((f) => (
                      <li key={f.id} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                        <span>
                          <span className="font-medium">{f.item_name}</span>
                          <span className="text-muted-foreground">
                            {" · "}{f.flag_type}{f.severity ? ` · ${f.severity}` : ""}{f.member_name ? ` · ${f.member_name}` : ""}
                          </span>
                          {f.notes && <span className="block text-xs text-muted-foreground">{f.notes}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ShareWithFriendsCard
        recipes={recipes}
        summary={summary}
        senderName={user?.full_name || user?.email || "Your family"}
        familyName={user?.family_name}
        onSent={loadReceived}
      />

      <ShareRecipeCard
        recipes={recipes}
        sharedBy={user?.full_name || user?.email || "Your family"}
        familyName={user?.family_name}
      />

      <ReceivedShares notes={received} onDelete={deleteReceived} />
    </div>
  );
}