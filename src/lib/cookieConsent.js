export const CONSENT_STORAGE_KEY = "yumlist_cookie_consent";
export const CONSENT_OPEN_EVENT = "cookie-consent:open";

export function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function applyConsent(choice) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  const state = (granted) => (granted ? "granted" : "denied");
  gtag("consent", "update", {
    analytics_storage: state(choice.analytics_storage),
    ad_storage: state(choice.ad_storage),
    ad_user_data: state(choice.ad_user_data),
    ad_personalization: state(choice.ad_personalization),
  });
}

export function saveConsent(choice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    /* storage blocked — the choice still applies for this page view */
  }
  applyConsent(choice);
}

export function hasAffiliateConsent() {
  const saved = readConsent();
  return !!(saved && saved.ad_storage && saved.ad_user_data);
}

export function openConsentBanner() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}