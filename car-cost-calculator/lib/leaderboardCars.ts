import { FuelType } from "@/types/car";

export interface LeaderboardCarInput {
  make: string;
  model: string;
  variant?: string;
  fuelType: FuelType;
}

// A fixed, curated list of commonly-owned cars in Pakistan. This is a
// starting point for a genuinely computed ranking — not a claim that these
// are "the most popular" (that would require real sales/usage data this
// project doesn't have). Edit this list to add/remove cars.
export const LEADERBOARD_CARS: LeaderboardCarInput[] = [
  { make: "Suzuki", model: "Alto", variant: "VXR", fuelType: "Petrol" },
  { make: "Suzuki", model: "Cultus", variant: "VXR", fuelType: "Petrol" },
  { make: "Suzuki", model: "Wagon R", variant: "VXL", fuelType: "Petrol" },
  { make: "Toyota", model: "Yaris", variant: "1.3", fuelType: "Petrol" },
  { make: "Toyota", model: "Corolla", variant: "1.6", fuelType: "Petrol" },
  { make: "Honda", model: "City", variant: "1.2", fuelType: "Petrol" },
  { make: "Honda", model: "Civic", variant: "1.5", fuelType: "Petrol" },
  { make: "Kia", model: "Sportage", variant: "2.0", fuelType: "Petrol" },
  { make: "Hyundai", model: "Tucson", variant: "2.0", fuelType: "Petrol" },
  { make: "Toyota", model: "Fortuner", variant: "2.7", fuelType: "Petrol" },
];

// Shared driving assumptions applied to every car so the ranking is
// apples-to-apples. Matches the calculator's own defaults where possible.
export const LEADERBOARD_ASSUMPTIONS = {
  country: "Pakistan",
  city: "Lahore",
  dailyKm: 30,
  drivingDaysPerMonth: 26,
};
