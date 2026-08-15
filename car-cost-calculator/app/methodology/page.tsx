import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology — How We Calculate Car Ownership Cost",
  description:
    "How CarCost Calculator works out fuel, maintenance, insurance and government charges — live market data, fallback baselines, and the limits of the estimates.",
  alternates: { canonical: "/methodology" },
  openGraph: {
    title: "Methodology — How We Calculate Car Ownership Cost",
    description:
      "How CarCost Calculator sources and calculates fuel, maintenance, insurance and government charge estimates.",
    url: "/methodology",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://car-cost-calculator.site/" },
    { "@type": "ListItem", position: 2, name: "Methodology", item: "https://car-cost-calculator.site/methodology" },
  ],
};

export default function MethodologyPage() {
  return (
    <main className="container-page py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">
        ← Back home
      </Link>

      <div className="mt-6 max-w-2xl">
        <p className="text-sm tracking-wide uppercase text-moss font-medium mb-3">
          Methodology
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          How we calculate ownership cost
        </h1>
        <p className="mt-4 text-ink/70 leading-relaxed">
          This page explains where the numbers behind the{" "}
          <Link href="/calculator" className="text-moss underline">
            Calculator
          </Link>{" "}
          and{" "}
          <Link href="/compare" className="text-moss underline">
            Compare Cars
          </Link>{" "}
          tool come from, and what to keep in mind when reading them. For a
          plain-language walkthrough of the underlying concepts, see the{" "}
          <Link href="/guides/how-to-calculate-car-ownership-cost-pakistan" className="text-moss underline">
            Car Cost Guides
          </Link>
          .
        </p>

        <div className="card mt-8 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Live market data first</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              When you run a calculation, the tool searches the live web for
              current fuel prices, typical maintenance costs, insurance
              premiums and government charges for your specific make, model
              and city — rather than relying on numbers that go stale.
              Figures pulled from search results are validated against a
              plausible range for the selected currency before being used.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">When live data isn&apos;t available</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              If live search fails outright (a network or API issue), a
              currency-specific fallback baseline is used instead. If search
              succeeds but simply returns nothing usable for a value — for
              example, no reliable insurance quote for an unusual vehicle —
              that figure is marked as unavailable rather than silently
              replaced with a guess.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Registration vs. annual charges</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Government charges are split into a one-time registration fee
              and a recurring annual token/road tax, since combining them
              would overstate the ongoing cost of owning the car. See the{" "}
              <Link href="/guides/car-registration-government-charges-pakistan" className="text-moss underline">
                government charges guide
              </Link>{" "}
              for the full breakdown.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Limits of the estimates</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Every figure here is an estimate built from user-provided
              inputs and available market data. Actual costs vary by fuel
              price movements, driving conditions, the workshop or insurer
              you use, and local government policy. Sources are shown
              alongside each result so you can judge them yourself rather
              than take them on faith.
            </p>
          </div>
        </div>

        <p className="mt-10 text-sm text-ink/50">
          Want the full picture?{" "}
          <Link href="/guides" className="text-moss underline">
            Read the Car Cost Guides
          </Link>{" "}
          or{" "}
          <Link href="/calculator" className="text-moss underline">
            try the Calculator
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
