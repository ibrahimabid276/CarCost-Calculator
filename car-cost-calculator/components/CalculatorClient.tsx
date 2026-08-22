"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CarForm from "@/components/CarForm";
import SearchProgress from "@/components/SearchProgress";
import { CarCostRequest } from "@/types/car";
import { currencyForCountry } from "@/lib/currency";
import Link from "next/link";

export default function CalculatorClient() {
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

      <div className="mt-16 max-w-3xl border-t border-black/5 pt-10 dark:border-white/10">
        <h2 className="text-xl font-display font-semibold">What this calculator works out</h2>
        <p className="mt-3 text-ink/60 leading-relaxed">
          Based on the vehicle and driving habits you enter, this tool
          estimates your monthly and yearly fuel (or electricity) cost,
          maintenance, insurance, one-time registration and annual government
          charges, and — if you&apos;re financing — your loan installment. It
          then combines these into a total monthly and yearly ownership cost,
          a cost-per-kilometer figure, and 3-year and 5-year projections.
        </p>
        <p className="mt-3 text-ink/60 leading-relaxed">
          Fuel price, maintenance and insurance are estimated using current
          market information where possible, and clearly marked as estimates
          rather than guarantees — you can always override any of them with
          your own known figures. Government charges are split into a
          one-time registration fee and a separate recurring annual tax, so
          the monthly total only reflects genuinely recurring costs.
        </p>
        <p className="mt-3 text-sm text-ink/50">
          Want the full explanation of how each number is worked out? Read{" "}
          <Link href="/guides/how-to-calculate-car-ownership-cost-pakistan" className="text-moss underline">
            how car ownership cost is calculated
          </Link>{" "}
          or see the{" "}
          <Link href="/methodology" className="text-moss underline">
            full methodology
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
