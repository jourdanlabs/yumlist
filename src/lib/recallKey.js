// Shared identity for one recall alert. Must normalize the same way checkRecalls
// does server-side, so an alert a family cleared stays cleared.
function normalize(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function recallKey(alert) {
  const number = (alert && alert.recall && alert.recall.recall_number) || "";
  return `${normalize(alert && alert.item_name)}|${number}`;
}