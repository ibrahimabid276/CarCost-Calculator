"use client";

import { Fragment, useState } from "react";
import { CarCostResponse, EstimateStatus } from "@/types/car";

function pkr(n: number, currency: string) {
  return `${currency} ${Math.round(n).toLocaleString()}`;
}

function StatusBadge({ status }: { status: EstimateStatus }) {
  const map: Record<EstimateStatus, { text: string; cls: string }> = {
    user: { text: "You entered this", cls: "bg-moss/10 text-moss" },
    search: { text: "Verified via search", cls: "bg-moss/10 text-moss" },
    baseline: { text: "Baseline estimate", cls: "bg-brass/15 text-brass" },
    unavailable: { text: "Unavailable", cls: "bg-rust/10 text-rust" },
    "not-applicable": { text: "Not applicable", cls: "bg-ink/5 text-ink/40" },
  };
  const { text, cls } = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>{text}</span>
  );
}

const ROWS: { key: "fuel" | "maintenance" | "insurance" | "government"; label: string | null }[] = [
  { key: "fuel", label: null }, // label resolved dynamically from data.fuel.label (Fuel vs Electricity)
  { key: "maintenance", label: "Maintenance" },
  { key: "insurance", label: "Insurance" },
  { key: "government", label: "Annual Government / Road Tax" },
];

export default function CostBreakdown({
  data,
  currency = "PKR",
}: {
  data: CarCostResponse;
  currency?: string;
}) {
  const [openSources, setOpenSources] = useState<string | null>(null);

  const blocks: Record<
    string,
    {
      monthly: number;
      annual: number;
      status: EstimateStatus;
      sources?: { label: string; snippet?: string; link?: string }[];
      note?: string;
      range?: [number, number];
    }
  > = {
    fuel: { monthly: data.fuel.monthly, annual: data.fuel.annual, status: data.fuel.status, sources: data.fuel.sources, note: data.fuel.note },
    maintenance: {
      monthly: data.maintenance.monthly,
      annual: data.maintenance.annual,
      status: data.maintenance.status,
      sources: data.maintenance.sources,
      note: data.maintenance.note,
      range: data.maintenance.isEstimateRange ? [data.maintenance.rangeLow!, data.maintenance.rangeHigh!] : undefined,
    },
    insurance: { monthly: data.insurance.monthly, annual: data.insurance.annual, status: data.insurance.status, sources: data.insurance.sources, note: data.insurance.note },
    government: {
      monthly: data.government.monthly,
      annual: data.government.annual,
      status: data.government.status,
      sources: data.government.sources,
      note: data.government.note,
      range: data.government.isEstimateRange ? [data.government.rangeLow!, data.government.rangeHigh!] : undefined,
    },
    financing: { monthly: data.financing.monthly, annual: data.financing.annual, status: "user" },
  };

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-ink/50">
              <th className="py-3 px-5 font-medium">Expense</th>
              <th className="py-3 px-5 font-medium">Monthly</th>
              <th className="py-3 px-5 font-medium">Annual</th>
              <th className="py-3 px-5 font-medium"></th>
              <th className="py-3 px-5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ key, label }) => {
              const b = blocks[key];
              const displayLabel = label ?? data.fuel.label;
              return (
                <Fragment key={key}>
                  <tr className="border-b border-black/5">
                    <td className="py-3 px-5 font-medium">{displayLabel}</td>
                    <td className="py-3 px-5 font-mono">{pkr(b.monthly, currency)}</td>
                    <td className="py-3 px-5 font-mono">{pkr(b.annual, currency)}</td>
                    <td className="py-3 px-5"><StatusBadge status={b.status} /></td>
                    <td className="py-3 px-5 text-right">
                      {b.sources && (
                        <button
                          className="text-xs text-moss underline underline-offset-2"
                          onClick={() => setOpenSources(openSources === key ? null : key)}
                        >
                          {openSources === key ? "Hide sources" : "View sources"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {openSources === key && b.sources && (
                    <tr className="bg-paper/60">
                      <td colSpan={5} className="px-5 py-4">
                        {key === "fuel" && (
                          <p className="text-xs text-ink/60 mb-2">
                            {data.fuel.label} price used: {currency} {data.fuel.pricePerUnit.toLocaleString()} per{" "}
                            {data.fuel.unit.includes("kWh") ? "kWh" : "liter"} · Economy used:{" "}
                            {data.fuel.economy} {data.fuel.unit}
                            {data.fuel.chargingLossPercent !== undefined && (
                              <> · Assumed charging loss: {data.fuel.chargingLossPercent}%</>
                            )}
                          </p>
                        )}
                        {b.range && (
                          <p className="text-xs text-ink/60 mb-2">
                            Estimated range: {currency} {b.range[0].toLocaleString()}–{b.range[1].toLocaleString()} / month
                          </p>
                        )}
                        <ul className="space-y-2">
                          {b.sources.map((s, i) => (
                            <li key={i} className="text-xs text-ink/60">
                              <span className="font-medium text-ink/80">{s.label}</span>
                              {s.snippet && <span> — {s.snippet.slice(0, 160)}</span>}
                              {s.link && (
                                <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-moss ml-1 underline">
                                  source
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                        {b.note && <p className="mt-2 text-xs italic text-ink/40">{b.note}</p>}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            <tr className="bg-ink/5 font-semibold">
              <td className="py-3 px-5">Total (recurring)</td>
              <td className="py-3 px-5 font-mono">{pkr(data.total.monthly, currency)}</td>
              <td className="py-3 px-5 font-mono">{pkr(data.total.annual, currency)}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* One-time registration is deliberately kept separate from recurring ownership costs */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">One-time vehicle registration</p>
          <p className="text-xs text-ink/50 mt-0.5">
            Not included in monthly/annual totals — this is a single upfront cost.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold">
            {data.government.oneTimeStatus === "unavailable"
              ? "Unable to verify"
              : pkr(data.government.oneTimeRegistration, currency)}
          </span>
          <StatusBadge status={data.government.oneTimeStatus} />
        </div>
      </div>
    </div>
  );
}
