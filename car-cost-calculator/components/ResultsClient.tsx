"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResultsCard from "@/components/ResultsCard";
import CostBreakdown from "@/components/CostBreakdown";
import CostChart from "@/components/CostChart";
import { CarCostResponse } from "@/types/car";
import { buildShareUrl, decodeShareData } from "@/lib/shareLink";
import { getTrend, priceHistoryKey, recordPrice, PriceTrend } from "@/lib/priceHistory";

export default function ResultsClient() {
  const [data, setData] = useState<CarCostResponse | null>(null);
  const [currency, setCurrency] = useState("PKR");
  const [notFound, setNotFound] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [trend, setTrend] = useState<PriceTrend | null>(null);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get("share");

    if (shareParam) {
      const decoded = decodeShareData(shareParam);
      if (decoded) {
        setData(decoded.data);
        setCurrency(decoded.currency);
        setIsSharedView(true);
        return;
      }
    }

    const raw = sessionStorage.getItem("carcost:result");
    const cur = sessionStorage.getItem("carcost:currency");
    if (!raw) {
      setNotFound(true);
      return;
    }
    const parsed = JSON.parse(raw) as CarCostResponse;
    setData(parsed);
    if (cur) setCurrency(cur);

    // Fuel price trend — only for calculations you actually just ran, not
    // when viewing someone else's shared link.
    const key = priceHistoryKey({
      make: parsed.vehicle.make,
      model: parsed.vehicle.model,
      variant: parsed.vehicle.variant,
      fuelType: parsed.vehicle.fuelType,
      city: parsed.vehicle.city,
      country: parsed.vehicle.country,
    });
    const priceTrend = getTrend(key, parsed.fuel.pricePerUnit);
    setTrend(priceTrend);
    recordPrice(key, parsed.fuel.pricePerUnit);
  }, []);

  async function handleDownloadPdf() {
    if (!data) return;
    setPdfLoading(true);
    try {
      // Loaded on demand — jsPDF is a sizeable library and most visitors
      // never click this button, so it shouldn't be part of the initial
      // results-page bundle.
      const { downloadCarCostPdf } = await import("@/lib/pdfExport");
      await downloadCarCostPdf(data, currency);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleCopyLink() {
    if (!data) return;
    try {
      const url = buildShareUrl(data, currency);
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2500);
    }
  }

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

      {isSharedView && (
        <div className="mt-4 rounded-xl2 border border-moss/30 bg-moss/5 px-4 py-3 text-sm text-moss">
          You&apos;re viewing a shared ownership report.{" "}
          <Link href="/calculator" className="underline font-medium">
            Run your own calculation
          </Link>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/50">
          {data.vehicle.make} {data.vehicle.model} {data.vehicle.variant} · {data.vehicle.city}, {data.vehicle.country}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-60"
          >
            {pdfLoading ? "Preparing PDF…" : "Download PDF report"}
          </button>
          <button
            onClick={handleCopyLink}
            className="btn-secondary text-sm py-2 px-4"
          >
            {copyState === "copied" ? "Link copied ✓" : copyState === "error" ? "Couldn't copy" : "Copy shareable link"}
          </button>
        </div>
      </div>

      {!isSharedView && trend && trend.direction !== "new" && trend.previousPrice !== null && (
        <p className="mt-3 text-xs text-ink/50">
          {data.fuel.label} price: {currency} {data.fuel.pricePerUnit.toLocaleString()} per{" "}
          {data.fuel.unit.includes("kWh") ? "kWh" : "liter"} —{" "}
          {trend.direction === "up" && (
            <span className="text-rust font-medium">
              ↑ {trend.percentChange?.toFixed(1)}% higher than last time
            </span>
          )}
          {trend.direction === "down" && (
            <span className="text-moss font-medium">
              ↓ {Math.abs(trend.percentChange ?? 0).toFixed(1)}% lower than last time
            </span>
          )}
          {trend.direction === "same" && <span className="font-medium">about the same as last time</span>}
          {" "}(was {currency} {trend.previousPrice.toLocaleString()} on{" "}
          {trend.previousDate ? new Date(trend.previousDate).toLocaleDateString() : ""})
        </p>
      )}
      {!isSharedView && trend && trend.direction === "new" && (
        <p className="mt-3 text-xs text-ink/40">
          First time checking this car in this location — we&apos;ll show a price trend next time.
        </p>
      )}

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
