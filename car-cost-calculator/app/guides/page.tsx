import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guidesContent";

export const metadata: Metadata = {
  title: "Car Cost Guides — Pakistan",
  description:
    "Plain-language guides on car ownership cost in Pakistan: how it's calculated, cost per kilometer, government charges and more.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Car Cost Guides — Pakistan",
    description: "Guides on understanding the real cost of owning and running a car in Pakistan.",
    url: "/guides",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://car-cost-calculator.site/" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://car-cost-calculator.site/guides" },
  ],
};

export default function GuidesIndexPage() {
  return (
    <main className="container-page py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">
        ← Back home
      </Link>
      <p className="mt-4 text-sm tracking-wide uppercase text-moss font-medium">Guides</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-display font-semibold">Car cost guides</h1>
      <p className="mt-3 text-ink/60 max-w-xl">
        Plain-language explainers on what car ownership actually costs in
        Pakistan, and how the numbers on this site are worked out.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card p-6 transition-shadow hover:shadow-soft">
            <h2 className="font-display text-lg font-semibold">{g.title}</h2>
            <p className="mt-2 text-sm text-ink/60">{g.description}</p>
            <span className="mt-4 inline-block text-sm text-moss font-medium">Read guide →</span>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-sm text-ink/50">
        Ready to see your own numbers?{" "}
        <Link href="/calculator" className="text-moss underline">
          Use the calculator
        </Link>{" "}
        or{" "}
        <Link href="/compare" className="text-moss underline">
          compare a few cars
        </Link>
        .
      </p>
    </main>
  );
}
