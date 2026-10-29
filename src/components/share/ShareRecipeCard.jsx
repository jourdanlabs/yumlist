import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChefHat, Copy, Check, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { buildRecipeText } from "@/lib/shareText";

export default function ShareRecipeCard({ recipes, sharedBy, familyName }) {
  const { toast } = useToast();
  const [recipeId, setRecipeId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState(false);

  const recipe = recipes.find((r) => r.id === recipeId);

  const text = useMemo(
    () => buildRecipeText({ recipe, sharedBy, familyName }),
    [recipe, sharedBy, familyName]
  );

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: "Recipe copied" });
  };

  const sendEmail = () => {
    if (!recipe) { toast({ title: "Pick a recipe first", variant: "destructive" }); return; }
    if (!recipient.trim()) { toast({ title: "Enter an email address", variant: "destructive" }); return; }
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(recipe.title)}&body=${encodeURIComponent(text)}`;
    toast({ title: "Opened in your email app" });
  };

  const sendText = () => {
    if (!recipe) { toast({ title: "Pick a recipe first", variant: "destructive" }); return; }
    if (!recipient.trim()) { toast({ title: "Enter a phone number", variant: "destructive" }); return; }
    window.location.href = `sms:${encodeURIComponent(recipient)}?&body=${encodeURIComponent(text)}`;
    toast({ title: "Opened in your messaging app" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ChefHat className="w-4 h-4" /> Share one of your recipes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don't have any recipes yet. <Link to="/recipes" className="text-primary hover:underline">Add one on the Recipes page</Link> to share it.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Recipe</Label>
              <Select value={recipeId} onValueChange={setRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Textarea readOnly value={text} rows={8} placeholder="Choose a recipe to preview what you'll share" className="text-xs" />

            <Button variant="secondary" className="w-full" onClick={copy} disabled={!recipe}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy recipe"}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="recipe-recipient">Recipient</Label>
              <Input
                id="recipe-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Email or phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={sendEmail} disabled={!recipe}>
                <Mail className="w-4 h-4 mr-2" /> Send email
              </Button>
              <Button variant="outline" onClick={sendText} disabled={!recipe}>
                <MessageSquare className="w-4 h-4 mr-2" /> Send text
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}