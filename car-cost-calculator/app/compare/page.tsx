import type { Metadata } from "next";
import CompareClient from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "Compare Cars — Ownership Cost Comparison",
  description:
    "Compare the real ownership cost of two or more cars side by side — fuel, maintenance, insurance, government charges and cost per kilometer, using current market data.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare Cars — Ownership Cost Comparison",
    description: "Compare the real monthly ownership cost of multiple cars side by side.",
    url: "/compare",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://car-cost-calculator.site/" },
    { "@type": "ListItem", position: 2, name: "Compare", item: "https://car-cost-calculator.site/compare" },
  ],
};

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CompareClient />
    </>
  );
}
