import Link from "next/link";
import Image from "next/image";

const QUICK_LINKS = [
  { href: "/calculator", label: "Calculator" },
  { href: "/compare", label: "Compare" },
  { href: "/leaderboard", label: "Cheapest Cars" },
  { href: "/guides", label: "Guides" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 dark:border-white/10">
      <div className="container-page py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
              <Image
                src="/logo.png"
                alt="CarCost logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
              CarCost
            </Link>
            <p className="mt-2 max-w-xs text-sm text-ink/50">
              Know what your car really costs to own — fuel, maintenance,
              insurance, government charges and financing, in one place.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {QUICK_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-ink/60 transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-black/5 pt-6 text-xs text-ink/40 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CarCost Calculator. All estimates are informational only.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/about" className="text-ink/40 underline-offset-2 transition-colors hover:text-ink/70 hover:underline">
              About the Creator
            </Link>
            <Link href="/methodology" className="text-ink/40 underline-offset-2 transition-colors hover:text-ink/70 hover:underline">
              Methodology
            </Link>
            <Link href="/privacy" className="text-ink/40 underline-offset-2 transition-colors hover:text-ink/70 hover:underline">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
