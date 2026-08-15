import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What CarCost Calculator does and doesn't collect: account data stored only in your browser, anonymous analytics, and advertising.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — CarCost Calculator",
    description:
      "What CarCost Calculator does and doesn't collect: account data, analytics and advertising.",
    url: "/privacy",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://car-cost-calculator.site/" },
    { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://car-cost-calculator.site/privacy" },
  ],
};

export default function PrivacyPage() {
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
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          Privacy Policy
        </h1>

        <div className="card mt-8 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Calculator &amp; comparison inputs</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              The vehicle and driving details you enter on the{" "}
              <Link href="/calculator" className="text-moss underline">
                Calculator
              </Link>{" "}
              and{" "}
              <Link href="/compare" className="text-moss underline">
                Compare Cars
              </Link>{" "}
              pages are sent to our server only to run the cost calculation
              and are not linked to your identity or stored in a database.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Account data</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Sign-in on this site is local to your browser: your name,
              email and a salted, hashed password are stored in your
              browser&apos;s localStorage only. There is no account
              database on our servers — clearing your browser data or
              switching browsers or devices will remove the account, and we
              cannot see or recover it.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Analytics</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              We use Vercel Analytics to understand aggregate site usage,
              such as which pages are visited. This does not use cookies to
              track you individually across other sites.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Advertising</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              This site shows ads served by Google AdSense. Google and its
              partners may use cookies or similar technologies to serve ads
              based on your visits to this and other websites. You can
              review or adjust your ad settings through{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-moss underline"
              >
                Google Ads Settings
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Contact</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Questions about this policy can be sent to the site creator —
              see the{" "}
              <Link href="/about" className="text-moss underline">
                About the Creator
              </Link>{" "}
              page for contact details.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
