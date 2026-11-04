import React from "react";
import { cn } from "@/lib/utils";
import { roleIcon, roleLabel, roleStyle } from "@/lib/familyRoles";

export default function RoleBadge({ value, className }) {
  const Icon = roleIcon(value);
  if (!Icon) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        roleStyle(value),
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {roleLabel(value)}
    </span>
  );
}