import { NextResponse } from "next/server";
import { calculateCarCost } from "@/lib/calculations";
import { LEADERBOARD_CARS, LEADERBOARD_ASSUMPTIONS, LeaderboardCarInput } from "@/lib/leaderboardCars";
import { CarCostRequest } from "@/types/car";

export const runtime = "nodejs";
// Recompute at most once per hour. This is what keeps the leaderboard
// "live" without needing a database or a cron job — Next.js's own data
// cache handles the refresh window.
export const revalidate = 3600;

async function computeOne(car: LeaderboardCarInput) {
  const request: CarCostRequest = {
    make: car.make,
    model: car.model,
    variant: car.variant,
    fuelType: car.fuelType,
    country: LEADERBOARD_ASSUMPTIONS.country,
    city: LEADERBOARD_ASSUMPTIONS.city,
    dailyKm: LEADERBOARD_ASSUMPTIONS.dailyKm,
    drivingDaysPerMonth: LEADERBOARD_ASSUMPTIONS.drivingDaysPerMonth,
    fuelEconomyMode: "auto",
    fuelPriceMode: "estimated",
    hasInsurance: false, // kept off so every car is judged on driving cost, not variable insurance quotes
    financing: { isFinancing: false },
  };
  const result = await calculateCarCost(request);
  return { vehicle: car, result };
}

export async function GET() {
  try {
    const entries = await Promise.all(LEADERBOARD_CARS.map(computeOne));

    const ranked = entries
      .map((e) => ({
        make: e.vehicle.make,
        model: e.vehicle.model,
        variant: e.vehicle.variant,
        fuelType: e.vehicle.fuelType,
        monthly: e.result.total.monthly,
        annual: e.result.total.annual,
        costPerKm: e.result.total.costPerKm,
        fuelLabel: e.result.fuel.label,
        fuelMonthly: e.result.fuel.monthly,
        maintenanceMonthly: e.result.maintenance.monthly,
        governmentMonthly: e.result.government.monthly,
      }))
      .sort((a, b) => a.costPerKm - b.costPerKm);

    return NextResponse.json({
      city: LEADERBOARD_ASSUMPTIONS.city,
      country: LEADERBOARD_ASSUMPTIONS.country,
      assumptions: {
        dailyKm: LEADERBOARD_ASSUMPTIONS.dailyKm,
        drivingDaysPerMonth: LEADERBOARD_ASSUMPTIONS.drivingDaysPerMonth,
        insuranceIncluded: false,
      },
      generatedAt: new Date().toISOString(),
      cars: ranked,
    });
  } catch (err) {
    console.error("leaderboard error:", err);
    return NextResponse.json(
      { error: "Couldn't build the leaderboard right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
