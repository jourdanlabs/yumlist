export const FAMILY_ROLES = [
  { value: "parent", label: "Parent / Guardian", style: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" },
  { value: "adult", label: "Adult", style: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" },
  { value: "teen", label: "Teen", style: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  { value: "child", label: "Child", style: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
  { value: "guest", label: "Guest", style: "bg-muted text-muted-foreground border-border" },
];

export function roleStyle(value) {
  return FAMILY_ROLES.find((r) => r.value === value)?.style || "";
}

export function roleLabel(value) {
  return FAMILY_ROLES.find((r) => r.value === value)?.label || "";
}