import { CompareResult } from "@/types/car";

function fmt(n: number, currency: string) {
  return `${currency} ${Math.round(n).toLocaleString()}`;
}

const ROWS: { key: keyof CompareResult["result"]["total"] | "fuel" | "maintenance" | "insurance" | "government"; label: string; isTotalField?: boolean }[] = [
  { key: "fuel", label: "Monthly Fuel" },
  { key: "maintenance", label: "Maintenance" },
  { key: "insurance", label: "Insurance" },
  { key: "government", label: "Government" },
  { key: "monthly", label: "Total Monthly", isTotalField: true },
  { key: "costPerKm", label: "Cost / KM", isTotalField: true },
  { key: "threeYear", label: "3-Year Cost", isTotalField: true },
  { key: "fiveYear", label: "5-Year Cost", isTotalField: true },
];

export default function ComparisonTable({
  results,
  currency = "PKR",
}: {
  results: CompareResult[];
  currency?: string;
}) {
  const cheapestIndex = results.reduce(
    (best, r, i, arr) => (r.result.total.monthly < arr[best].result.total.monthly ? i : best),
    0
  );

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b border-black/10">
            <th className="py-3 px-5 text-left font-medium text-ink/50">Vehicle</th>
            {results.map((r, i) => (
              <th
                key={i}
                className={`py-3 px-5 text-left font-semibold ${
                  i === cheapestIndex ? "text-moss" : ""
                }`}
              >
                {r.vehicle.make} {r.vehicle.model}
                {i === cheapestIndex && (
                  <span className="ml-2 rounded-full bg-moss/10 text-moss text-[10px] px-2 py-0.5 align-middle">
                    Lowest cost
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-black/5">
              <td className="py-3 px-5 text-ink/60">{row.label}</td>
              {results.map((r, i) => {
                let val: number;
                if (row.isTotalField) {
                  val = r.result.total[row.key as keyof typeof r.result.total];
                } else {
                  val = r.result[row.key as "fuel" | "maintenance" | "insurance" | "government"].monthly;
                }
                const display =
                  row.key === "costPerKm" ? `${currency} ${val.toFixed(2)}` : fmt(val, currency);
                return (
                  <td key={i} className={`py-3 px-5 font-mono ${i === cheapestIndex ? "font-semibold" : ""}`}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
