"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CarForm from "@/components/CarForm";
import SearchProgress from "@/components/SearchProgress";
import { CarCostRequest } from "@/types/car";
import Link from "next/link";

export default function CalculatorPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CarCostRequest) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/car-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Something went wrong.");
      }
      sessionStorage.setItem("carcost:result", JSON.stringify(json));
      sessionStorage.setItem("carcost:currency", currencyForCountry(data.country));
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't retrieve current market information. You can enter the values manually instead."
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="container-page py-14">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">← Back home</Link>
      <h1 className="mt-4 text-3xl sm:text-4xl font-display font-semibold">
        Calculate your car&apos;s ownership cost
      </h1>
      <p className="mt-3 text-ink/60 max-w-xl">
        Fill in your vehicle and driving habits below. We&apos;ll search current
        market data for fuel, maintenance, insurance and registration costs
        specific to your location.
      </p>

      <div className="mt-10 max-w-3xl">
        {submitting ? (
          <SearchProgress />
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded-xl2 border border-rust/30 bg-rust/5 p-4 text-sm text-rust">
                {error}
              </div>
            )}
            <CarForm onSubmit={handleSubmit} submitting={submitting} />
          </>
        )}
      </div>
    </main>
  );
}

function currencyForCountry(country: string): string {
  const c = country.trim().toLowerCase();
  if (c.includes("pakistan")) return "PKR";
  if (c.includes("india")) return "₹";
  if (c.includes("united states") || c === "usa" || c === "us") return "$";
  if (c.includes("united kingdom") || c === "uk") return "£";
  if (c.includes("uae") || c.includes("emirates")) return "AED";
  return "PKR";
}
