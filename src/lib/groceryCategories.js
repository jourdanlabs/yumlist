// Shared grocery category presets + tag colors used across the app.
export const GROCERY_CATEGORIES = [
  "Produce",
  "Dairy & Eggs",
  "Meat & Fish",
  "Bakery",
  "Pantry staples",
  "Frozen",
  "Beverages",
  "Snacks",
  "Household",
  "Other",
];

// Tailwind class fragments per category for badges/tags.
export const CATEGORY_STYLES = {
  "Produce": "bg-green-500/15 text-green-700 dark:text-green-400",
  "Dairy & Eggs": "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  "Meat & Fish": "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  "Bakery": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "Pantry staples": "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  "Frozen": "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  "Beverages": "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  "Snacks": "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  "Household": "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  "Other": "bg-muted text-muted-foreground",
};

export const categoryStyle = (cat) => CATEGORY_STYLES[cat] || CATEGORY_STYLES["Other"];

export const normalizeCategory = (cat) =>
  GROCERY_CATEGORIES.includes(cat) ? cat : (cat ? "Other" : "Other");