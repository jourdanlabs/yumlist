import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cake } from "lucide-react";
import { AGE_RANGES, ageRangeLabel, effectiveAgeRange } from "@/lib/ageRange";
import { useToast } from "@/components/ui/use-toast";

const NO_OVERRIDE = "none";

export default function MemberAgeRangesCard({ members = [], currentUser, canManage, onUpdated }) {
  const { toast } = useToast();
  const [rows, setRows] = useState(members);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    setRows(members);
  }, [members]);

  const save = async (memberId, value) => {
    const range = value === NO_OVERRIDE ? "" : value;
    setSavingId(memberId);
    try {
      await base44.functions.invoke("setMemberAgeRange", { user_id: memberId, age_range: range });
      setRows((prev) => prev.map((m) => (m.id === memberId ? { ...m, parent_age_range: range } : m)));
      onUpdated?.();
      toast({ title: range ? `Age range set to ${ageRangeLabel(range)}` : "Parent setting cleared" });
    } catch (err) {
      toast({
        title: "Could not save age range",
        description: err?.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base flex items-center gap-2">
          <Cake className="w-4 h-4" /> Age ranges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members found.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((m) => {
              const name = m.display_name || m.full_name || m.email || "Unnamed member";
              const effective = effectiveAgeRange(m);
              return (
                <div key={m.id} className="rounded-lg bg-muted/40 p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {name}
                      {m.id === currentUser?.id ? " (you)" : ""}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {effective ? ageRangeLabel(effective) : "Not set"}
                    </span>
                  </div>
                  {canManage ? (
                    <Select
                      value={m.parent_age_range || NO_OVERRIDE}
                      onValueChange={(value) => save(m.id, value)}
                      disabled={savingId === m.id}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_OVERRIDE}>No parent setting</SelectItem>
                        {AGE_RANGES.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    m.parent_age_range && <p className="text-xs text-muted-foreground">Set by a parent</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {canManage && (
          <p className="text-xs text-muted-foreground">
            A parent's setting wins over the range the member picked for themselves.
          </p>
        )}
      </CardContent>
    </Card>
  );
}