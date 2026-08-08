"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResultsCard from "@/components/ResultsCard";
import CostBreakdown from "@/components/CostBreakdown";
import CostChart from "@/components/CostChart";
import { CarCostResponse } from "@/types/car";

export default function ResultsPage() {
  const [data, setData] = useState<CarCostResponse | null>(null);
  const [currency, setCurrency] = useState("PKR");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("carcost:result");
    const cur = sessionStorage.getItem("carcost:currency");
    if (!raw) {
      setNotFound(true);
      return;
    }
    setData(JSON.parse(raw));
    if (cur) setCurrency(cur);
  }, []);

  if (notFound) {
    return (
      <main className="container-page py-24 text-center">
        <h1 className="text-2xl font-display font-semibold">No results yet</h1>
        <p className="mt-3 text-ink/60">Run the calculator first to see your ownership cost.</p>
        <Link href="/calculator" className="btn-primary mt-8 inline-flex">
          Go to calculator
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="container-page py-24 text-center text-ink/50">Loading your results…</main>
    );
  }

  return (
    <main className="container-page py-14">
      <Link href="/calculator" className="text-sm text-ink/50 hover:text-ink">← Recalculate</Link>
      <p className="mt-4 text-sm text-ink/50">
        {data.vehicle.make} {data.vehicle.model} {data.vehicle.variant} · {data.vehicle.city}, {data.vehicle.country}
      </p>

      <div className="mt-6 space-y-10">
        <ResultsCard data={data} currency={currency} />
        <div>
          <h2 className="text-xl font-display font-semibold mb-4">Cost breakdown</h2>
          <CostBreakdown data={data} currency={currency} />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold mb-4">Visual breakdown</h2>
          <CostChart data={data} currency={currency} />
        </div>
        <p className="text-xs text-ink/40 max-w-2xl leading-relaxed">
          Estimates are based on your inputs and available market/web data.
          Actual costs may vary depending on fuel prices, driving conditions,
          maintenance requirements, insurance provider, government charges and
          other factors.
        </p>
      </div>
    </main>
  );
}
