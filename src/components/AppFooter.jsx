import React from "react";
import { Link } from "react-router-dom";

export default function AppFooter() {
  return (
    <footer className="no-print mt-10 pt-4 pb-2 border-t border-border text-center text-xs text-muted-foreground">
      <Link to="/privacy-policy" className="underline hover:text-foreground">
        Privacy Policy
      </Link>
    </footer>
  );
}