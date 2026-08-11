export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric" | "CNG";

export interface FinancingInput {
  isFinancing: boolean;
  vehiclePrice?: number;
  downPayment?: number;
  interestRate?: number; // annual %
  loanDurationYears?: number;
}

export interface CarCostRequest {
  make: string;
  model: string;
  variant?: string;
  modelYear?: string;
  engineSize?: string;
  fuelType: FuelType;
  country: string;
  city: string;

  dailyKm: number;
  drivingDaysPerMonth: number;
  fuelEconomyMode: "auto" | "manual";
  manualFuelEconomy?: number; // km/L or km/kWh
  // Explicit mode switch for fuel/electricity price (replaces the old
  // "fill this in only if you want to override" implicit behavior).
  // "manual"    -> activePetrolPrice MUST equal manualFuelPrice, always.
  // "estimated" -> activePetrolPrice comes from the live search pipeline.
  // Defaults to "estimated" when omitted, for backward compatibility.
  fuelPriceMode?: "manual" | "estimated";
  manualFuelPrice?: number;

  hasInsurance: boolean;
  manualInsuranceAnnual?: number;
  manualMaintenanceMonthly?: number;

  financing: FinancingInput;
}

export interface SourceRef {
  label: string;
  snippet?: string;
  link?: string;
}

/**
 * Where a value came from, so the UI can be honest about confidence:
 *  - "user"        the person typed this in themselves
 *  - "official"     calculated directly from a cited official government rate schedule
 *  - "reference"    a documented official figure used as a fallback (e.g. an older
 *                    published flat rate) because a newer value-based rate needs
 *                    an input (like vehicle price) we don't have — never presented
 *                    as the current exact figure
 *  - "search"      derived from live SerperDev search results
 *  - "baseline"    live search failed/unavailable — a labeled fallback estimate
 *  - "unavailable" we couldn't determine a reliable value and refused to guess
 *  - "not-applicable" the user opted out (e.g. "I don't have insurance")
 */
export type EstimateStatus =
  | "user"
  | "official"
  | "reference"
  | "search"
  | "baseline"
  | "unavailable"
  | "not-applicable";

export interface EstimateBlock {
  monthly: number;
  annual: number;
  status: EstimateStatus;
  sources: SourceRef[];
  note?: string;
  isEstimateRange?: boolean;
  rangeLow?: number;
  rangeHigh?: number;
}

export interface FuelEstimate extends EstimateBlock {
  pricePerUnit: number;
  economy: number;
  unit: string; // "km/L" or "km/kWh"
  label: string; // "Fuel" or "Electricity" — use this instead of hardcoding "Fuel" in the UI
  chargingLossPercent?: number; // Electric only — assumed charging loss applied on top of consumption
  priceMode: "manual" | "estimated";
  // ISO timestamp of when the estimated price was fetched. Only set when
  // priceMode is "estimated" — this is "as of" the calculation, not a
  // claim that the price updates live in the browser.
  priceAsOf?: string;
}

export interface GovernmentBlock extends EstimateBlock {
  // `monthly`/`annual` above represent ONLY the recurring annual road/token
  // tax (never a one-time fee smeared across months).
  oneTimeRegistration: number;
  oneTimeStatus: EstimateStatus;
  oneTimeSources: SourceRef[];
}

export interface CarCostResponse {
  vehicle: {
    make: string;
    model: string;
    variant?: string;
    fuelType: FuelType;
    city: string;
    country: string;
  };
  fuel: FuelEstimate;
  maintenance: EstimateBlock;
  insurance: EstimateBlock;
  government: GovernmentBlock;
  financing: {
    monthly: number;
    annual: number;
    total: number;
    monthlyInstallment: number;
  };
  total: {
    monthly: number;
    annual: number;
    threeYear: number;
    fiveYear: number;
    costPerKm: number;
  };
  meta: {
    searchDegraded: boolean;
    warnings: string[];
  };
}

export interface CompareCarInput {
  make: string;
  model: string;
  variant?: string;
  fuelType: FuelType;
}

export interface CompareRequest {
  cars: CompareCarInput[];
  country: string;
  city: string;
  dailyKm: number;
  drivingDaysPerMonth: number;
}

export interface CompareResult {
  vehicle: CompareCarInput;
  result: CarCostResponse;
}
