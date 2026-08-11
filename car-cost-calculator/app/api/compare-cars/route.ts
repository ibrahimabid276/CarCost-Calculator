import { NextRequest, NextResponse } from "next/server";
import { calculateCarCost } from "@/lib/calculations";
import { isRateLimited } from "@/lib/validation";
import { CarCostRequest, CompareRequest } from "@/types/car";

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

    let body: CompareRequest;
    try {
      body = (await req.json()) as CompareRequest;
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
    }

    if (!body.cars || !Array.isArray(body.cars) || body.cars.length < 2) {
      return NextResponse.json(
        { error: "Please provide at least two vehicles to compare." },
        { status: 400 }
      );
    }
    if (body.cars.length > 4) {
      return NextResponse.json(
        { error: "You can compare up to 4 vehicles at a time." },
        { status: 400 }
      );
    }

    const country = body.country || "Pakistan";
    const city = body.city || "Lahore";
    const dailyKm = body.dailyKm || 30;
    const drivingDaysPerMonth = body.drivingDaysPerMonth || 26;
    // Insurance is OFF by default for comparisons unless the caller
    // explicitly opts in — matches the Compare Cars UI default.
    const hasInsurance = body.hasInsurance === true;

    const results = await Promise.all(
      body.cars.map(async (car) => {
        const req: CarCostRequest = {
          make: car.make,
          model: car.model,
          variant: car.variant,
          fuelType: car.fuelType,
          country,
          city,
          dailyKm,
          drivingDaysPerMonth,
          fuelEconomyMode: "auto",
          hasInsurance,
          financing: { isFinancing: false },
        };
        const result = await calculateCarCost(req);
        return { vehicle: car, result };
      })
    );

    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    console.error("compare-cars API error:", err);
    return NextResponse.json(
      { error: "We couldn't complete the comparison right now. Please try again." },
      { status: 500 }
    );
  }
}
