import { CarCostResponse } from "@/types/car";

function fmt(n: number, currency: string) {
  return `${currency} ${Math.round(n).toLocaleString()}`;
}

const CARDS = [
  { key: "fuel" as const, label: null }, // resolved from data.fuel.label (Fuel vs Electricity)
  { key: "maintenance" as const, label: "Maintenance" },
  { key: "insurance" as const, label: "Insurance" },
  { key: "government" as const, label: "Government" },
];

export default function ResultsCard({
  data,
  currency = "PKR",
}: {
  data: CarCostResponse;
  currency?: string;
}) {
  return (
    <div className="space-y-8">
      <div className="card p-8 sm:p-12 text-center bg-gradient-to-b from-white to-paper dark:from-slate-850 dark:to-slate-850">
        <p className="text-sm uppercase tracking-wide text-ink/50 mb-3">
          Your estimated recurring ownership cost
        </p>
        <p className="text-5xl sm:text-6xl font-display font-semibold">
          {fmt(data.total.monthly, currency)}
          <span className="text-lg font-body font-normal text-ink/50"> / month</span>
        </p>
        <p className="mt-2 text-lg text-ink/60">{fmt(data.total.annual, currency)} / year</p>
        {data.government.oneTimeStatus !== "unavailable" && data.government.oneTimeRegistration > 0 && (
          <p className="mt-1 text-sm text-ink/40">
            Plus a one-time registration cost of {fmt(data.government.oneTimeRegistration, currency)} (not included above)
          </p>
        )}
        <p className="mt-6 inline-block rounded-full bg-moss/10 text-moss px-5 py-2 text-sm font-medium">
          {currency} {data.total.costPerKm.toFixed(2)} per kilometer
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CARDS.map(({ key, label }) => {
          const block = data[key];
          const displayLabel = label ?? data.fuel.label;
          return (
            <div key={key} className="card p-5">
              <p className="text-sm text-ink/50">{displayLabel}</p>
              <p className="mt-1 text-xl font-semibold font-mono">
                {fmt(block.monthly, currency)}
                <span className="text-xs font-body text-ink/40">/mo</span>
              </p>
            </div>
          );
        })}
        <div className="card p-5">
          <p className="text-sm text-ink/50">Financing</p>
          <p className="mt-1 text-xl font-semibold font-mono">
            {fmt(data.financing.monthly, currency)}
            <span className="text-xs font-body text-ink/40">/mo</span>
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="card p-6 bg-ink text-paper">
          <p className="text-sm text-paper/60">Estimated ownership expenses over 3 years</p>
          <p className="mt-1 text-3xl font-display font-semibold">
            {fmt(data.total.threeYear, currency)}
          </p>
        </div>
        <div className="card p-6 bg-rust text-paper dark:text-white">
          <p className="text-sm text-paper/70 dark:text-white/70">Estimated ownership expenses over 5 years</p>
          <p className="mt-1 text-3xl font-display font-semibold">
            {fmt(data.total.fiveYear, currency)}
          </p>
        </div>
      </div>
      <p className="text-xs text-ink/40 -mt-4">
        Recurring costs only (fuel/electricity, maintenance, insurance, annual road tax, financing) — not a depreciation or total-loss-of-value figure, and excludes the one-time registration fee shown separately.
      </p>

      {data.meta.warnings.length > 0 && (
        <div className="rounded-xl2 border border-brass/40 bg-brass/10 p-4 text-sm text-ink/70">
          {data.meta.warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
