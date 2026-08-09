// Currency rule: Pakistan uses PKR, India uses ₹ (INR), every other country
// uses USD. This is a deliberate simplification (not real per-country
// currency data) per product decision.
export function currencyForCountry(country: string): string {
  const c = country.trim().toLowerCase();
  if (c.includes("pakistan")) return "PKR";
  if (c.includes("india")) return "₹";
  return "$";
}
