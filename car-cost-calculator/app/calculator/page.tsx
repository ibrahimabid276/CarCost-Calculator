import type { Metadata } from "next";
import CalculatorClient from "@/components/CalculatorClient";

export const metadata: Metadata = {
  title: "Car Cost Calculator — Monthly & Yearly Ownership Cost",
  description:
    "Enter your vehicle and driving habits to calculate your car's monthly and yearly ownership cost in Pakistan — fuel, maintenance, insurance, government charges, financing and cost per km.",
  alternates: { canonical: "/calculator" },
  openGraph: {
    title: "Car Cost Calculator — Monthly & Yearly Ownership Cost",
    description:
      "Calculate your car's real monthly and yearly ownership cost in Pakistan using current market data.",
    url: "/calculator",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://car-cost-calculator.site/" },
    { "@type": "ListItem", position: 2, name: "Calculator", item: "https://car-cost-calculator.site/calculator" },
  ],
};

export default function CalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CalculatorClient />
    </>
  );
}
