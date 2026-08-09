"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/signin");
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return <main className="container-page py-24 text-center text-ink/50">Loading…</main>;
  }

  return (
    <main className="container-page py-14">
      <h1 className="text-3xl font-display font-semibold">Welcome, {user.name}</h1>
      <p className="mt-2 text-ink/60">{user.email}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Link href="/calculator" className="card p-6 hover:border-moss/40">
          <p className="font-semibold">Run a new calculation</p>
          <p className="mt-1 text-sm text-ink/60">
            Estimate the true ownership cost of a car using current market data.
          </p>
        </Link>
        <Link href="/compare" className="card p-6 hover:border-moss/40">
          <p className="font-semibold">Compare cars</p>
          <p className="mt-1 text-sm text-ink/60">Line up two or three cars side by side.</p>
        </Link>
      </div>

      <div className="mt-10 card p-6">
        <p className="text-sm font-medium text-ink/70">Account</p>
        <p className="mt-1 text-xs text-ink/50">
          This account is stored locally in your browser. It won&apos;t be available on another
          device or browser, and clearing site data will remove it.
        </p>
        <button
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className="btn-secondary mt-4"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
