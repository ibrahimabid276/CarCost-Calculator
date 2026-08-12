"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LeaderboardCar {
  make: string;
  model: string;
  variant?: string;
  fuelType: string;
  monthly: number;
  annual: number;
  costPerKm: number;
  fuelLabel: string;
  fuelMonthly: number;
  maintenanceMonthly: number;
  governmentMonthly: number;
}

interface LeaderboardData {
  city: string;
  country: string;
  assumptions: { dailyKm: number; drivingDaysPerMonth: number; insuranceIncluded: boolean };
  generatedAt: string;
  cars: LeaderboardCar[];
}

function fmt(n: number) {
  return `PKR ${Math.round(n).toLocaleString()}`;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."));
  }, []);

  return (
    <main className="container-page py-14">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">← Back home</Link>
      <h1 className="mt-4 text-3xl sm:text-4xl font-display font-semibold">
        Cheapest cars to own in {data?.city || "Lahore"}
      </h1>
      <p className="mt-3 text-ink/60 max-w-xl">
        A ranked, real-calculation comparison of commonly-owned cars in Pakistan —
        computed the same way as the calculator, using the same live market data.
      </p>

      {error && <p className="mt-8 text-rust text-sm font-medium">{error}</p>}

      {!data && !error && (
        <p className="mt-8 text-ink/50 text-sm">Calculating current ownership costs…</p>
      )}

      {data && (
        <>
          <p className="mt-6 text-xs text-ink/40">
            Assumptions: {data.assumptions.dailyKm} km/day, {data.assumptions.drivingDaysPerMonth}{" "}
            driving days/month, insurance not included. Updated{" "}
            {new Date(data.generatedAt).toLocaleString()}.
          </p>

          <div className="mt-6 card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-left text-ink/50">
                  <th className="py-3 px-5 font-medium">#</th>
                  <th className="py-3 px-5 font-medium">Vehicle</th>
                  <th className="py-3 px-5 font-medium">Monthly cost</th>
                  <th className="py-3 px-5 font-medium">Cost / km</th>
                  <th className="py-3 px-5 font-medium">Fuel</th>
                  <th className="py-3 px-5 font-medium">Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {data.cars.map((car, i) => (
                  <tr key={`${car.make}-${car.model}`} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-3 px-5 text-ink/40">{i + 1}</td>
                    <td className="py-3 px-5 font-medium">
                      {car.make} {car.model} {car.variant}
                      {i === 0 && (
                        <span className="ml-2 rounded-full bg-moss/10 text-moss text-[10px] px-2 py-0.5 align-middle">
                          Cheapest
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 font-mono">{fmt(car.monthly)}</td>
                    <td className="py-3 px-5 font-mono">PKR {car.costPerKm.toFixed(2)}</td>
                    <td className="py-3 px-5 font-mono">{fmt(car.fuelMonthly)}</td>
                    <td className="py-3 px-5 font-mono">{fmt(car.maintenanceMonthly)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-xs text-ink/40 max-w-2xl leading-relaxed">
            This is a fixed list of commonly-owned vehicles, not a ranking of what
            visitors actually search for or compare on this site. Figures are
            estimates based on current market data and may vary. Want your own
            car&apos;s exact numbers?{" "}
            <Link href="/calculator" className="text-moss underline">
              Use the calculator
            </Link>
            .
          </p>
        </>
      )}
    </main>
  );
}
