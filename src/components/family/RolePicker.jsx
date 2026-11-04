import React from "react";
import { cn } from "@/lib/utils";
import { FAMILY_ROLES, roleStyle } from "@/lib/familyRoles";

export default function RolePicker({ value, onChange, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FAMILY_ROLES.map((r) => (
        <button
          key={r.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(r.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px] disabled:opacity-60",
            value === r.value ? roleStyle(r.value) : "bg-card text-muted-foreground border-border hover:bg-muted"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}