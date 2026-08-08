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

export interface EstimateBlock {
  monthly: number;
  annual: number;
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
  government: EstimateBlock;
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
