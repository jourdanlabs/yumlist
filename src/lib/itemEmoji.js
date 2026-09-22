// Picks a representative emoji for a grocery item based on its name/category,
// used as the placeholder "photo" when no image_url is set.

const KEYWORDS = [
  // Produce
  ["banana", "🍌"], ["apple", "🍎"], ["orange", "🍊"], ["lemon", "🍋"], ["lime", "🍋"],
  ["strawberry", "🍓"], ["berries", "🫐"], ["blueberry", "🫐"], ["raspberry", "🫐"],
  ["grape", "🍇"], ["watermelon", "🍉"], ["melon", "🍈"], ["peach", "🍑"], ["pear", "🍐"],
  ["pineapple", "🍍"], ["mango", "🥭"], ["kiwi", "🥝"], ["avocado", "🥑"], ["tomato", "🍅"],
  ["lettuce", "🥬"], ["spinach", "🥬"], ["kale", "🥬"], ["cabbage", "🥬"], ["salad", "🥗"],
  ["carrot", "🥕"], ["cucumber", "🥒"], ["pepper", "🫑"], ["chili", "🌶️"], ["onion", "🧅"],
  ["garlic", "🧄"], ["potato", "🥔"], ["sweet potato", "🍠"], ["corn", "🌽"], ["broccoli", "🥦"],
  ["mushroom", "🍄"], ["herbs", "🌿"], ["basil", "🌿"], ["cilantro", "🌿"], ["ginger", "🫚"],
  // Dairy & Eggs
  ["milk", "🥛"], ["cheese", "🧀"], ["butter", "🧈"], ["egg", "🥚"], ["yogurt", "🥛"],
  ["cream", "🥛"], ["cream cheese", "🧀"],
  // Meat & Fish
  ["chicken", "🍗"], ["turkey", "🦃"], ["beef", "🥩"], ["steak", "🥩"], ["pork", "🥓"],
  ["bacon", "🥓"], ["ham", "🍖"], ["sausage", "🌭"], ["fish", "🐟"], ["salmon", "🐟"],
  ["tuna", "🐟"], ["shrimp", "🦐"], ["prawn", "🦐"], ["crab", "🦀"], ["lobster", "🦞"],
  // Bakery
  ["bread", "🍞"], ["bagel", "🥯"], ["baguette", "🥖"], ["croissant", "🥐"], ["muffin", "🧁"],
  ["cake", "🍰"], ["donut", "🍩"], ["cookie", "🍪"], ["pancake", "🥞"], ["waffle", "🧇"],
  ["tortilla", "🫓"], ["roll", "🍞"], ["bun", "🍞"],
  // Pantry staples
  ["rice", "🍚"], ["pasta", "🍝"], ["noodle", "🍜"], ["spaghetti", "🍝"], ["macaroni", "🍝"],
  ["cereal", "🥣"], ["oats", "🥣"], ["oatmeal", "🥣"], ["flour", "🌾"], ["sugar", "🍬"],
  ["oil", "🫒"], ["olive oil", "🫒"], ["vinegar", "🧴"], ["salt", "🧂"], ["pepper", "🧂"],
  ["spice", "🧂"], ["honey", "🍯"], ["jam", "🍓"], ["peanut butter", "🥜"], ["nut", "🥜"],
  ["almond", "🥜"], ["cashew", "🥜"], ["walnut", "🥜"], ["peanut", "🥜"], ["seed", "🌱"],
  ["soup", "🥫"], ["can", "🥫"], ["bean", "🫘"], ["lentil", "🫘"], ["chickpea", "🫘"],
  ["soy sauce", "🍶"], ["salsa", "🥫"], ["pasta sauce", "🥫"], ["tomato sauce", "🥫"],
  // Frozen
  ["ice cream", "🍨"], ["frozen", "🧊"], ["pizza", "🍕"], ["fries", "🍟"],
  // Beverages
  ["water", "💧"], ["juice", "🧃"], ["soda", "🥤"], ["cola", "🥤"], ["coffee", "☕"],
  ["tea", "🍵"], ["beer", "🍺"], ["wine", "🍷"], ["champagne", "🍾"], ["smoothie", "🥤"],
  ["milkshake", "🥤"], ["energy drink", "🥤"], ["kombucha", "🧋"], ["matcha", "🍵"],
  // Snacks
  ["chocolate", "🍫"], ["candy", "🍬"], ["chip", "🍟"], ["popcorn", "🍿"], ["cracker", "🍪"],
  ["pretzel", "🥨"], ["granola", "🥣"], ["trail mix", "🥜"], ["pudding", "🍮"],
  // Household
  ["soap", "🧼"], ["detergent", "🧴"], ["shampoo", "🧴"], ["toothpaste", "🪥"], ["paper towel", "🧻"],
  ["toilet paper", "🧻"], ["tissue", "🧻"], ["cleaning", "🧽"], ["sponge", "🧽"], ["trash bag", "🗑️"],
  ["aluminum foil", "🧻"], ["dish", "🧽"], ["laundry", "🧺"], ["candle", "🕯️"],
];

const CATEGORY_FALLBACK = {
  "Produce": "🥬",
  "Dairy & Eggs": "🥛",
  "Meat & Fish": "🥩",
  "Bakery": "🍞",
  "Pantry staples": "🥫",
  "Frozen": "🧊",
  "Beverages": "🥤",
  "Snacks": "🍫",
  "Household": "🧴",
  "Other": "🥫",
};

export function itemEmoji(item = {}) {
  const name = (item.name || "").toLowerCase();
  const hit = KEYWORDS.find(([kw]) => name.includes(kw));
  if (hit) return hit[1];
  return CATEGORY_FALLBACK[item.category] || "🥫";
}