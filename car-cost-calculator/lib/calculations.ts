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
  EstimateStatus,
  FuelEstimate,
  GovernmentBlock,
  SourceRef,
} from "@/types/car";

// ---- Fallback baselines, used ONLY when live search is fully unavailable ----
// (network/API failure). When search runs fine but simply returns nothing
// usable for a given value, we do NOT silently substitute one of these —
// insurance and government costs are marked "unavailable" instead. See the
// status field on each EstimateBlock.
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
  governmentOneTimePkr: 35000,
};

// Assumed energy lost in an EV's charging cycle (AC/DC conversion, battery
// heat, standby draw) — applied on top of raw consumption when no
// vehicle-specific figure is available. Shown explicitly in the UI as an
// assumption, never presented as a measured number.
const EV_CHARGING_LOSS_PERCENT = 10;

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
  status: EstimateStatus
): SourceRef[] {
  if (status === "baseline" || !resp) {
    return [
      {
        label: `${label} — estimated baseline (live search unavailable)`,
      },
    ];
  }
  if (status === "unavailable") {
    return [
      {
        label: `${label} — searched, but no reliable figure was found in the results`,
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
    governmentOneTime: `${vehicleLabel} one-time vehicle registration fee ${locationLabel}`,
    governmentAnnual: `${locationLabel} annual road tax token tax ${vehicleLabel}`,
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

  // ---------- Fuel / Electricity ----------
  let economy = 0;
  const economySources: SourceRef[] = [];
  let economyStatus: EstimateStatus;
  if (input.fuelEconomyMode === "manual" && input.manualFuelEconomy) {
    economy = input.manualFuelEconomy;
    economyStatus = "user";
    economySources.push({ label: "User-provided fuel economy" });
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
      economyStatus = "search";
      economySources.push(...buildSources("Fuel economy", resp, "search"));
    } else {
      economy = FALLBACKS.fuelEconomyByType[input.fuelType] || 13;
      economyStatus = searchDegraded ? "baseline" : "unavailable";
      economySources.push(...buildSources("Fuel economy", resp, "baseline"));
    }
  }

  let pricePerUnit = input.manualFuelPrice || 0;
  const priceSources: SourceRef[] = [];
  const priceLabel = isElectric ? "Electricity price" : "Fuel price";
  let priceStatus: EstimateStatus;
  if (input.manualFuelPrice) {
    priceStatus = "user";
    priceSources.push({ label: `User-provided ${priceLabel.toLowerCase()}` });
  } else {
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
      priceStatus = "search";
      priceSources.push(...buildSources(priceLabel, resp, "search"));
    } else {
      pricePerUnit = isElectric ? FALLBACKS.electricityPricePkr : FALLBACKS.fuelPricePkr;
      priceStatus = searchDegraded ? "baseline" : "unavailable";
      priceSources.push(...buildSources(priceLabel, resp, "baseline"));
    }
  }

  const monthlyKm = input.dailyKm * input.drivingDaysPerMonth;
  // EVs lose some energy in the charging cycle itself — account for that on
  // top of raw consumption so the electricity cost isn't understated.
  const chargingLossFactor = isElectric ? 1 + EV_CHARGING_LOSS_PERCENT / 100 : 1;
  const monthlyUnits = economy > 0 ? (monthlyKm / economy) * chargingLossFactor : 0;
  const fuelMonthly = Math.round(monthlyUnits * pricePerUnit);
  const fuelAnnual = fuelMonthly * 12;

  // Combine the two sub-statuses (price + economy) into one overall status
  // for the block, preferring the "weaker" of the two so we never overstate
  // confidence.
  const statusRank: Record<EstimateStatus, number> = {
    user: 0,
    search: 1,
    baseline: 2,
    unavailable: 3,
    "not-applicable": 0,
  };
  const fuelStatus =
    statusRank[priceStatus] >= statusRank[economyStatus] ? priceStatus : economyStatus;

  const fuel: FuelEstimate = {
    monthly: fuelMonthly,
    annual: fuelAnnual,
    status: fuelStatus,
    pricePerUnit: Math.round(pricePerUnit),
    economy: Math.round(economy * 10) / 10,
    unit: isElectric ? "km/kWh" : "km/L",
    label: isElectric ? "Electricity" : "Fuel",
    chargingLossPercent: isElectric ? EV_CHARGING_LOSS_PERCENT : undefined,
    sources: [...priceSources, ...economySources],
    note: isElectric
      ? `Assumes ${EV_CHARGING_LOSS_PERCENT}% charging loss on top of vehicle consumption.`
      : undefined,
  };

  // ---------- Maintenance ----------
  let maintenanceMonthly = input.manualMaintenanceMonthly || 0;
  let maintenanceSources: SourceRef[] = [];
  let maintenanceStatus: EstimateStatus;
  let maintenanceRange: { low?: number; high?: number } = {};
  if (input.manualMaintenanceMonthly) {
    maintenanceStatus = "user";
    maintenanceSources = [{ label: "User-provided maintenance estimate" }];
  } else {
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
      maintenanceStatus = "search";
      maintenanceSources = buildSources("Maintenance", resp, "search");
    } else {
      maintenanceMonthly = FALLBACKS.maintenanceMonthlyPkr;
      maintenanceStatus = "baseline";
      maintenanceSources = buildSources("Maintenance", resp, "baseline");
    }
  }

  const maintenance: EstimateBlock = {
    monthly: maintenanceMonthly,
    annual: maintenanceMonthly * 12,
    status: maintenanceStatus,
    sources: maintenanceSources,
    isEstimateRange: !!maintenanceRange.low,
    rangeLow: maintenanceRange.low,
    rangeHigh: maintenanceRange.high,
    note: "Maintenance costs vary widely by driving conditions and service provider — treat this as an estimate, not a guaranteed cost.",
  };

  // ---------- Insurance ----------
  // Rules (per product spec):
  //   no insurance selected      -> 0, status "not-applicable"
  //   user typed an amount       -> use it, status "user"
  //   "I have insurance" + no
  //     amount + search finds
  //     a number                 -> use it, status "search"
  //   "I have insurance" + no
  //     amount + nothing found   -> DO NOT default to 0 or a fallback.
  //                                 status "unavailable", excluded from
  //                                 totals, surfaced as a warning.
  let insuranceAnnual = 0;
  let insuranceSources: SourceRef[] = [];
  let insuranceStatus: EstimateStatus;
  if (!input.hasInsurance) {
    insuranceStatus = "not-applicable";
    insuranceSources = [{ label: "User indicated no insurance is carried." }];
  } else if (input.manualInsuranceAnnual) {
    insuranceAnnual = input.manualInsuranceAnnual;
    insuranceStatus = "user";
    insuranceSources = [{ label: "User-provided insurance cost" }];
  } else {
    const resp = get("insurance");
    const text = flattenSnippets(resp);
    const nums = plausibleNumbers(extractAllNumbers(text), 10000, 500000);
    const med = median(nums);
    if (med) {
      insuranceAnnual = Math.round(med);
      insuranceStatus = "search";
      insuranceSources = buildSources("Insurance", resp, "search");
    } else if (searchDegraded) {
      insuranceAnnual = FALLBACKS.insuranceAnnualPkr;
      insuranceStatus = "baseline";
      insuranceSources = buildSources("Insurance", resp, "baseline");
    } else {
      insuranceAnnual = 0;
      insuranceStatus = "unavailable";
      insuranceSources = buildSources("Insurance", resp, "unavailable");
      warnings.push(
        "Insurance estimate unavailable — we couldn't find a reliable premium for this vehicle. It's excluded from your total; enter your own annual insurance cost for an accurate figure."
      );
    }
  }

  const insurance: EstimateBlock = {
    monthly: Math.round(insuranceAnnual / 12),
    annual: insuranceAnnual,
    status: insuranceStatus,
    sources: insuranceSources,
    note:
      insuranceStatus === "unavailable"
        ? "Insurance estimate unavailable — not included in your total below."
        : "Insurance premiums depend heavily on provider, coverage type, and vehicle value.",
  };

  // ---------- Government / Registration ----------
  // Split into a ONE-TIME registration fee and a RECURRING annual road/token
  // tax. Only the recurring figure is ever converted into a monthly
  // equivalent and folded into ongoing ownership totals.
  let oneTimeRegistration = 0;
  let oneTimeStatus: EstimateStatus;
  let oneTimeSources: SourceRef[];
  {
    const resp = get("governmentOneTime");
    const text = flattenSnippets(resp);
    const nums = plausibleNumbers(extractAllNumbers(text), 2000, 500000);
    const med = median(nums);
    if (med) {
      oneTimeRegistration = Math.round(med);
      oneTimeStatus = "search";
      oneTimeSources = buildSources("One-time registration", resp, "search");
    } else if (searchDegraded) {
      oneTimeRegistration = FALLBACKS.governmentOneTimePkr;
      oneTimeStatus = "baseline";
      oneTimeSources = buildSources("One-time registration", resp, "baseline");
    } else {
      oneTimeRegistration = 0;
      oneTimeStatus = "unavailable";
      oneTimeSources = buildSources("One-time registration", resp, "unavailable");
    }
  }

  let governmentAnnual = 0;
  let governmentSources: SourceRef[] = [];
  let governmentStatus: EstimateStatus;
  let govIsRange = false;
  let govLow: number | undefined;
  let govHigh: number | undefined;
  {
    const resp = get("governmentAnnual");
    const text = flattenSnippets(resp);
    const nums = plausibleNumbers(extractAllNumbers(text), 500, 150000);
    if (nums.length) {
      const sorted = [...nums].sort((a, b) => a - b);
      governmentAnnual = Math.round(median(nums) || sorted[0]);
      if (sorted.length > 1) {
        govIsRange = true;
        govLow = Math.round(sorted[0]);
        govHigh = Math.round(sorted[sorted.length - 1]);
      }
      governmentStatus = "search";
      governmentSources = buildSources("Annual road/token tax", resp, "search");
    } else if (searchDegraded) {
      governmentAnnual = FALLBACKS.governmentAnnualPkr;
      governmentStatus = "baseline";
      governmentSources = buildSources("Annual road/token tax", resp, "baseline");
    } else {
      governmentAnnual = 0;
      governmentStatus = "unavailable";
      governmentSources = buildSources("Annual road/token tax", resp, "unavailable");
      warnings.push(
        "Annual government/road tax could not be verified for this vehicle and location. It's excluded from your total — check with your local excise & taxation office."
      );
    }
  }

  const government: GovernmentBlock = {
    monthly: Math.round(governmentAnnual / 12),
    annual: governmentAnnual,
    status: governmentStatus,
    sources: governmentSources,
    isEstimateRange: govIsRange,
    rangeLow: govLow,
    rangeHigh: govHigh,
    note: "Recurring annual road/token tax only — one-time registration is shown separately and is never spread into your monthly cost.",
    oneTimeRegistration,
    oneTimeStatus,
    oneTimeSources,
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
  // Only RECURRING costs feed into ownership totals. The one-time
  // registration fee is deliberately excluded here and surfaced separately
  // in the response so it's never double-counted or smeared into "monthly".
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
