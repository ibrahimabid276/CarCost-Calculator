import { CarCostRequest } from "@/types/car";

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: CarCostRequest;
}

function cleanString(v: unknown, maxLen = 80): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen).replace(/[<>{}$`]/g, "");
}

function toPositiveNumber(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export function validateCarCostRequest(body: unknown): ValidationResult {
  const errors: string[] = [];
  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }
  const b = body as Record<string, unknown>;

  const make = cleanString(b.make);
  const model = cleanString(b.model);
  const country = cleanString(b.country) || "Pakistan";
  const city = cleanString(b.city) || "Lahore";
  const fuelType = cleanString(b.fuelType) as CarCostRequest["fuelType"];

  if (!make) errors.push("Car make is required.");
  if (!model) errors.push("Car model is required.");
  if (!FUEL_TYPES.includes(fuelType)) errors.push("A valid fuel type is required.");

  const dailyKm = toPositiveNumber(b.dailyKm);
  const drivingDaysPerMonth = toPositiveNumber(b.drivingDaysPerMonth);

  if (dailyKm === undefined || dailyKm <= 0 || dailyKm > 2000) {
    errors.push("Daily kilometers must be a positive number (max 2000).");
  }
  if (
    drivingDaysPerMonth === undefined ||
    drivingDaysPerMonth <= 0 ||
    drivingDaysPerMonth > 31
  ) {
    errors.push("Driving days per month must be between 1 and 31.");
  }

  const financingRaw = (b.financing as Record<string, unknown>) || {};
  const isFinancing = !!financingRaw.isFinancing;
  const financing = {
    isFinancing,
    vehiclePrice: toPositiveNumber(financingRaw.vehiclePrice),
    downPayment: toPositiveNumber(financingRaw.downPayment),
    interestRate: toPositiveNumber(financingRaw.interestRate),
    loanDurationYears: toPositiveNumber(financingRaw.loanDurationYears),
  };
  if (isFinancing && !financing.vehiclePrice) {
    errors.push("Vehicle price is required when financing is selected.");
  }

  if (errors.length) return { valid: false, errors };

  const sanitized: CarCostRequest = {
    make,
    model,
    variant: cleanString(b.variant),
    modelYear: cleanString(b.modelYear, 8),
    engineSize: cleanString(b.engineSize, 20),
    fuelType,
    country,
    city,
    dailyKm: dailyKm as number,
    drivingDaysPerMonth: drivingDaysPerMonth as number,
    fuelEconomyMode: b.fuelEconomyMode === "manual" ? "manual" : "auto",
    manualFuelEconomy: toPositiveNumber(b.manualFuelEconomy),
    manualFuelPrice: toPositiveNumber(b.manualFuelPrice),
    hasInsurance: b.hasInsurance !== false,
    manualInsuranceAnnual: toPositiveNumber(b.manualInsuranceAnnual),
    manualMaintenanceMonthly: toPositiveNumber(b.manualMaintenanceMonthly),
    financing,
  };

  return { valid: true, errors: [], sanitized };
}

// Very small in-memory rate limiter keyed by IP. Fine for a single serverless
// instance; for production scale, swap in a shared store (e.g. Upstash Redis).
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > MAX_REQUESTS;
}
