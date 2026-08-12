"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Vehicle information received",
  "Searching current fuel prices",
  "Estimating maintenance costs",
  "Checking insurance estimates",
  "Checking registration costs",
  "Calculating ownership cost",
];

export default function SearchProgress() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Purely cosmetic pacing — the real work happens server-side in one
    // request; this just gives the user a sense of progress while they wait.
    const interval = setInterval(() => {
      setActiveIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card p-10 max-w-md mx-auto text-center">
      <h3 className="font-display text-xl font-semibold mb-6">
        Analyzing your vehicle…
      </h3>
      <ul className="space-y-3 text-left">
        {STEPS.map((step, i) => {
          const done = i < activeIndex || (i === activeIndex && i === STEPS.length - 1);
          const active = i === activeIndex && !done;
          return (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                  done
                    ? "bg-moss text-white animate-checkIn"
                    : active
                    ? "border-2 border-brass animate-pulse"
                    : "border border-black/15 dark:border-white/15"
                }`}
              >
                {done ? "✓" : ""}
              </span>
              <span className={done || active ? "text-ink" : "text-ink/35"}>
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
