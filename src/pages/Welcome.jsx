import React from "react";
import { Link } from "react-router-dom";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingWhy from "@/components/landing/LandingWhy";
import LandingCta from "@/components/landing/LandingCta";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingWhy />
        <LandingCta />
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-muted-foreground sm:flex-row sm:px-8 sm:text-sm">
          <p>YumList — Less Guessing. More Yum!</p>
          <nav className="flex items-center gap-4">
            <Link to="/contact" className="underline hover:text-foreground">Contact Support</Link>
            <Link to="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}