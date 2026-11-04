import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FAMILY_ROLES, roleLabel, roleStyle } from "@/lib/familyRoles";
import { useToast } from "@/components/ui/use-toast";

export default function MemberRolesCard({ familyId, members = [], currentUserId }) {
  const { toast } = useToast();
  const [roles, setRoles] = useState({});
  const [selected, setSelected] = useState([]);
  const [role, setRole] = useState("adult");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!familyId) return;
    const rows = await base44.entities.MemberRole.filter({ family_id: familyId });
    const map = {};
    rows.forEach((r) => { map[r.member_id] = r; });
    setRoles(map);
  };

  useEffect(() => { load().catch(() => {}); }, [familyId]);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const assign = async () => {
    if (selected.length === 0) {
      toast({ title: "Select at least one member", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const toCreate = [];
      const toUpdate = [];
      selected.forEach((id) => {
        const member = members.find((m) => m.id === id);
        const memberName = member?.display_name || member?.full_name || member?.email || "";
        const existing = roles[id];
        if (existing) toUpdate.push({ id: existing.id, role, member_name: memberName });
        else toCreate.push({ family_id: familyId, member_id: id, member_name: memberName, role });
      });
      if (toCreate.length) await base44.entities.MemberRole.bulkCreate(toCreate);
      if (toUpdate.length) await base44.entities.MemberRole.bulkUpdate(toUpdate);
      await load();
      setSelected([]);
      toast({ title: `${roleLabel(role)} set for ${selected.length} member${selected.length > 1 ? "s" : ""}` });
    } catch (e) {
      toast({ title: "Could not assign roles", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" /> Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members found.</p>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tap members to select, then choose a role.</p>
            {members.map((m) => {
              const isSelected = selected.includes(m.id);
              const current = roles[m.id]?.role;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg p-2 text-left transition-colors min-h-[44px]",
                    isSelected ? "bg-primary/10 ring-1 ring-primary" : "bg-muted/40 hover:bg-muted/70"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {(m.display_name || m.full_name || m.email || "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate">
                      {m.display_name || m.full_name || m.email || "Unnamed member"}
                    </span>
                    {m.id === currentUserId && <span className="text-xs text-muted-foreground">You</span>}
                  </span>
                  {current ? (
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0", roleStyle(current))}>
                      {roleLabel(current)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex-shrink-0">No role</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Assign role</p>
          <div className="flex flex-wrap gap-2">
            {FAMILY_ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px]",
                  role === r.value ? roleStyle(r.value) : "bg-card text-muted-foreground border-border"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button className="w-full" onClick={assign} disabled={saving || selected.length === 0}>
            {saving ? "Saving…" : selected.length > 0 ? `Assign to ${selected.length} selected` : "Select members first"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}