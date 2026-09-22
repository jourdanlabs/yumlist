// Shared grocery category presets + tag colors used across the app.
export const GROCERY_CATEGORIES = [
  "Baking",
  "Beverages",
  "Bread & Bakery",
  "Canned Goods",
  "Condiments & Spices",
  "Dairy",
  "Deli",
  "Fish & Seafood",
  "Frozen Foods",
  "Fruits",
  "Meat",
  "Pasta, Rice & Cereal",
  "Snacks",
  "Vegetables",
  "Other",
];

// Tailwind class fragments per category for badges/tags.
export const CATEGORY_STYLES = {
  "Fruits": "bg-green-500/15 text-green-700 dark:text-green-400",
  "Vegetables": "bg-lime-500/15 text-lime-700 dark:text-lime-400",
  "Canned Goods": "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  "Dairy": "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  "Meat": "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  "Fish & Seafood": "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  "Deli": "bg-red-500/15 text-red-700 dark:text-red-400",
  "Condiments & Spices": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "Snacks": "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  "Bread & Bakery": "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  "Beverages": "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  "Pasta, Rice & Cereal": "bg-stone-500/15 text-stone-700 dark:text-stone-300",
  "Baking": "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
  "Frozen Foods": "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  "Other": "bg-muted text-muted-foreground",
};

export const categoryStyle = (cat) => CATEGORY_STYLES[cat] || CATEGORY_STYLES["Other"];

export const normalizeCategory = (cat) =>
  GROCERY_CATEGORIES.includes(cat) ? cat : (cat ? "Other" : "Other");