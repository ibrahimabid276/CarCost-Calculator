import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
      (process.env.NODE_ENV === "production" ? "https://car-cost-calculator.site" : "http://localhost:3000")
  ),
  title: {
    default: "Car Cost Calculator Pakistan | Monthly & Yearly Ownership Cost",
    template: "%s | CarCost Calculator",
  },
  description:
    "Calculate your car's monthly, yearly and long-term ownership cost in Pakistan, including fuel, maintenance, insurance, government charges, financing and cost per km.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "CarCost Calculator",
    type: "website",
    locale: "en_PK",
    title: "Car Cost Calculator Pakistan | Monthly & Yearly Ownership Cost",
    description:
      "Calculate your car's true monthly, yearly and long-term ownership cost — fuel, maintenance, insurance, government charges, financing and cost per km.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Car Cost Calculator Pakistan | Monthly & Yearly Ownership Cost",
    description:
      "Calculate your car's true monthly, yearly and long-term ownership cost — fuel, maintenance, insurance, government charges, financing and cost per km.",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CarCost Calculator",
  url: "https://car-cost-calculator.site",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://car-cost-calculator.site/calculator?make={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CarCost Calculator",
  url: "https://car-cost-calculator.site",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any (web-based)",
  description:
    "Calculate the real monthly, yearly and long-term cost of owning a car in Pakistan — fuel, maintenance, insurance, government charges, financing and cost per kilometer.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-paper text-ink font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3210105391003754"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <AuthProvider>
          <ThemeProvider>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
