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
    <header className="sticky top-0 z-50 border-b border-black/5 bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
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
        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href ? "text-ink" : "text-ink/60 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth area */}
        <div className="hidden items-center gap-3 sm:flex">
          {!ready ? null : user ? (
            <>
              <span className="text-sm text-ink/70">
                Hi, <span className="font-medium text-ink">{user.name.split(" ")[0]}</span>
              </span>
              <Link href="/dashboard" className="text-sm font-medium text-ink/70 hover:text-ink">
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="btn-secondary !px-4 !py-2 text-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-sm font-medium text-ink/70 hover:text-ink">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary !px-4 !py-2 text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 sm:hidden"
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

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-black/5 bg-paper sm:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-black/5 pt-3">
              {!ready ? null : user ? (
                <div className="flex flex-col gap-1">
                  <p className="px-3 py-1.5 text-sm text-ink/60">
                    Signed in as <span className="font-medium text-ink">{user.name}</span>
                  </p>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
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
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/signin"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary mt-1 w-full justify-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
