import {
  Crown, Star, Cake, Wheat, EggFried, Trophy, WandSparkles, Snowflake, Flame, Candy,
  Beef, Cookie, Salad, Sparkles, Cherry, PartyPopper, Compass, Heart, Soup, ChefHat,
} from "lucide-react";

export const FAMILY_ROLES = [
  { value: "big_cheese", label: "The Big Cheese", icon: Crown, style: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  { value: "snack_superstar", label: "The Snack Superstar", icon: Star, style: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800" },
  { value: "cupcake_of_kindness", label: "The Cupcake of Kindness", icon: Cake, style: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800" },
  { value: "golden_grater", label: "The Golden Grater", icon: Wheat, style: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" },
  { value: "breakfast_boss", label: "The Breakfast Boss", icon: EggFried, style: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  { value: "kitchen_mvp", label: "The Kitchen MVP", icon: Trophy, style: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
  { value: "recipe_rebel", label: "The Recipe Rebel", icon: WandSparkles, style: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800" },
  { value: "cool_cucumber", label: "The Cool Cucumber", icon: Snowflake, style: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800" },
  { value: "hot_potato", label: "The Hot Potato", icon: Flame, style: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" },
  { value: "jellybean_jester", label: "The Jellybean Jester", icon: Candy, style: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800" },
  { value: "family_meatball", label: "The Family Meatball", icon: Beef, style: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" },
  { value: "sugar_sprinkler", label: "The Sugar Sprinkler", icon: Cookie, style: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" },
  { value: "pickle_pro", label: "The Pickle Pro", icon: Salad, style: "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-800" },
  { value: "waffle_wizard", label: "The Waffle Wizard", icon: Sparkles, style: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  { value: "berry_best", label: "The Berry Best", icon: Cherry, style: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" },
  { value: "popcorn_spark", label: "The Popcorn Spark", icon: PartyPopper, style: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800" },
  { value: "noodle_navigator", label: "The Noodle Navigator", icon: Compass, style: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800" },
  { value: "honey_hero", label: "The Honey Hero", icon: Heart, style: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  { value: "mac_cheese_mvp", label: "The Mac & Cheese MVP", icon: Soup, style: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" },
  { value: "flavor_creator", label: "The Flavor Creator", icon: ChefHat, style: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
];

export function roleStyle(value) {
  return FAMILY_ROLES.find((r) => r.value === value)?.style || "";
}

export function roleLabel(value) {
  return FAMILY_ROLES.find((r) => r.value === value)?.label || "";
}

export function roleIcon(value) {
  return FAMILY_ROLES.find((r) => r.value === value)?.icon;
}