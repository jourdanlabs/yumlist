export function buildAffiliateUrl(template, query) {
  if (!template) return null;
  return template.replace(/\{query\}/g, encodeURIComponent(query || ""));
}

export function findProgram(programs, storeName) {
  const name = (storeName || "").toLowerCase().trim();
  if (!name) return null;
  return (
    programs.find((p) => {
      const retailer = (p.retailer || "").toLowerCase().trim();
      return retailer && (name.includes(retailer) || retailer.includes(name));
    }) || null
  );
}