export const AGE_RANGES = [
  { value: "under_13", label: "Under 13" },
  { value: "13_15", label: "13 to 15" },
  { value: "16_17", label: "16 to 17" },
  { value: "18_plus", label: "18 or older" },
];

export function ageRangeLabel(value) {
  return AGE_RANGES.find((r) => r.value === value)?.label || "";
}

// A parent's setting always wins over what the person declared for themselves.
export function effectiveAgeRange(user) {
  return user?.parent_age_range || user?.age_range || "";
}

// Store offers and affiliate "shop at" links count as advertising, so only
// people whose effective range is 18 or older (or a parent set it so) see them.
export function canSeeAds(user) {
  return effectiveAgeRange(user) === "18_plus";
}

export function isChildAccount(user) {
  const range = effectiveAgeRange(user);
  return range === "under_13" || range === "13_15" || range === "16_17";
}