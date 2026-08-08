"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { CarCostResponse } from "@/types/car";

const COLORS = ["#B5502F", "#C08A3E", "#2F5D50", "#10151A", "#7D8F9A"];

export default function CostChart({
  data,
  currency = "PKR",
}: {
  data: CarCostResponse;
  currency?: string;
}) {
  const pieData = [
    { name: "Fuel", value: data.fuel.monthly },
    { name: "Maintenance", value: data.maintenance.monthly },
    { name: "Insurance", value: data.insurance.monthly },
    { name: "Government", value: data.government.monthly },
    { name: "Financing", value: data.financing.monthly },
  ].filter((d) => d.value > 0);

  const projectionData = [
    { name: "1 Year", value: data.total.annual },
    { name: "3 Years", value: data.total.threeYear },
    { name: "5 Years", value: data.total.fiveYear },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Monthly cost breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {pieData.map((d, i) => (
            <li key={d.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {d.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Ownership projection</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#10151A10" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} />
              <Bar dataKey="value" fill="#2F5D50" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
