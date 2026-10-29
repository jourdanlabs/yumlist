export function partyLink(token) {
  if (!token) return "";
  return `${window.location.origin}/party-invite/${token}`;
}