import React from "react";
import { Check } from "lucide-react";
import { Image } from "@/components/ui/image";

const reasons = [
  "Personalized family food preferences",
  "Recipe discovery and meal inspiration",
  "Grocery price comparisons",
  "Multiple grocery retailer options",
  "A smarter approach to family shopping",
];

const IMAGE =
  "https://media.base44.com/images/public/6a85c116bb660295b89c8343/5d7d3e3b8b10fd2c300bf19f98ea16b6_generated_image.png";

export default function LandingWhy() {
  return (
    <section id="why" className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12">
        <Image
          src={IMAGE}
          alt="A family cooking together in their kitchen"
          className="aspect-[4/3] w-full rounded-xl border border-border object-cover shadow-sm"
        />

        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-4xl">
            Why YumList?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Everything your family needs to decide what to eat and what to buy, in one place.
          </p>
          <ul className="mt-6 space-y-3">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-3 text-sm text-foreground sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}