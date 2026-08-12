"use client";

import { useState } from "react";
import Link from "next/link";
import ComparisonTable from "@/components/ComparisonTable";
import SearchProgress from "@/components/SearchProgress";
import { CompareCarInput, CompareResult, FuelType } from "@/types/car";
import { COUNTRIES } from "@/lib/countries";
import { currencyForCountry } from "@/lib/currency";

const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"];

function emptyCar(): CompareCarInput {
  return { make: "", model: "", variant: "", fuelType: "Petrol" };
}

export default function ComparePage() {
  const [cars, setCars] = useState<CompareCarInput[]>([
    emptyCar(),
    emptyCar(),
  ]);
  const [country, setCountry] = useState("Pakistan");
  const [city, setCity] = useState("Lahore");
  const [dailyKm, setDailyKm] = useState<number | "">("");
  const [drivingDaysPerMonth, setDrivingDaysPerMonth] = useState<number | "">("");
  const [hasInsurance, setHasInsurance] = useState(false); // Insurance is OFF by default in comparisons

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CompareResult[] | null>(null);

  function updateCar(i: number, patch: Partial<CompareCarInput>) {
    setCars((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function addCar() {
    if (cars.length >= 4) return;
    setCars((prev) => [...prev, emptyCar()]);
  }

  function removeCar(i: number) {
    if (cars.length <= 2) return;
    setCars((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleCompare() {
    setError(null);
    if (cars.some((c) => !c.make.trim() || !c.model.trim())) {
      setError("Please fill in a make and model for every car.");
      return;
    }
    if (dailyKm === "" || drivingDaysPerMonth === "") {
      setError("Please enter daily kilometers and driving days per month.");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/compare-cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cars,
          country,
          city,
          dailyKm: Number(dailyKm),
          drivingDaysPerMonth: Number(drivingDaysPerMonth),
          hasInsurance,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Comparison failed.");
      setResults(json.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page py-14">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">← Back home</Link>
      <h1 className="mt-4 text-3xl sm:text-4xl font-display font-semibold">Compare cars</h1>
      <p className="mt-3 text-ink/60 max-w-xl">
        Line up two to four vehicles and see fuel, maintenance, insurance and
        total ownership cost side by side.
      </p>

      <div className="mt-10 max-w-4xl space-y-6">
        <section className="card p-6 sm:p-8">
          <h3 className="font-display text-lg font-semibold mb-4">Shared driving profile</h3>
          <div className="grid sm:grid-cols-4 gap-4">
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
              <input className="field-input" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Daily km</label>
              <input type="number" className="field-input" placeholder="e.g. 30" value={dailyKm} onChange={(e) => setDailyKm(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="field-label">Driving days/mo</label>
              <input type="number" className="field-input" placeholder="e.g. 26" value={drivingDaysPerMonth} onChange={(e) => setDrivingDaysPerMonth(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <div className="mt-4">
            <label className="field-label">Include insurance in this comparison?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setHasInsurance(true)}
                className={`px-4 py-2 rounded-full text-sm border ${hasInsurance ? "bg-ink text-paper border-ink" : "border-black/15 dark:border-white/15"}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHasInsurance(false)}
                className={`px-4 py-2 rounded-full text-sm border ${!hasInsurance ? "bg-ink text-paper border-ink" : "border-black/15 dark:border-white/15"}`}
              >
                No
              </button>
            </div>
          </div>
        </section>

        {cars.map((car, i) => (
          <section key={i} className="card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Car {i + 1}</h3>
              {cars.length > 2 && (
                <button onClick={() => removeCar(i)} className="text-xs text-rust underline">
                  Remove
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="field-label">Make</label>
                <input className="field-input" value={car.make} onChange={(e) => updateCar(i, { make: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Model</label>
                <input className="field-input" value={car.model} onChange={(e) => updateCar(i, { model: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Variant</label>
                <input className="field-input" value={car.variant} onChange={(e) => updateCar(i, { variant: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Fuel type</label>
                <select className="field-input" value={car.fuelType} onChange={(e) => updateCar(i, { fuelType: e.target.value as FuelType })}>
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        ))}

        {cars.length < 4 && (
          <button onClick={addCar} className="btn-secondary">
            + Add another car
          </button>
        )}

        {error && <p className="text-rust text-sm font-medium">{error}</p>}

        <button onClick={handleCompare} disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? "Comparing…" : "Compare Cars"}
        </button>
      </div>

      <div className="mt-12 max-w-5xl">
        {loading && <SearchProgress />}
        {results && !loading && (
          <>
            <h2 className="text-xl font-display font-semibold mb-4">Comparison results</h2>
            <ComparisonTable results={results} currency={currencyForCountry(country)} />
          </>
        )}
      </div>
    </main>
  );
}
