// Server-only module. Never import this from a client component.
// Handles all communication with the SerperDev search API.

export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet?: string;
  position?: number;
}

export interface SerperAnswerBox {
  answer?: string;
  snippet?: string;
  title?: string;
}

export interface SerperSearchResponse {
  answerBox?: SerperAnswerBox;
  organic?: SerperOrganicResult[];
}

const SERPER_ENDPOINT = "https://google.serper.dev/search";

/**
 * Runs a single Serper.dev web search query.
 * Throws on network/HTTP failure so callers can decide how to degrade gracefully.
 */
export async function serperSearch(
  query: string,
  gl?: string
): Promise<SerperSearchResponse> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured on the server.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(SERPER_ENDPOINT, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: gl || "pk",
        num: 8,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Serper request failed with status ${res.status}`);
    }

    const data = (await res.json()) as SerperSearchResponse;
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Runs several Serper queries concurrently. Individual failures are captured
 * per-query rather than rejecting the whole batch, so a partial outage
 * degrades a single data point instead of the entire calculation.
 */
export async function serperSearchBatch(
  queries: string[],
  gl?: string
): Promise<Record<string, SerperSearchResponse | null>> {
  const entries = await Promise.all(
    queries.map(async (q) => {
      try {
        const result = await serperSearch(q, gl);
        return [q, result] as const;
      } catch {
        return [q, null] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}

/** Extracts the first plausible numeric value (with optional comma separators) from text. */
export function extractFirstNumber(text: string): number | null {
  if (!text) return null;
  const match = text.match(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ""));
  return Number.isFinite(num) ? num : null;
}

/** Pulls every plausible numeric value out of a body of text, for averaging across multiple results. */
export function extractAllNumbers(text: string): number[] {
  if (!text) return [];
  const matches = text.match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?/g);
  if (!matches) return [];
  return matches
    .map((m) => parseFloat(m.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n));
}

/** Combines the answer box + organic snippets of a Serper response into one text blob for parsing. */
export function flattenSnippets(resp: SerperSearchResponse | null): string {
  if (!resp) return "";
  const parts: string[] = [];
  if (resp.answerBox?.answer) parts.push(resp.answerBox.answer);
  if (resp.answerBox?.snippet) parts.push(resp.answerBox.snippet);
  for (const o of resp.organic || []) {
    if (o.snippet) parts.push(o.snippet);
  }
  return parts.join(" \n ");
}
