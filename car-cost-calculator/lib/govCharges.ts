// Centralized, dated reference for Punjab Excise & Taxation Department
// vehicle charges, so rates can be updated in one place as the department
// revises them (typically via the annual Finance Act / provincial budget).
//
// Source: https://excise.punjab.gov.pk/motorvehicle_tax — the department's
// live "Motor Vehicle Tax" page, "Rate of New Registration" and "Rates of
// Token tax ... Motor Car" tables, retrieved August 2026. The department
// revises these rates during the fiscal year by notification — this module
// is never presented as more current than PUNJAB_GOV_SOURCE.retrievedAt,
// and callers should tell the user to confirm before paying.

export const PUNJAB_GOV_SOURCE = {
  label: "Punjab Excise, Taxation & Narcotics Control Department — Motor Vehicle Tax schedule",
  link: "https://excise.punjab.gov.pk/motorvehicle_tax",
  retrievedAt: "2026-08",
};

// ---------------------------------------------------------------------
// Registration fee — "Rate of New Registration" table. One-time fee as a
// % of the vehicle's declared/invoice value, banded by engine capacity.
// This part of the schedule is unambiguous (flat percentages, no
// conflicting figures across the department's own published columns).
// ---------------------------------------------------------------------
export function registrationFeePercent(cc: number): number {
  if (cc <= 1000) return 0.01;
  if (cc <= 2000) return 0.02;
  return 0.04;
}

// ---------------------------------------------------------------------
// Token tax (motor vehicle tax) — "Rates of Token tax ... Motor Car"
// table, 2026-27 column.
//
// - Up to 1000cc is a ONE-TIME lifetime token (PKR 20,000), not an annual
//   recurring charge — this must be folded into the one-time registration
//   total and never spread into monthly/annual ownership cost.
// - Above 1000cc, the department taxes annually as a % of invoice value.
//   The published table explicitly gives 0.3% at the 1001-1199cc band and
//   0.4% at the 2001-2500cc band; the intervening bands share a rowspan
//   in the department's own table rather than listing a distinct rate, so
//   we apply 0.3% up to 2000cc and 0.4% above. Treat this as the best
//   available reading of the official table, not a guarantee every
//   intermediate band is priced identically — verify at excise.punjab.gov.pk
//   if precision matters for a specific vehicle.
// ---------------------------------------------------------------------
export const LIFETIME_TOKEN_UP_TO_1000CC = 20000; // PKR, one-time, replaces annual token tax entirely

export function annualTokenTaxPercent(cc: number): number | null {
  if (cc <= 1000) return null; // one-time lifetime token instead — see above
  if (cc <= 2000) return 0.003;
  return 0.004;
}

// Flat PKR token-tax figures from the same official page's FY2023-24
// column. Kept ONLY as a documented fallback for when we don't have a
// vehicle value to apply the current %-based rate to — always surfaced to
// the user as a "reference" figure, not the current official amount,
// since the department has since moved to value-based taxation above
// 1000cc.
const FLAT_REFERENCE_TOKEN_TAX_2023_24: { maxCC: number; amount: number }[] = [
  { maxCC: 1300, amount: 1800 },
  { maxCC: 1499, amount: 6000 },
  { maxCC: 1999, amount: 9000 },
  { maxCC: 2500, amount: 12000 },
  { maxCC: Infinity, amount: 15000 },
];

export function flatReferenceTokenTax(cc: number): number {
  const band = FLAT_REFERENCE_TOKEN_TAX_2023_24.find((b) => cc <= b.maxCC);
  return band
    ? band.amount
    : FLAT_REFERENCE_TOKEN_TAX_2023_24[FLAT_REFERENCE_TOKEN_TAX_2023_24.length - 1].amount;
}

// Electric vehicles: 95% exemption on BOTH registration fee and motor
// vehicle (token) tax, per the same official schedule.
export const EV_EXEMPTION_FACTOR = 0.05; // pay only 5% of the otherwise-applicable amount

// Cities this calculator already collects that fall under Punjab's Excise
// & Taxation Department. Karachi/Islamabad/Peshawar are deliberately
// excluded — they're taxed under Sindh/ICT/KP schedules respectively,
// which this module does not model; those fall back to the app's existing
// search-based estimate instead of a fabricated Punjab number.
const PUNJAB_CITIES = new Set(["lahore", "rawalpindi", "faisalabad", "multan"]);

export function isPunjabCity(city: string): boolean {
  return PUNJAB_CITIES.has(city.trim().toLowerCase());
}

/** Parses free-text engine size input ("1.6L", "1600cc", "1300") into cc. Returns null if unparseable. */
export function parseEngineCC(raw?: string): number | null {
  if (!raw) return null;
  const s = raw.toLowerCase().replace(/,/g, "").trim();
  const ccMatch = s.match(/(\d+(?:\.\d+)?)\s*cc/);
  if (ccMatch) return Math.round(parseFloat(ccMatch[1]));
  const lMatch = s.match(/(\d+(?:\.\d+)?)\s*l\b/);
  if (lMatch) return Math.round(parseFloat(lMatch[1]) * 1000);
  const bare = s.match(/(\d+(?:\.\d+)?)/);
  if (!bare) return null;
  const n = parseFloat(bare[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  // Bare number: small values are almost always liters (1.3, 1.6, 2.0);
  // larger ones are already cc (1300, 1600).
  return n <= 10 ? Math.round(n * 1000) : Math.round(n);
}

export interface PunjabGovResult {
  oneTime: { amount: number; note: string };
  annual: { amount: number; status: "calculated" | "reference"; note: string };
}

/**
 * Computes Punjab government vehicle charges from the official schedule
 * above. `vehicleValue` is optional — it's only ever collected when the
 * user fills in the Financing section — so the value-based (%) rates are
 * only applied when we actually have it; otherwise we fall back to the
 * flat reference table and say so explicitly rather than inventing a
 * value-based figure with no value to base it on.
 */
export function computePunjabGovCharges(params: {
  cc: number;
  vehicleValue?: number;
  isElectric: boolean;
}): PunjabGovResult {
  const { cc, vehicleValue, isElectric } = params;
  const exemption = isElectric ? EV_EXEMPTION_FACTOR : 1;

  // ---- One-time: registration fee (value-based %) + lifetime token (<=1000cc) ----
  let oneTimeAmount = 0;
  const oneTimeParts: string[] = [];
  if (vehicleValue && vehicleValue > 0) {
    const regFee = Math.round(vehicleValue * registrationFeePercent(cc) * exemption);
    oneTimeAmount += regFee;
    oneTimeParts.push(`registration fee (${(registrationFeePercent(cc) * 100).toFixed(0)}% of declared value)`);
  }
  if (cc <= 1000) {
    const lifetimeToken = Math.round(LIFETIME_TOKEN_UP_TO_1000CC * exemption);
    oneTimeAmount += lifetimeToken;
    oneTimeParts.push("lifetime token tax (one-time — no annual token tax applies for \u22641000cc vehicles)");
  }

  // ---- Annual recurring token tax (only for >1000cc) ----
  let annualAmount = 0;
  let annualStatus: "calculated" | "reference" = "reference";
  let annualNote: string;
  if (cc <= 1000) {
    annualAmount = 0;
    annualNote =
      "No annual token tax for \u22641000cc vehicles \u2014 a one-time lifetime token is paid at registration instead (included in the one-time total).";
  } else {
    const pct = annualTokenTaxPercent(cc);
    if (vehicleValue && vehicleValue > 0 && pct) {
      annualAmount = Math.round(vehicleValue * pct * exemption);
      annualStatus = "calculated";
      annualNote = `Calculated as ${(pct * 100).toFixed(2)}% of declared vehicle value, per the department's current value-based rate for this engine-capacity band.`;
    } else {
      annualAmount = Math.round(flatReferenceTokenTax(cc) * exemption);
      annualStatus = "reference";
      annualNote =
        "The department now taxes vehicles above 1000cc as a percentage of invoice value; without a vehicle price we can't apply that rate, so this uses the department's last published flat reference figure for this engine-capacity band \u2014 enter a vehicle price under Financing for a value-based estimate.";
    }
  }

  return {
    oneTime: {
      amount: oneTimeAmount,
      note: oneTimeParts.length
        ? `Includes: ${oneTimeParts.join(" + ")}.`
        : "Registration fee is value-based (% of declared vehicle value) \u2014 enter a vehicle price under Financing to calculate it; showing PKR 0 until then.",
    },
    annual: { amount: annualAmount, status: annualStatus, note: annualNote },
  };
}
