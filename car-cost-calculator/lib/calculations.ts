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
import { currencyForCountry } from "@/lib/currency";
import {
  computePunjabGovCharges,
  isPunjabCity,
  parseEngineCC,
  PUNJAB_GOV_SOURCE,
} from "@/lib/govCharges";

// ---- Fallback baselines, used ONLY when live search is fully unavailable ----
// (network/API failure). When search runs fine but simply returns nothing
// usable for a given value, we do NOT silently substitute one of these —
// insurance and government costs are marked "unavailable" instead. See the
// status field on each EstimateBlock.
//
// Values are currency-specific: PKR/INR/USD each have wildly different
// magnitudes (e.g. fuel is ~275 PKR/L, ~100 INR/L, ~1 USD/L), so one set of
// numbers can't sensibly serve all three. The plausible-number ranges used
// to validate search results are currency-specific for the same reason —
// without this, a real US insurance quote like "$1,200/year" would fall
// outside a PKR-tuned range (10,000–500,000) and get rejected every time.
type CurrencyProfile = {
  fuelPricePerUnit: number;
  electricityPricePerUnit: number;
  maintenanceMonthly: number;
  insuranceAnnual: number;
  governmentAnnual: number;
  governmentOneTime: number;
  ranges: {
    fuelPrice: [number, number];
    electricityPrice: [number, number];
    maintenance: [number, number];
    insurance: [number, number];
    governmentOneTime: [number, number];
    governmentAnnual: [number, number];
  };
};

const CURRENCY_PROFILES: Record<string, CurrencyProfile> = {
  PKR: {
    fuelPricePerUnit: 275,
    electricityPricePerUnit: 55,
    maintenanceMonthly: 7500,
    insuranceAnnual: 55000,
    governmentAnnual: 20000,
    governmentOneTime: 35000,
    ranges: {
      fuelPrice: [50, 600],
      electricityPrice: [10, 150],
      maintenance: [2000, 400000],
      insurance: [10000, 500000],
      governmentOneTime: [2000, 500000],
      governmentAnnual: [500, 150000],
    },
  },
  "₹": {
    fuelPricePerUnit: 100,
    electricityPricePerUnit: 8,
    maintenanceMonthly: 3000,
    insuranceAnnual: 15000,
    governmentAnnual: 5000,
    governmentOneTime: 10000,
    ranges: {
      fuelPrice: [40, 250],
      electricityPrice: [3, 30],
      maintenance: [800, 150000],
      insurance: [3000, 200000],
      governmentOneTime: [1000, 200000],
      governmentAnnual: [200, 60000],
    },
  },
  $: {
    fuelPricePerUnit: 1.05, // per liter
    electricityPricePerUnit: 0.16,
    maintenanceMonthly: 100,
    insuranceAnnual: 1300,
    governmentAnnual: 150,
    governmentOneTime: 300,
    ranges: {
      fuelPrice: [0.3, 5],
      electricityPrice: [0.05, 1],
      maintenance: [15, 3000],
      insurance: [200, 6000],
      governmentOneTime: [20, 4000],
      governmentAnnual: [10, 2000],
    },
  },
};

function profileFor(country: string): CurrencyProfile {
  return CURRENCY_PROFILES[currencyForCountry(country)] || CURRENCY_PROFILES["$"];
}

// Rule-of-thumb PKR/km maintenance rate for private cars (routine
// servicing, oil/filter changes, tyres, brakes, battery amortized per km
// driven). This is a deliberately labeled estimate — no single official
// source publishes a per-km maintenance figure — used as the PRIMARY
// maintenance model so the result scales with the user's actual mileage
// instead of guessing whether a scraped search number was monthly or
// annual (that guess previously caused up to a 12x misclassification,
// e.g. reading an annual figure as if it were monthly).
const MAINTENANCE_RATE_PER_KM: Record<string, number> = {
  PKR: 4.5,
  "₹": 1.8,
  $: 0.05,
};

// Pakistani vehicle registration fees and annual token tax are set
// provincially (Excise & Taxation departments), not federally, so the same
// car can legitimately have a different government charge in Lahore vs
// Karachi vs Islamabad. The calculator only collects "city" from the user
// (no separate province question, per product decision to avoid adding
// fields) — this maps the existing city selector to its province so the
// search query can target the right jurisdiction without asking anything
// new.
const PAKISTAN_CITY_PROVINCE: Record<string, string> = {
  lahore: "Punjab",
  rawalpindi: "Punjab",
  faisalabad: "Punjab",
  multan: "Punjab",
  karachi: "Sindh",
  islamabad: "Islamabad Capital Territory (ICT)",
  peshawar: "Khyber Pakhtunkhwa",
};

function pakistanProvinceForCity(city: string): string | null {
  return PAKISTAN_CITY_PROVINCE[city.trim().toLowerCase()] || null;
}

// Fuel economy (km/L or km/kWh) doesn't depend on currency/country — kept separate.
const FUEL_ECONOMY_BY_TYPE: Record<string, number> = {
  Petrol: 13,
  Diesel: 16,
  Hybrid: 22,
  CNG: 11,
  Electric: 6, // km/kWh
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
  const profile = profileFor(input.country);

  // Single source of truth for distance: every calculation that needs a
  // monthly or annual km figure (fuel, maintenance, cost-per-km) reads
  // from these two values — never a second, independently-derived figure.
  const monthlyKm = input.dailyKm * input.drivingDaysPerMonth;
  const annualKm = monthlyKm * 12;

  const isPakistan = input.country.trim().toLowerCase().includes("pakistan");
  const engineCC = parseEngineCC(input.engineSize);
  const usePunjabSchedule = isPakistan && isPunjabCity(input.city) && engineCC !== null;

  // Registration fee and token tax are usually a function of engine capacity
  // and/or declared vehicle value, not a flat number — feed in whatever the
  // user already supplied (engineSize is always collected; vehiclePrice
  // only exists when they filled in the Financing section) rather than
  // inventing one. Province narrows the search to the right provincial
  // Excise & Taxation schedule instead of a generic national figure. This
  // search path is only actually used as the government figure when the
  // official Punjab calculator above doesn't apply (city outside Punjab,
  // country isn't Pakistan, or engine size couldn't be parsed).
  const province = pakistanProvinceForCity(input.city);
  const govLocationLabel = province ? `${input.city}, ${province}, Pakistan` : locationLabel;
  const vehicleValueLabel = input.financing?.vehiclePrice
    ? ` for a vehicle valued around ${Math.round(input.financing.vehiclePrice).toLocaleString()}`
    : "";

  const queries = {
    fuelPrice: isElectric
      ? `current residential electricity price per unit kWh ${input.country}`
      : `current ${input.fuelType} price ${input.country} per liter`,
    fuelEconomy: isElectric
      ? `${vehicleLabel} electric range km per kWh battery efficiency`
      : `${vehicleLabel} average fuel consumption km/l real world`,
    maintenance: `${vehicleLabel} annual maintenance cost ${locationLabel}`,
    insurance: `${vehicleLabel} car insurance annual premium ${input.country}`,
    governmentOneTime: `${vehicleLabel} one-time vehicle registration fee ${govLocationLabel}${vehicleValueLabel}`,
    governmentAnnual: `${govLocationLabel} annual road tax token tax ${vehicleLabel}${vehicleValueLabel}`,
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
      economy = FUEL_ECONOMY_BY_TYPE[input.fuelType] || 13;
      economyStatus = searchDegraded ? "baseline" : "unavailable";
      economySources.push(...buildSources("Fuel economy", resp, "baseline"));
    }
  }

  // Single source of truth for the active petrol/electricity price:
  //   fuelPriceMode === "manual"    -> ALWAYS input.manualFuelPrice, no exceptions
  //   fuelPriceMode === "estimated" -> live search result (baseline only if search is down)
  // This one `pricePerUnit` value feeds fuelMonthly/fuelAnnual below, which
  // in turn feed total.monthly/annual/threeYear/fiveYear/costPerKm — so
  // every downstream number derives from this single value, never a
  // second copy of the logic.
  const priceMode: "manual" | "estimated" = input.fuelPriceMode === "manual" ? "manual" : "estimated";
  let pricePerUnit = 0;
  const priceSources: SourceRef[] = [];
  const priceLabel = isElectric ? "Electricity price" : "Fuel price";
  let priceStatus: EstimateStatus;
  let priceAsOf: string | undefined;
  if (priceMode === "manual") {
    // Validation layer guarantees manualFuelPrice is a positive number
    // whenever mode is "manual" — if it's somehow missing here, fail safe
    // to 0 rather than silently switching to Estimated.
    pricePerUnit = input.manualFuelPrice || 0;
    priceStatus = "user";
    priceSources.push({ label: `User-provided ${priceLabel.toLowerCase()}` });
  } else {
    const resp = get("fuelPrice");
    const text = flattenSnippets(resp);
    // Electricity is priced per kWh (much smaller numbers than petrol/L),
    // so it needs its own plausible range to avoid picking up noise.
    const nums = isElectric
      ? plausibleNumbers(extractAllNumbers(text), ...profile.ranges.electricityPrice)
      : plausibleNumbers(extractAllNumbers(text), ...profile.ranges.fuelPrice);
    const med = median(nums);
    if (med) {
      pricePerUnit = med;
      priceStatus = "search";
      priceAsOf = new Date().toISOString();
      priceSources.push(...buildSources(priceLabel, resp, "search"));
    } else {
      pricePerUnit = isElectric ? profile.electricityPricePerUnit : profile.fuelPricePerUnit;
      priceStatus = searchDegraded ? "baseline" : "unavailable";
      if (priceStatus === "baseline") priceAsOf = new Date().toISOString();
      priceSources.push(...buildSources(priceLabel, resp, "baseline"));
    }
  }

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
    official: 0,
    search: 1,
    reference: 2,
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
    priceMode,
    priceAsOf,
    sources: [...priceSources, ...economySources],
    note: isElectric
      ? `Assumes ${EV_CHARGING_LOSS_PERCENT}% charging loss on top of vehicle consumption.`
      : undefined,
  };

  // ---------- Maintenance ----------
  // Primary model is mileage-based (PKR/km rule-of-thumb × monthly km) so
  // the estimate scales with the user's actual driving instead of trying
  // to guess whether a single scraped search number was already "monthly"
  // or "annual" — that guess previously misfired by up to 12x (e.g. an
  // annual figure of ~17,000 read as if it were a monthly figure). Search
  // results are now only accepted when they land within a sane band of the
  // mileage model, and the result is always labeled an estimate, never a
  // verified/current figure.
  let maintenanceMonthly = input.manualMaintenanceMonthly || 0;
  let maintenanceSources: SourceRef[] = [];
  let maintenanceStatus: EstimateStatus;
  let maintenanceRange: { low?: number; high?: number } = {};
  if (input.manualMaintenanceMonthly) {
    maintenanceStatus = "user";
    maintenanceSources = [{ label: "User-provided maintenance estimate" }];
  } else {
    const currency = currencyForCountry(input.country);
    const perKmRate = MAINTENANCE_RATE_PER_KM[currency] ?? MAINTENANCE_RATE_PER_KM["$"];
    const modelMonthly = Math.round(perKmRate * monthlyKm) || profile.maintenanceMonthly;

    const resp = get("maintenance");
    const text = flattenSnippets(resp);
    const nums = plausibleNumbers(extractAllNumbers(text), ...profile.ranges.maintenance);
    // Only let a scraped number influence the estimate if it plausibly IS a
    // monthly figure for this car's mileage (within 0.4x-2.5x of the
    // model) — this bound is what prevents a stray annual figure from
    // being silently treated as monthly.
    const inBandNums = nums.filter((n) => n >= modelMonthly * 0.4 && n <= modelMonthly * 2.5);

    if (inBandNums.length >= 2) {
      const sorted = [...inBandNums].sort((a, b) => a - b);
      maintenanceMonthly = Math.round(median(inBandNums) || sorted[0]);
      maintenanceRange = { low: Math.round(sorted[0]), high: Math.round(sorted[sorted.length - 1]) };
      maintenanceStatus = "search";
      maintenanceSources = buildSources("Maintenance", resp, "search");
    } else {
      maintenanceMonthly = modelMonthly;
      maintenanceStatus = "baseline";
      maintenanceSources = [
        {
          label: `Mileage-based estimate: ${currency} ${perKmRate}/km rule-of-thumb (routine servicing, oil/filter, tyres, brakes, battery) × ${monthlyKm.toLocaleString()} km/month — not an official or vehicle-specific figure`,
        },
      ];
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
    const nums = plausibleNumbers(extractAllNumbers(text), ...profile.ranges.insurance);
    const med = median(nums);
    if (med) {
      insuranceAnnual = Math.round(med);
      insuranceStatus = "search";
      insuranceSources = buildSources("Insurance", resp, "search");
    } else if (searchDegraded) {
      insuranceAnnual = profile.insuranceAnnual;
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
  // Split into a ONE-TIME registration fee (+ the lifetime token for
  // <=1000cc vehicles) and a RECURRING annual road/token tax. Only the
  // recurring figure is ever converted into a monthly equivalent and
  // folded into ongoing ownership totals — a one-time fee is NEVER
  // multiplied or divided by 12.
  //
  // Two data paths, never mixed for the same calculation:
  //  1. usePunjabSchedule=true  -> figures come from the cited official
  //     Punjab Excise & Taxation Department rate schedule (lib/govCharges.ts),
  //     status "official" (calculated from a value the user gave us) or
  //     "reference" (a documented fallback figure, clearly labeled as such).
  //  2. usePunjabSchedule=false -> falls back to the existing live-search
  //     pipeline (other provinces / countries, or an unparseable engine
  //     size), status "search" / "baseline" / "unavailable" as before.
  let oneTimeRegistration = 0;
  let oneTimeStatus: EstimateStatus;
  let oneTimeSources: SourceRef[];
  let governmentAnnual = 0;
  let governmentSources: SourceRef[] = [];
  let governmentStatus: EstimateStatus;
  let govIsRange = false;
  let govLow: number | undefined;
  let govHigh: number | undefined;
  let governmentNote =
    "Recurring annual road/token tax only — one-time registration is shown separately and is never spread into your monthly cost.";

  if (usePunjabSchedule && engineCC !== null) {
    const punjab = computePunjabGovCharges({
      cc: engineCC,
      vehicleValue: input.financing?.vehiclePrice,
      isElectric,
    });

    oneTimeRegistration = punjab.oneTime.amount;
    oneTimeStatus = "official";
    oneTimeSources = [
      {
        label: PUNJAB_GOV_SOURCE.label,
        link: PUNJAB_GOV_SOURCE.link,
        snippet: `${punjab.oneTime.note} (rates retrieved ${PUNJAB_GOV_SOURCE.retrievedAt} — the department may revise via notification; confirm before paying.)`,
      },
    ];

    governmentAnnual = punjab.annual.amount;
    governmentStatus = punjab.annual.status === "calculated" ? "official" : "reference";
    governmentSources = [
      {
        label: PUNJAB_GOV_SOURCE.label,
        link: PUNJAB_GOV_SOURCE.link,
        snippet: `${punjab.annual.note} (rates retrieved ${PUNJAB_GOV_SOURCE.retrievedAt} — the department may revise via notification; confirm before paying.)`,
      },
    ];
    governmentNote = `${punjab.annual.note} One-time charges (registration fee, and the lifetime token for \u22641000cc vehicles) are shown separately below and never spread into your monthly cost.`;
  } else {
    {
      const resp = get("governmentOneTime");
      const text = flattenSnippets(resp);
      const nums = plausibleNumbers(extractAllNumbers(text), ...profile.ranges.governmentOneTime);
      const med = median(nums);
      if (med) {
        oneTimeRegistration = Math.round(med);
        oneTimeStatus = "search";
        oneTimeSources = buildSources("One-time registration", resp, "search");
      } else if (searchDegraded) {
        oneTimeRegistration = profile.governmentOneTime;
        oneTimeStatus = "baseline";
        oneTimeSources = buildSources("One-time registration", resp, "baseline");
      } else {
        oneTimeRegistration = 0;
        oneTimeStatus = "unavailable";
        oneTimeSources = buildSources("One-time registration", resp, "unavailable");
      }
    }

    {
      const resp = get("governmentAnnual");
      const text = flattenSnippets(resp);
      const nums = plausibleNumbers(extractAllNumbers(text), ...profile.ranges.governmentAnnual);
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
        governmentAnnual = profile.governmentAnnual;
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
  }

  const government: GovernmentBlock = {
    monthly: Math.round(governmentAnnual / 12),
    annual: governmentAnnual,
    status: governmentStatus,
    sources: governmentSources,
    isEstimateRange: govIsRange,
    rangeLow: govLow,
    rangeHigh: govHigh,
    note: governmentNote,
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
  // Every other country now displays in USD (see lib/currency.ts), so default
  // the search region to the US rather than Pakistan — this used to silently
  // bias every unrecognized country's search results toward Pakistan.
  return "us";
}
