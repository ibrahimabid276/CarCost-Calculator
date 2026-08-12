"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/calculator", label: "Calculator" },
  { href: "/compare", label: "Compare" },
];

export default function Header() {
  const { user, ready, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSignOut() {
    signOut();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 pb-3 sm:px-6">
      {/* Floating glass panel */}
      <div className="mx-auto max-w-5xl rounded-2xl border border-black/5 bg-paper/75 shadow-soft backdrop-blur-lg transition-shadow">
        <div className="flex h-16 items-center justify-between px-5 sm:px-7">
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
            <Image
              src="/logo.png"
              alt="CarCost logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            CarCost
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                    active ? "bg-white/60 text-ink" : "text-ink/60 hover:bg-white/40 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop auth + CTA area */}
          <div className="hidden items-center gap-3 sm:flex">
            {!ready ? null : user ? (
              <>
                <span className="text-sm text-ink/70">
                  Hi, <span className="font-medium text-ink">{user.name.split(" ")[0]}</span>
                </span>
                <Link
                  href="/dashboard"
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/60 transition-colors duration-200 hover:bg-white/40 hover:text-ink"
                >
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="btn-secondary !px-4 !py-2 text-sm">
                  Sign Out
                </button>
              </>
            ) : null}
            <Link href="/calculator" className="btn-primary !px-5 !py-2.5 text-sm shadow-sm">
              Calculate My Car Cost →
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/30 transition-colors hover:bg-white/50 sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-ink transition-transform ${
                  menuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 bg-ink transition-opacity ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 bg-ink transition-transform ${
                  menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu panel — same glass treatment, floats just below the main bar */}
      {menuOpen && (
        <div className="mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border border-black/5 bg-paper/85 shadow-soft backdrop-blur-lg sm:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-white/60 text-ink" : "text-ink/80 hover:bg-white/40"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/calculator"
              onClick={() => setMenuOpen(false)}
              className="btn-primary mt-2 w-full justify-center"
            >
              Calculate My Car Cost →
            </Link>
            <div className="mt-2 border-t border-black/5 pt-3">
              {!ready ? null : user ? (
                <div className="flex flex-col gap-1">
                  <p className="px-3 py-1.5 text-sm text-ink/60">
                    Signed in as <span className="font-medium text-ink">{user.name}</span>
                  </p>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-white/40"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rust hover:bg-rust/5"
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
