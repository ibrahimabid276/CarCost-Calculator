import type { Metadata } from "next";
import LeaderboardClient from "@/components/LeaderboardClient";

export const metadata: Metadata = {
  title: "Cheapest Cars to Own in Pakistan",
  description:
    "A ranked comparison of the cheapest cars to own and run in Pakistan by monthly cost and cost per kilometer, based on current market data.",
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    title: "Cheapest Cars to Own in Pakistan",
    description: "See which cars cost the least to own and run per kilometer in Pakistan.",
    url: "/leaderboard",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://car-cost-calculator.site/" },
    { "@type": "ListItem", position: 2, name: "Cheapest Cars", item: "https://car-cost-calculator.site/leaderboard" },
  ],
};

export default function LeaderboardPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <LeaderboardClient />
    </>
  );
}
