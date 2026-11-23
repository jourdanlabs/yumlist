import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const highlights = [
  "Family preferences",
  "Recipe discovery",
  "Price comparison",
  "Shared pantry",
  "Allergy alerts",
];

export default function LandingHero() {
  return (
    <section className="yum-hero w-full overflow-hidden" aria-label="Meet YumList">
      <div className="yum-ripple" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-6xl flex-col justify-between gap-12 px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-heading max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-green-950 sm:text-5xl lg:text-6xl">
            Meet YumList
            <span className="mt-2 block text-green-900">A smarter way to feed your family</span>
          </h1>

          <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-green-950/85 sm:text-base">
            <p>
              Every family has different tastes. Some love tacos, others prefer pasta, and everyone
              has their own favorites.
            </p>
            <p>
              YumList brings your family's food preferences, recipe discovery, and grocery shopping
              together in one convenient place. Discover what everyone loves, find meals your family
              will enjoy, and compare grocery prices to make smarter shopping decisions.
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="min-w-[170px] rounded-full bg-green-950 text-lime-50 hover:bg-green-900"
            >
              <Link to="/register">Get started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[170px] rounded-full border-green-950 bg-transparent text-green-950 hover:bg-green-950 hover:text-lime-50"
            >
              <Link to="/login">Log in</Link>
            </Button>
          </div>

          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-green-900 sm:text-sm">
            One family. Different tastes. One smarter way to shop.
          </p>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-lime-50/90 sm:justify-between sm:text-sm">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-200" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}