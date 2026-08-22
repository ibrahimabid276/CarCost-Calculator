import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for CarCost Calculator: what the tool is for, the informational nature of its estimates, and your responsibilities as a user.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Use — CarCost Calculator",
    description: "Terms of use for CarCost Calculator.",
    url: "/terms",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://car-cost-calculator.site/" },
    { "@type": "ListItem", position: 2, name: "Terms of Use", item: "https://car-cost-calculator.site/terms" },
  ],
};

export default function TermsPage() {
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
        <p className="text-sm tracking-wide uppercase text-moss font-medium mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">Terms of Use</h1>
        <p className="mt-2 text-sm text-ink/50">Last updated: August 2026</p>

        <div className="card mt-8 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold">What CarCost Calculator is</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              CarCost Calculator is a free tool for estimating the cost of
              owning and running a vehicle in Pakistan, based on the details
              you provide and current market information. It is an
              informational tool, not financial, legal, insurance or tax
              advice.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Estimates, not guarantees</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Every figure this site produces — fuel cost, maintenance,
              insurance, government charges, financing and totals — is an
              estimate. Real-world prices, taxes and quotes vary by provider,
              location, timing and individual circumstances. Where a value is
              sourced from a web search, we show the source; where no
              reliable figure could be found, we say so explicitly rather
              than inventing one. You should independently verify any figure
              before making a purchase or financial decision based on it.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">No warranty</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              This site is provided &quot;as is&quot;, without warranty of any
              kind, express or implied, including but not limited to
              accuracy, completeness or fitness for a particular purpose. Use
              of this site and reliance on any of its estimates is at your
              own risk.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Your account</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              If you create an account, it is stored locally in your own
              browser (see our{" "}
              <Link href="/privacy" className="text-moss underline">
                Privacy Policy
              </Link>{" "}
              for details). You are responsible for keeping your own device
              and browser secure.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Acceptable use</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Please don&apos;t attempt to abuse, scrape at scale, or
              interfere with this site&apos;s normal operation, including the
              search and calculation infrastructure that keeps estimates
              current for everyone.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Advertising</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              This site displays advertising served by Google AdSense. See
              our{" "}
              <Link href="/privacy" className="text-moss underline">
                Privacy Policy
              </Link>{" "}
              for how that works.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Changes</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              These terms may be updated from time to time as the site
              evolves. Continued use of the site after a change means you
              accept the updated terms.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Contact</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Questions about these terms can be sent via the details on the{" "}
              <Link href="/about" className="text-moss underline">
                About the Creator
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
