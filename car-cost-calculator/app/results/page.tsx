import type { Metadata } from "next";
import ResultsClient from "@/components/ResultsClient";
import { decodeShareData } from "@/lib/shareLink";

type SearchParams = { [key: string]: string | string[] | undefined };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const shareParam = searchParams?.share;
  const share = Array.isArray(shareParam) ? shareParam[0] : shareParam;

  const fallback: Metadata = {
    title: "Your Ownership Cost — CarCost Calculator",
    description: "See your car's full ownership cost breakdown — fuel, maintenance, insurance, and more.",
  };

  if (!share) return fallback;

  const decoded = decodeShareData(share);
  if (!decoded) return fallback;

  const { data, currency } = decoded;
  const vehicleName = [data.vehicle.make, data.vehicle.model, data.vehicle.variant]
    .filter(Boolean)
    .join(" ");
  const monthly = Math.round(data.total.monthly).toLocaleString();
  const locationLine = [data.vehicle.city, data.vehicle.country].filter(Boolean).join(", ");

  const title = `${vehicleName} — ${currency} ${monthly}/mo | CarCost Calculator`;
  const description = `Estimated ownership cost for ${vehicleName} in ${locationLine}: ${currency} ${monthly}/month, ${currency} ${data.total.costPerKm.toFixed(
    2
  )}/km. Full breakdown with sources inside.`;

  const ogParams = new URLSearchParams({
    make: data.vehicle.make,
    model: data.vehicle.model,
    variant: data.vehicle.variant || "",
    monthly: String(Math.round(data.total.monthly)),
    currency,
    costPerKm: data.total.costPerKm.toFixed(2),
    city: data.vehicle.city,
    country: data.vehicle.country,
    fuelLabel: data.fuel.label,
  });
  const ogImageUrl = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${vehicleName} ownership cost` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ResultsPage() {
  return <ResultsClient />;
}
