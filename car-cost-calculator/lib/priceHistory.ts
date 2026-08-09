"use client";

// Tracks the searched fuel/electricity price per unit (per liter or per kWh)
// for a given vehicle + location, purely in this browser's localStorage —
// consistent with the rest of the app's "no external database" approach.
// Lets the results page say "this is higher/lower than last time we checked."

const HISTORY_KEY = "carcost:fuelPriceHistory";
const MAX_ENTRIES_PER_KEY = 12;

interface PriceEntry {
  date: string; // ISO string
  price: number;
}

type HistoryMap = Record<string, PriceEntry[]>;

function readHistory(): HistoryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryMap) : {};
  } catch {
    return {};
  }
}

function writeHistory(map: HistoryMap) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(map));
  } catch {
    // localStorage full or unavailable — trend tracking just won't persist.
  }
}

/** Builds a stable key so the same car+location+fuel type is tracked together. */
export function priceHistoryKey(params: {
  make: string;
  model: string;
  variant?: string;
  fuelType: string;
  city: string;
  country: string;
}): string {
  return [params.make, params.model, params.variant, params.fuelType, params.city, params.country]
    .filter(Boolean)
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export interface PriceTrend {
  direction: "up" | "down" | "same" | "new";
  previousPrice: number | null;
  previousDate: string | null;
  percentChange: number | null;
}

/**
 * Looks up the trend for this key BEFORE recording the new price (so
 * "previous" genuinely means "last time", not "this time").
 */
export function getTrend(key: string, currentPrice: number): PriceTrend {
  const history = readHistory();
  const entries = history[key] || [];
  const last = entries[entries.length - 1];

  if (!last) {
    return { direction: "new", previousPrice: null, previousDate: null, percentChange: null };
  }

  const percentChange = last.price > 0 ? ((currentPrice - last.price) / last.price) * 100 : null;
  let direction: PriceTrend["direction"] = "same";
  if (percentChange !== null) {
    if (percentChange > 0.5) direction = "up";
    else if (percentChange < -0.5) direction = "down";
  }

  return {
    direction,
    previousPrice: last.price,
    previousDate: last.date,
    percentChange,
  };
}

/** Appends the new price reading, trimming old entries beyond the cap. */
export function recordPrice(key: string, price: number) {
  const history = readHistory();
  const entries = history[key] || [];
  entries.push({ date: new Date().toISOString(), price });
  history[key] = entries.slice(-MAX_ENTRIES_PER_KEY);
  writeHistory(history);
}
