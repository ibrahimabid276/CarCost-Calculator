"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { validateEmail, validatePassword } from "@/lib/auth";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please enter your name.");
    const emailErr = validateEmail(email);
    if (emailErr) return setError(emailErr);
    const passErr = validatePassword(password);
    if (passErr) return setError(passErr);
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setSubmitting(true);
    const res = await signUp(name, email, password);
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="container-page py-16 sm:py-24">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-display font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-ink/60">
          Stored locally in this browser — no server, no database.{" "}
          <Link href="/signin" className="text-moss underline underline-offset-2">
            Already have an account? Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="card mt-8 space-y-5 p-6 sm:p-8">
          <div>
            <label className="field-label">Name</label>
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="field-input pr-16"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink/50 hover:text-ink"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="field-label">Confirm password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="field-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? "Creating account…" : "Sign Up"}
          </button>
        </form>
      </div>
    </main>
  );
}
