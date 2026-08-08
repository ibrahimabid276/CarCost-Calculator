import { NextRequest, NextResponse } from "next/server";
import { calculateCarCost } from "@/lib/calculations";
import { isRateLimited, validateCarCostRequest } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { valid, errors, sanitized } = validateCarCostRequest(body);
    if (!valid || !sanitized) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const result = await calculateCarCost(sanitized);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("car-cost API error:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't retrieve current market information. You can enter the values manually instead.",
      },
      { status: 500 }
    );
  }
}
