import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { roleLabel } from "@/lib/familyRoles";
import RolePicker from "@/components/family/RolePicker";
import RoleBadge from "@/components/family/RoleBadge";
import { useToast } from "@/components/ui/use-toast";

export default function MemberRolesCard({ members = [], currentUser, onUpdated }) {
  const { toast } = useToast();
  const [role, setRole] = useState(currentUser?.family_role || "");
  const [saving, setSaving] = useState(false);

  const save = async (value) => {
    const previous = role;
    setRole(value);
    setSaving(true);
    try {
      await base44.auth.updateMe({ family_role: value });
      onUpdated?.();
      toast({ title: `You're ${roleLabel(value)}` });
    } catch (e) {
      setRole(previous);
      toast({ title: "Could not save your role", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const roleOf = (m) => (m.id === currentUser?.id ? role : m.family_role);

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" /> Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Your role in the family</p>
          <RolePicker value={role} onChange={save} disabled={saving} />
          <p className="text-xs text-muted-foreground">You pick this yourself — change it anytime.</p>
        </div>

        <div className="h-px bg-border" />

        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members found.</p>
        ) : (
          <div className="space-y-1">
            {members.map((m) => {
              const memberRole = roleOf(m);
              return (
                <div key={m.id} className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2 min-h-[44px]">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {(m.display_name || m.full_name || m.email || "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate">
                      {m.display_name || m.full_name || m.email || "Unnamed member"}
                    </span>
                    {m.id === currentUser?.id && <span className="text-xs text-muted-foreground">You</span>}
                  </span>
                  {memberRole ? (
                    <RoleBadge value={memberRole} className="flex-shrink-0 max-w-[55%]" />
                  ) : (
                    <span className="text-xs text-muted-foreground flex-shrink-0">No role yet</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}