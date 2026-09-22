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

// Keyword -> category mapping for auto-detection from item names.
const CATEGORY_KEYWORDS = [
  ["Fruits", ["apple", "banana", "orange", "grape", "strawberry", "blueberry", "mango", "pineapple", "lemon", "lime", "peach", "pear", "watermelon", "melon", "cherry", "raspberry", "kiwi", "fruit", "avocado", "coconut"]],
  ["Vegetables", ["tomato", "carrot", "lettuce", "spinach", "broccoli", "onion", "garlic", "potato", "celery", "cucumber", "pepper", "cabbage", "kale", "zucchini", "mushroom", "corn", "asparagus", "green bean", "salad", "vegetable", "veg"]],
  ["Canned Goods", ["canned", "can of", "soup can", "beans can", "tuna can", "canned beans", "canned corn", "canned tomato"]],
  ["Dairy", ["milk", "cheese", "yogurt", "butter", "cream", "kefir", "sour cream", "cottage cheese", "dairy", "eggnog"]],
  ["Meat", ["chicken", "beef", "pork", "bacon", "sausage", "turkey", "lamb", "ham", "steak", "ground beef", "meat", "ribs", "bratwurst"]],
  ["Fish & Seafood", ["salmon", "tuna", "shrimp", "cod", "tilapia", "crab", "lobster", "fish", "seafood", "sardine", "anchovy", "scallops", "clam", "oyster"]],
  ["Deli", ["deli", "sliced turkey", "sliced ham", "salami", "bologna", "prosciutto", "pastrami", "hot dog", "cold cut", "lunch meat"]],
  ["Condiments & Spices", ["ketchup", "mustard", "mayonnaise", "mayo", "relish", "hot sauce", "soy sauce", "vinegar", "oil", "salt", "pepper", "spice", "seasoning", "syrup", "jam", "jelly", "honey", "salsa", "dressing", "spread", "pesto", "tapenade"]],
  ["Snacks", ["chips", "crackers", "popcorn", "pretzel", "cookie", "candy", "chocolate", "granola bar", "protein bar", "snack", "nuts", "trail mix", "dried fruit", "jerky"]],
  ["Bread & Bakery", ["bread", "bagel", "muffin", "croissant", "roll", "bun", "tortilla", "pita", "bakery", "cake", "pastry", "donut", "scone"]],
  ["Beverages", ["water", "juice", "soda", "coffee", "tea", "beer", "wine", "milkshake", "smoothie", "drink", "lemonade", "energy drink", "kombucha", "sparkling", "seltzer", "cola", "beverage"]],
  ["Pasta, Rice & Cereal", ["pasta", "spaghetti", "noodle", "rice", "cereal", "oatmeal", "oats", "couscous", "quinoa", "macaroni", "penne", "lasagna", "ramen", "grain", "farro", "barley"]],
  ["Baking", ["flour", "sugar", "baking", "yeast", "baking soda", "baking powder", "vanilla", "cocoa", "cornstarch", "shortening", "frost", "icing", "mix", "batter"]],
  ["Frozen Foods", ["frozen", "ice cream", "frozen pizza", "frozen meal", "frozen vegetable", "frozen fruit", "popsicle", "freezer"]],
];

export const detectCategory = (text) => {
  if (!text) return "";
  const lower = text.toLowerCase();
  for (const [cat, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "";
};