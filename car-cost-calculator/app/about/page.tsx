import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About the Creator — CarCost Calculator",
  description:
    "CarCost was created by Syed Muhammad Ibrahim, an AI Agent & Automation Engineer, to make the real cost of owning and running a car easy to understand.",
};

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.48v6.26ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.19-3.37-1.19-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.71.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

const LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/iamibrahimabid",
    icon: <LinkedInIcon />,
    external: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/ibrahimabid276",
    icon: <GitHubIcon />,
    external: true,
  },
  {
    label: "Email",
    href: "mailto:ibrahimabid276@gmail.com",
    icon: <MailIcon />,
    external: false,
  },
];

export default function AboutPage() {
  return (
    <main className="container-page py-14">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">
        ← Back home
      </Link>

      <div className="mt-6 max-w-2xl">
        <p className="text-sm tracking-wide uppercase text-moss font-medium mb-3">
          About the Creator
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          Syed Muhammad Ibrahim
        </h1>
        <p className="mt-1 text-ink/60">AI Agent &amp; Automation Engineer</p>

        <div className="card mt-8 p-6 sm:p-8">
          <p className="text-ink/70 leading-relaxed">
            CarCost was created by Syed Muhammad Ibrahim to make car ownership
            costs easier to understand. The goal is to help users estimate the
            real ongoing cost of owning and running a vehicle, including fuel,
            maintenance, insurance, government charges and financing.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:border-ink hover:text-ink"
              >
                {l.icon}
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
