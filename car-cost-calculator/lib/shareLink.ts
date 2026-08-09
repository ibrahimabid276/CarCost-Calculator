import LZString from "lz-string";
import { CarCostResponse } from "@/types/car";

interface SharePayload {
  data: CarCostResponse;
  currency: string;
}

/** Compresses the full result + currency into a URL-safe string for the ?share= param. */
export function encodeShareData(data: CarCostResponse, currency: string): string {
  const payload: SharePayload = { data, currency };
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

/** Reverses encodeShareData. Returns null if the string is missing/corrupt/invalid. */
export function decodeShareData(encoded: string): SharePayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as SharePayload;
    if (!parsed?.data?.total) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Builds the full shareable URL for the current origin. */
export function buildShareUrl(data: CarCostResponse, currency: string): string {
  const encoded = encodeShareData(data, currency);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/results?share=${encoded}`;
}
