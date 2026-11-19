import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cake, Loader2 } from "lucide-react";
import { AGE_RANGES, ageRangeLabel } from "@/lib/ageRange";
import { toast } from "@/components/ui/use-toast";

export default function AgeRangeCard() {
  const { user, refresh } = useCurrentUser();
  const [saving, setSaving] = useState(false);

  const mine = user?.age_range || "";
  const override = user?.parent_age_range || "";

  const save = async (value) => {
    if (value === mine) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({ age_range: value });
      await refresh();
      toast({ title: "Age range saved" });
    } catch (err) {
      toast({ title: "Could not save age range", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="w-5 h-5" /> Age range
        </CardTitle>
        <CardDescription>Pick the range that fits you. A parent can set it for you too.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {override && (
          <p className="text-xs rounded-lg bg-muted/60 px-3 py-2 leading-relaxed">
            A parent set your age range to <strong>{ageRangeLabel(override)}</strong>. That is the one the app uses until a parent changes it.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {AGE_RANGES.map((range) => (
            <Button
              key={range.value}
              variant={mine === range.value ? "default" : "outline"}
              disabled={saving}
              onClick={() => save(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {saving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </>
          ) : (
            "You can change this any time."
          )}
        </p>
      </CardContent>
    </Card>
  );
}