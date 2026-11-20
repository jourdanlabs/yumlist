import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { effectiveAgeRange } from "@/lib/ageRange";
import AuthLayout from "@/components/AuthLayout";
import AgeRangePicker from "@/components/AgeRangePicker";
import { Button } from "@/components/ui/button";
import { Cake, Loader2 } from "lucide-react";

// Every account needs an age range before it can use the app. The sign-up form
// collects it; this covers people who signed up with Google and anyone who
// joined before it was required.
export default function AgeGate() {
  const { user, loading, refresh } = useCurrentUser();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      await base44.auth.updateMe({ age_range: value });
      await refresh();
    } catch (err) {
      setError(err.message || "Could not save your age range");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (effectiveAgeRange(user)) return <Outlet />;

  return (
    <AuthLayout
      icon={Cake}
      title="One quick thing"
      subtitle="Tell us your age range to finish setting up your account"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}
      <div className="space-y-4">
        <AgeRangePicker value={value} onChange={setValue} disabled={saving} />
        <Button className="w-full h-12 font-medium" onClick={save} disabled={!value || saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          A parent in your family can change this later.
        </p>
      </div>
    </AuthLayout>
  );
}