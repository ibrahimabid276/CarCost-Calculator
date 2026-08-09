"use client";

import { useState } from "react";
import { CarCostRequest, FuelType } from "@/types/car";
import { COUNTRIES } from "@/lib/countries";

const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Other",
];
const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"];

interface Props {
  onSubmit: (data: CarCostRequest) => void;
  submitting: boolean;
}

export default function CarForm({ onSubmit, submitting }: Props) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [variant, setVariant] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [engineSize, setEngineSize] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("Petrol");

  const [country, setCountry] = useState("Pakistan");
  const [city, setCity] = useState("Lahore");
  const [customCity, setCustomCity] = useState("");

  const [dailyKm, setDailyKm] = useState<number | "">("");
  const [drivingDaysPerMonth, setDrivingDaysPerMonth] = useState<number | "">("");
  const [fuelEconomyMode, setFuelEconomyMode] = useState<"auto" | "manual">("auto");
  const [manualFuelEconomy, setManualFuelEconomy] = useState<number | "">("");
  const [manualFuelPrice, setManualFuelPrice] = useState<number | "">("");

  const [hasInsurance, setHasInsurance] = useState(true);
  const [manualInsuranceAnnual, setManualInsuranceAnnual] = useState<number | "">("");
  const [manualMaintenanceMonthly, setManualMaintenanceMonthly] = useState<number | "">("");

  const [isFinancing, setIsFinancing] = useState(false);
  const [vehiclePrice, setVehiclePrice] = useState<number | "">("");
  const [downPayment, setDownPayment] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [loanDurationYears, setLoanDurationYears] = useState<number | "">("");

  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!make.trim() || !model.trim()) {
      setFormError("Please enter both a make and model.");
      return;
    }
    if (dailyKm === "" || drivingDaysPerMonth === "" || dailyKm <= 0 || drivingDaysPerMonth <= 0) {
      setFormError("Please enter your daily kilometers and driving days per month.");
      return;
    }
    if (isFinancing && !vehiclePrice) {
      setFormError("Please enter a vehicle price to calculate financing.");
      return;
    }

    const data: CarCostRequest = {
      make,
      model,
      variant,
      modelYear,
      engineSize,
      fuelType,
      country,
      city: city === "Other" ? customCity || "Other" : city,
      dailyKm: Number(dailyKm),
      drivingDaysPerMonth: Number(drivingDaysPerMonth),
      fuelEconomyMode,
      manualFuelEconomy: manualFuelEconomy === "" ? undefined : Number(manualFuelEconomy),
      manualFuelPrice: manualFuelPrice === "" ? undefined : Number(manualFuelPrice),
      hasInsurance,
      manualInsuranceAnnual:
        manualInsuranceAnnual === "" ? undefined : Number(manualInsuranceAnnual),
      manualMaintenanceMonthly:
        manualMaintenanceMonthly === "" ? undefined : Number(manualMaintenanceMonthly),
      financing: {
        isFinancing,
        vehiclePrice: vehiclePrice === "" ? undefined : Number(vehiclePrice),
        downPayment: downPayment === "" ? undefined : Number(downPayment),
        interestRate: interestRate === "" ? undefined : Number(interestRate),
        loanDurationYears: loanDurationYears === "" ? undefined : Number(loanDurationYears),
      },
    };

    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Vehicle */}
      <section className="card p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold mb-5">Vehicle information</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">Car make</label>
            <input className="field-input" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" />
          </div>
          <div>
            <label className="field-label">Car model</label>
            <input className="field-input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Corolla" />
          </div>
          <div>
            <label className="field-label">Variant (optional)</label>
            <input className="field-input" value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="1.6 GLi" />
          </div>
          <div>
            <label className="field-label">Model year</label>
            <input className="field-input" value={modelYear} onChange={(e) => setModelYear(e.target.value)} placeholder="2023" />
          </div>
          <div>
            <label className="field-label">Engine size</label>
            <input className="field-input" value={engineSize} onChange={(e) => setEngineSize(e.target.value)} placeholder="1.6L" />
          </div>
          <div>
            <label className="field-label">Fuel type</label>
            <select
              className="field-input"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="card p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold mb-5">Location</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">Country</label>
            <select className="field-input" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">City</label>
            <select className="field-input" value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {city === "Other" && (
              <input
                className="field-input mt-2"
                placeholder="Enter your city"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
              />
            )}
          </div>
        </div>
      </section>

      {/* Driving */}
      <section className="card p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold mb-5">Driving information</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">Daily kilometers</label>
            <input
              type="number"
              className="field-input"
              placeholder="e.g. 30"
              value={dailyKm}
              onChange={(e) => setDailyKm(e.target.value === "" ? "" : Number(e.target.value))}
              min={1}
            />
          </div>
          <div>
            <label className="field-label">Driving days per month</label>
            <input
              type="number"
              className="field-input"
              placeholder="e.g. 26"
              value={drivingDaysPerMonth}
              onChange={(e) => setDrivingDaysPerMonth(e.target.value === "" ? "" : Number(e.target.value))}
              min={1}
              max={31}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">
              {fuelType === "Electric" ? "Average electric efficiency (km/kWh)" : "Average fuel economy (km/L)"}
            </label>
            <div className="flex gap-3 mb-2">
              <button
                type="button"
                onClick={() => setFuelEconomyMode("auto")}
                className={`px-4 py-2 rounded-full text-sm border ${
                  fuelEconomyMode === "auto" ? "bg-ink text-paper border-ink" : "border-black/15"
                }`}
              >
                Use estimated value
              </button>
              <button
                type="button"
                onClick={() => setFuelEconomyMode("manual")}
                className={`px-4 py-2 rounded-full text-sm border ${
                  fuelEconomyMode === "manual" ? "bg-ink text-paper border-ink" : "border-black/15"
                }`}
              >
                I&apos;ll enter my own
              </button>
            </div>
            {fuelEconomyMode === "manual" && (
              <input
                type="number"
                className="field-input"
                placeholder={fuelType === "Electric" ? "e.g. 6 km/kWh" : "e.g. 14 km/L"}
                value={manualFuelEconomy}
                onChange={(e) => setManualFuelEconomy(e.target.value === "" ? "" : Number(e.target.value))}
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">
              {fuelType === "Electric" ? "Manual electricity price override (optional)" : "Manual fuel price override (optional)"}
            </label>
            <input
              type="number"
              className="field-input"
              placeholder="Leave blank to use current searched price"
              value={manualFuelPrice}
              onChange={(e) => setManualFuelPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* Insurance & Maintenance overrides */}
      <section className="card p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold mb-5">Insurance &amp; maintenance</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">Insurance</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setHasInsurance(true)}
                className={`px-4 py-2 rounded-full text-sm border ${hasInsurance ? "bg-ink text-paper border-ink" : "border-black/15"}`}
              >
                I have insurance
              </button>
              <button
                type="button"
                onClick={() => setHasInsurance(false)}
                className={`px-4 py-2 rounded-full text-sm border ${!hasInsurance ? "bg-ink text-paper border-ink" : "border-black/15"}`}
              >
                I don&apos;t have insurance
              </button>
            </div>
          </div>
          {hasInsurance && (
            <div>
              <label className="field-label">Enter my own annual insurance cost (optional)</label>
              <input
                type="number"
                className="field-input"
                placeholder="Leave blank to estimate"
                value={manualInsuranceAnnual}
                onChange={(e) => setManualInsuranceAnnual(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="field-label">Enter my own monthly maintenance cost (optional)</label>
            <input
              type="number"
              className="field-input"
              placeholder="Leave blank to estimate"
              value={manualMaintenanceMonthly}
              onChange={(e) => setManualMaintenanceMonthly(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* Financing */}
      <section className="card p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold mb-5">Financing</h3>
        <div className="flex gap-3 mb-5">
          <button
            type="button"
            onClick={() => setIsFinancing(true)}
            className={`px-4 py-2 rounded-full text-sm border ${isFinancing ? "bg-ink text-paper border-ink" : "border-black/15"}`}
          >
            Yes, I&apos;m financing
          </button>
          <button
            type="button"
            onClick={() => setIsFinancing(false)}
            className={`px-4 py-2 rounded-full text-sm border ${!isFinancing ? "bg-ink text-paper border-ink" : "border-black/15"}`}
          >
            No financing
          </button>
        </div>
        {isFinancing && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="field-label">Vehicle price</label>
              <input type="number" className="field-input" placeholder="e.g. 6500000" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="field-label">Down payment</label>
              <input type="number" className="field-input" placeholder="e.g. 1500000" value={downPayment} onChange={(e) => setDownPayment(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="field-label">Interest / profit rate (annual %)</label>
              <input type="number" className="field-input" placeholder="e.g. 15" value={interestRate} onChange={(e) => setInterestRate(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="field-label">Loan duration (years)</label>
              <input type="number" className="field-input" placeholder="e.g. 5" value={loanDurationYears} onChange={(e) => setLoanDurationYears(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
        )}
      </section>

      {formError && (
        <p className="text-rust text-sm font-medium">{formError}</p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto disabled:opacity-60">
        {submitting ? "Calculating…" : "Calculate My Ownership Cost"}
      </button>
    </form>
  );
}
