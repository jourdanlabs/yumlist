import React from "react";
import { Link } from "react-router-dom";
import { LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import ContactSupportForm from "@/components/support/ContactSupportForm";

export default function ContactSupport() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-8 rounded-xl border border-border bg-card p-5 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-6 h-6" />
            </span>
            <div className="min-w-0">
              <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground leading-tight">
                Contact Support
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Questions, bugs, or feedback about YumList? Send us a message and we'll get back to you.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-5">
          <ContactSupportForm />

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
              Other ways to reach us
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-green-700 shrink-0" />
                <span>
                  Email{" "}
                  <a href="mailto:info@ratemyrep.co" className="text-green-700 hover:underline break-all">
                    info@ratemyrep.co
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-green-700 shrink-0" />
                <span>
                  Privacy questions? See our{" "}
                  <Link to="/privacy-policy" className="text-green-700 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </li>
            </ul>
          </section>
        </div>

        <footer className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground text-center">
          <p>YumList — Less Guessing. More Yum!</p>
        </footer>
      </div>
    </div>
  );
}