import {
  extractAllNumbers,
  flattenSnippets,
  serperSearchBatch,
  SerperSearchResponse,
} from "./serper";
import {
  CarCostRequest,
  CarCostResponse,
  EstimateBlock,
  FuelEstimate,
  SourceRef,
} from "@/types/car";

// ---- Fallback baselines, used only when web search is unavailable or yields nothing usable. ----
// These keep the app functional end-to-end, but every fallback value is clearly labeled
// as an estimate (not a search result) in the response's source list.
const FALLBACKS = {
  fuelPricePkr: 275, // per liter (Petrol/Diesel/Hybrid/CNG use this baseline)
  electricityPricePkr: 55, // per kWh
  fuelEconomyByType: {
    Petrol: 13,
    Diesel: 16,
    Hybrid: 22,
    CNG: 11,
    Electric: 6, // km/kWh
  } as Record<string, number>,
  maintenanceMonthlyPkr: 7500,
  insuranceAnnualPkr: 55000,
  governmentAnnualPkr: 20000,
};

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Keeps only numbers that fall in a sane range for the quantity being estimated, to avoid picking up noise (years, phone numbers, etc). */
function plausibleNumbers(nums: number[], min: number, max: number): number[] {
  return nums.filter((n) => n >= min && n <= max);
}

function buildSources(
  label: string,
  resp: SerperSearchResponse | null,
  usedFallback: boolean
): SourceRef[] {
  if (usedFallback || !resp) {
    return [
      {
        label: `${label} — estimated baseline (live search unavailable)`,
      },
    ];
  }
  const sources: SourceRef[] = [];
  if (resp.answerBox?.title || resp.answerBox?.answer) {
    sources.push({
      label: resp.answerBox.title || "Search answer summary",
      snippet: resp.answerBox.answer || resp.answerBox.snippet,
    });
  }
  for (const o of (resp.organic || []).slice(0, 3)) {
    sources.push({ label: o.title, snippet: o.snippet, link: o.link });
  }
  return sources.length
    ? sources
    : [{ label: `${label} — no strong match found, using baseline estimate` }];
}

export async function calculateCarCost(
  input: CarCostRequest
): Promise<CarCostResponse> {
  const warnings: string[] = [];
  let searchDegraded = false;

  const vehicleLabel = [input.make, input.model, input.variant, input.engineSize]
    .filter(Boolean)
    .join(" ");
  const locationLabel = [input.city, input.country].filter(Boolean).join(", ");

  const isElectric = input.fuelType === "Electric";

  const queries = {
    fuelPrice: isElectric
      ? `current residential electricity price per unit kWh ${input.country}`
      : `current ${input.fuelType} price ${input.country} per liter`,
    fuelEconomy: isElectric
      ? `${vehicleLabel} electric range km per kWh battery efficiency`
      : `${vehicleLabel} average fuel consumption km/l real world`,
    maintenance: `${vehicleLabel} annual maintenance cost ${locationLabel}`,
    insurance: `${vehicleLabel} car insurance annual premium ${input.country}`,
    government: `${input.city} ${input.country} vehicle registration token tax ${vehicleLabel}`,
  };

  let results: Record<string, SerperSearchResponse | null> = {};
  try {
    results = await serperSearchBatch(Object.values(queries), gl(input.country));
  } catch {
    searchDegraded = true;
    warnings.push(
      "We couldn't retrieve current market information. Showing baseline estimates — you can override any value manually."
    );
  }

  const get = (key: keyof typeof queries) => results[queries[key]] ?? null;

  // ---------- Fuel ----------
  let economy = input.manualFuelEconomy || 0;
  const economySources: SourceRef[] = [];
  if (!economy) {
    if (input.fuelEconomyMode === "manual" && input.manualFuelEconomy) {
      economy = input.manualFuelEconomy;
    } else {
      const resp = get("fuelEconomy");
      const text = flattenSnippets(resp);
      const nums = plausibleNumbers(
        extractAllNumbers(text),
        isElectric ? 3 : 6,
        isElectric ? 12 : 30
      );
      const med = median(nums);
      if (med) {
        economy = med;
        economySources.push(...buildSources("Fuel economy", resp, false));
      } else {
        economy = FALLBACKS.fuelEconomyByType[input.fuelType] || 13;
        economySources.push(...buildSources("Fuel economy", resp, true));
      }
    }
  } else {
    economySources.push({ label: "User-provided fuel economy" });
  }

  let pricePerUnit = input.manualFuelPrice || 0;
  const priceSources: SourceRef[] = [];
  const priceLabel = isElectric ? "Electricity price" : "Fuel price";
  if (!pricePerUnit) {
    const resp = get("fuelPrice");
    const text = flattenSnippets(resp);
    // Electricity is priced per kWh (much smaller numbers than petrol/L),
    // so it needs its own plausible range to avoid picking up noise.
    const nums = isElectric
      ? plausibleNumbers(extractAllNumbers(text), 10, 150)
      : plausibleNumbers(extractAllNumbers(text), 50, 600);
    const med = median(nums);
    if (med) {
      pricePerUnit = med;
      priceSources.push(...buildSources(priceLabel, resp, false));
    } else {
      pricePerUnit = isElectric ? FALLBACKS.electricityPricePkr : FALLBACKS.fuelPricePkr;
      priceSources.push(...buildSources(priceLabel, resp, true));
    }
  } else {
    priceSources.push({ label: `User-provided ${priceLabel.toLowerCase()}` });
  }

  const monthlyKm = input.dailyKm * input.drivingDaysPerMonth;
  const monthlyUnits = economy > 0 ? monthlyKm / economy : 0;
  const fuelMonthly = Math.round(monthlyUnits * pricePerUnit);
  const fuelAnnual = fuelMonthly * 12;

  const fuel: FuelEstimate = {
    monthly: fuelMonthly,
    annual: fuelAnnual,
    pricePerUnit: Math.round(pricePerUnit),
    economy: Math.round(economy * 10) / 10,
    unit: isElectric ? "km/kWh" : "km/L",
    label: isElectric ? "Electricity" : "Fuel",
    sources: [...priceSources, ...economySources],
  };

  // ---------- Maintenance ----------
  let maintenanceMonthly = input.manualMaintenanceMonthly || 0;
  let maintenanceSources: SourceRef[] = [];
  let maintenanceRange: { low?: number; high?: number } = {};
  if (!maintenanceMonthly) {
    const resp = get("maintenance");
    const text = flattenSnippets(resp);
    const nums = plausibleNumbers(extractAllNumbers(text), 2000, 400000);
    if (nums.length >= 2) {
      const sorted = [...nums].sort((a, b) => a - b);
      const med = median(nums) || sorted[0];
      // Treat median as an annual figure if it's large, else assume monthly.
      const annualGuess = med > 30000 ? med : med * 12;
      maintenanceMonthly = Math.round(annualGuess / 12);
      maintenanceRange = {
        low: Math.round((sorted[0] > 30000 ? sorted[0] : sorted[0] * 12) / 12),
        high: Math.round(
          (sorted[sorted.length - 1] > 30000
            ? sorted[sorted.length - 1]
            : sorted[sorted.length - 1] * 12) / 12
        ),
      };
      maintenanceSources = buildSources("Maintenance", resp, false);
    } else {
      maintenanceMonthly = FALLBACKS.maintenanceMonthlyPkr;
      maintenanceSources = buildSources("Maintenance", resp, true);
    }
  } else {
    maintenanceSources = [{ label: "User-provided maintenance estimate" }];
  }

  const maintenance: EstimateBlock = {
    monthly: maintenanceMonthly,
    annual: maintenanceMonthly * 12,
    sources: maintenanceSources,
    isEstimateRange: !!maintenanceRange.low,
    rangeLow: maintenanceRange.low,
    rangeHigh: maintenanceRange.high,
    note: "Maintenance costs vary widely by driving conditions and service provider.",
  };

  // ---------- Insurance ----------
  let insuranceAnnual = 0;
  let insuranceSources: SourceRef[] = [];
  if (!input.hasInsurance) {
    insuranceSources = [{ label: "User indicated no insurance is carried." }];
  } else if (input.manualInsuranceAnnual) {
    insuranceAnnual = input.manualInsuranceAnnual;
    insuranceSources = [{ label: "User-provided insurance cost" }];
  } else {
    const resp = get("insurance");
    const text = flattenSnippets(resp);
    const nums = plausibleNumbers(extractAllNumbers(text), 10000, 500000);
    const med = median(nums);
    if (med) {
      insuranceAnnual = Math.round(med);
      insuranceSources = buildSources("Insurance", resp, false);
    } else {
      insuranceAnnual = FALLBACKS.insuranceAnnualPkr;
      insuranceSources = buildSources("Insurance", resp, true);
    }
  }

  const insurance: EstimateBlock = {
    monthly: Math.round(insuranceAnnual / 12),
    annual: insuranceAnnual,
    sources: insuranceSources,
    note: "Insurance premiums depend heavily on provider, coverage type, and vehicle value.",
  };

  // ---------- Government / Registration ----------
  let governmentAnnual = 0;
  let governmentSources: SourceRef[] = [];
  let govIsRange = false;
  let govLow: number | undefined;
  let govHigh: number | undefined;
  {
    const resp = get("government");
    const text = flattenSnippets(resp);
    const nums = plausibleNumbers(extractAllNumbers(text), 1000, 300000);
    if (nums.length) {
      const sorted = [...nums].sort((a, b) => a - b);
      governmentAnnual = Math.round(median(nums) || sorted[0]);
      if (sorted.length > 1) {
        govIsRange = true;
        govLow = Math.round(sorted[0]);
        govHigh = Math.round(sorted[sorted.length - 1]);
      }
      governmentSources = buildSources("Registration / government charges", resp, false);
    } else {
      governmentAnnual = FALLBACKS.governmentAnnualPkr;
      governmentSources = buildSources("Registration / government charges", resp, true);
    }
  }

  const government: EstimateBlock = {
    monthly: Math.round(governmentAnnual / 12),
    annual: governmentAnnual,
    sources: governmentSources,
    isEstimateRange: govIsRange,
    rangeLow: govLow,
    rangeHigh: govHigh,
    note: "Registration and token tax figures are not always official; verify with your local excise & taxation office.",
  };

  // ---------- Financing ----------
  let financingMonthly = 0;
  let financingAnnual = 0;
  let financingTotal = 0;
  if (input.financing.isFinancing && input.financing.vehiclePrice) {
    const price = input.financing.vehiclePrice;
    const down = input.financing.downPayment || 0;
    const principal = Math.max(price - down, 0);
    const annualRate = (input.financing.interestRate || 0) / 100;
    const years = input.financing.loanDurationYears || 5;
    const n = years * 12;
    const monthlyRate = annualRate / 12;

    if (monthlyRate > 0 && n > 0) {
      const factor = Math.pow(1 + monthlyRate, n);
      financingMonthly = Math.round((principal * monthlyRate * factor) / (factor - 1));
    } else if (n > 0) {
      financingMonthly = Math.round(principal / n);
    }
    financingAnnual = financingMonthly * 12;
    financingTotal = financingMonthly * n;
  }

  const financing = {
    monthly: financingMonthly,
    annual: financingAnnual,
    total: financingTotal,
    monthlyInstallment: financingMonthly,
  };

  // ---------- Totals ----------
  const totalMonthly =
    fuel.monthly + maintenance.monthly + insurance.monthly + government.monthly + financing.monthly;
  const totalAnnual = totalMonthly * 12;
  const annualKm = input.dailyKm * input.drivingDaysPerMonth * 12;
  const costPerKm = annualKm > 0 ? Math.round((totalAnnual / annualKm) * 100) / 100 : 0;

  return {
    vehicle: {
      make: input.make,
      model: input.model,
      variant: input.variant,
      fuelType: input.fuelType,
      city: input.city,
      country: input.country,
    },
    fuel,
    maintenance,
    insurance,
    government,
    financing,
    total: {
      monthly: totalMonthly,
      annual: totalAnnual,
      threeYear: totalAnnual * 3,
      fiveYear: totalAnnual * 5,
      costPerKm,
    },
    meta: {
      searchDegraded,
      warnings,
    },
  };
}

function gl(country: string): string {
  const c = country.trim().toLowerCase();
  if (c.includes("pakistan")) return "pk";
  if (c.includes("india")) return "in";
  if (c.includes("united states") || c === "usa" || c === "us") return "us";
  if (c.includes("united kingdom") || c === "uk") return "gb";
  if (c.includes("uae") || c.includes("emirates")) return "ae";
  return "pk";
}
