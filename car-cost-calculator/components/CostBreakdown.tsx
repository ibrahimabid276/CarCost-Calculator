"use client";

import { Fragment, useState } from "react";
import { CarCostResponse } from "@/types/car";

function pkr(n: number, currency: string) {
  return `${currency} ${Math.round(n).toLocaleString()}`;
}

const ROWS = [
  { key: "fuel", label: "Fuel" },
  { key: "maintenance", label: "Maintenance" },
  { key: "insurance", label: "Insurance" },
  { key: "government", label: "Registration / Government" },
  { key: "financing", label: "Financing" },
] as const;

export default function CostBreakdown({
  data,
  currency = "PKR",
}: {
  data: CarCostResponse;
  currency?: string;
}) {
  const [openSources, setOpenSources] = useState<string | null>(null);

  const blocks: Record<string, { monthly: number; annual: number; sources?: { label: string; snippet?: string; link?: string }[]; note?: string; range?: [number, number] }> = {
    fuel: { monthly: data.fuel.monthly, annual: data.fuel.annual, sources: data.fuel.sources },
    maintenance: {
      monthly: data.maintenance.monthly,
      annual: data.maintenance.annual,
      sources: data.maintenance.sources,
      note: data.maintenance.note,
      range: data.maintenance.isEstimateRange ? [data.maintenance.rangeLow!, data.maintenance.rangeHigh!] : undefined,
    },
    insurance: { monthly: data.insurance.monthly, annual: data.insurance.annual, sources: data.insurance.sources, note: data.insurance.note },
    government: {
      monthly: data.government.monthly,
      annual: data.government.annual,
      sources: data.government.sources,
      note: data.government.note,
      range: data.government.isEstimateRange ? [data.government.rangeLow!, data.government.rangeHigh!] : undefined,
    },
    financing: { monthly: data.financing.monthly, annual: data.financing.annual },
  };

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-ink/50">
            <th className="py-3 px-5 font-medium">Expense</th>
            <th className="py-3 px-5 font-medium">Monthly</th>
            <th className="py-3 px-5 font-medium">Annual</th>
            <th className="py-3 px-5 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ key, label }) => {
            const b = blocks[key];
            return (
              <Fragment key={key}>
                <tr className="border-b border-black/5">
                  <td className="py-3 px-5 font-medium">{label}</td>
                  <td className="py-3 px-5 font-mono">{pkr(b.monthly, currency)}</td>
                  <td className="py-3 px-5 font-mono">{pkr(b.annual, currency)}</td>
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
                    <td colSpan={4} className="px-5 py-4">
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
            <td className="py-3 px-5">Total</td>
            <td className="py-3 px-5 font-mono">{pkr(data.total.monthly, currency)}</td>
            <td className="py-3 px-5 font-mono">{pkr(data.total.annual, currency)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
