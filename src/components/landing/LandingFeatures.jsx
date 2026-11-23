import React from "react";
import { Heart, ChefHat, ShoppingCart, PiggyBank, Users } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Your family. Your food. Your preferences.",
    body: "Everyone has a say in what's on the menu! Capture individual family members' food preferences and bring everyone's favorites together.",
  },
  {
    icon: ChefHat,
    title: "Discover delicious recipes",
    body: "Find recipe inspiration based on the foods your family enjoys. Make meal planning easier and discover new favorites along the way.",
  },
  {
    icon: ShoppingCart,
    title: "Compare grocery prices",
    body: "Compare grocery prices across available retailers. Find opportunities to save money on the products your family wants.",
  },
  {
    icon: PiggyBank,
    title: "Shop smarter",
    body: "Make more informed grocery shopping decisions by comparing available products and prices before heading to your preferred retailer.",
  },
  {
    icon: Users,
    title: "Make food a family affair",
    body: "Bring the family together around food. Make it easier to understand everyone's tastes, discover new meals, and simplify grocery shopping.",
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-4xl">
          One family. Different tastes. One smarter way to shop.
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-heading text-base font-semibold leading-snug text-foreground sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}