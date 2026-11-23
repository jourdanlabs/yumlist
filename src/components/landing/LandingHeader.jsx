import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

const LOGO = "https://media.base44.com/images/public/6a85c116bb660295b89c8343/5268cd7c7_YumListLOGO.png";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Image src={LOGO} alt="YumList" className="h-10 w-10" fittingType="fit" />
          <span className="font-heading text-lg font-bold text-foreground">YumList</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#why" className="hover:text-foreground">Why YumList</a>
          <Link to="/contact" className="hover:text-foreground">Support</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}