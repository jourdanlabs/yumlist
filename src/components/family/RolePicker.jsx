import React from "react";
import { cn } from "@/lib/utils";
import { FAMILY_ROLES, roleStyle } from "@/lib/familyRoles";

export default function RolePicker({ value, onChange, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FAMILY_ROLES.map((r) => {
        const Icon = r.icon;
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(r.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors min-h-[44px] disabled:opacity-60",
              active ? roleStyle(r.value) : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="leading-tight">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}