import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="rounded-2xl bg-green-950 px-6 py-12 text-center sm:px-12 sm:py-16">
        <h2 className="font-heading text-2xl font-bold leading-tight text-lime-50 sm:text-4xl">
          Less guesswork. More yum. Smarter shopping.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-lime-50/80 sm:text-base">
          Download YumList and discover a better way to feed your family!
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="min-w-[170px] rounded-full bg-lime-100 text-green-950 hover:bg-lime-50">
            <Link to="/register">Get started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-w-[170px] rounded-full border-lime-100/60 bg-transparent text-lime-50 hover:bg-lime-50 hover:text-green-950"
          >
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}