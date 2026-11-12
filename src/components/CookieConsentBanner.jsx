import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { CONSENT_OPEN_EVENT, applyConsent, readConsent, saveConsent } from "@/lib/cookieConsent";

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = readConsent();
    if (saved) applyConsent(saved);
    else setOpen(true);

    const handleOpen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  const choose = (granted) => {
    saveConsent({
      analytics_storage: granted,
      ad_storage: granted,
      ad_user_data: granted,
      ad_personalization: granted,
    });
    setOpen(false);
  };

  if (!open || location.pathname === "/privacy-policy") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 safe-bottom">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card shadow-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-2.5 flex-1">
          <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            We'd like to set cookies from our shopping partners so we can earn a commission when you buy something we link to.
            Nothing else changes if you decline, and you can change your mind any time.{" "}
            <Link to="/privacy-policy" className="underline text-foreground">
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => choose(false)}>
            Decline
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={() => choose(true)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}