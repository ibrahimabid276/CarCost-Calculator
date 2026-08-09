"use client";

// ---------------------------------------------------------------------------
// Lightweight, client-side, local-only authentication.
//
// There is intentionally NO server/database here — see the project README
// for why. Everything lives in the browser's localStorage:
//
//   carcost:users      -> array of registered accounts (password is hashed,
//                          never stored in plain text)
//   carcost:session     -> the currently signed-in session, if any
//
// LIMITATIONS (please read before relying on this for anything real):
//   - This is per-browser, per-device storage. Signing up on your phone and
//     signing in on your laptop will NOT work — there is no shared backend.
//   - Anyone with access to the browser's devtools can read localStorage.
//     The password itself is hashed (SHA-256 + a random per-user salt) so it
//     isn't stored in plain text, but this is NOT the same guarantee as a
//     real server-side auth system with HTTP-only cookies, rate limiting,
//     breach detection, etc.
//   - Clearing browser data / using a different browser / incognito mode
//     will lose the account.
//   - There is no email verification and no real password-reset flow.
// This is fine for an MVP / demo, but should not be described as
// production-grade, multi-device authentication.
// ---------------------------------------------------------------------------

export interface StoredUser {
  id: string;
  name: string;
  email: string; // stored lowercase
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Session {
  userId: string;
  token: string;
  createdAt: string;
}

const USERS_KEY = "carcost:users";
const SESSION_KEY = "carcost:session";

function isBrowser() {
  return typeof window !== "undefined";
}

// ---- storage helpers -------------------------------------------------

function readUsers(): StoredUser[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): Session | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  if (!isBrowser()) return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
  // Notify listeners in the SAME tab (the native "storage" event only fires
  // in OTHER tabs), so the header/UI updates immediately after sign in/out.
  if (isBrowser()) {
    window.dispatchEvent(new Event("carcost:auth-change"));
  }
}

// ---- crypto helpers ----------------------------------------------------

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  // A few rounds of SHA-256 over itself as a cheap, dependency-free stand-in
  // for a proper KDF (PBKDF2/bcrypt/argon2) — better than a single hash,
  // still not a substitute for real server-side password hashing.
  let digest = await crypto.subtle.digest("SHA-256", data);
  for (let i = 0; i < 2000; i++) {
    digest = await crypto.subtle.digest("SHA-256", digest);
  }
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---- validation ----------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
}

// ---- public API ----------------------------------------------------

function toPublic(u: StoredUser): PublicUser {
  return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ user?: PublicUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) return { error: "Name is required." };
  const emailErr = validateEmail(cleanEmail);
  if (emailErr) return { error: emailErr };
  const passErr = validatePassword(password);
  if (passErr) return { error: passErr };

  const users = readUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    return { error: "An account with this email already exists. Try signing in instead." };
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const newUser: StoredUser = {
    id: randomToken(),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, newUser]);
  writeSession({ userId: newUser.id, token: randomToken(), createdAt: new Date().toISOString() });

  return { user: toPublic(newUser) };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user?: PublicUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { error: "Enter your email and password." };
  }

  const users = readUsers();
  const user = users.find((u) => u.email === cleanEmail);
  if (!user) {
    return { error: "No account found with that email." };
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return { error: "Incorrect password." };
  }

  writeSession({ userId: user.id, token: randomToken(), createdAt: new Date().toISOString() });
  return { user: toPublic(user) };
}

export function signOut(): void {
  writeSession(null);
}

export function getCurrentUser(): PublicUser | null {
  const session = readSession();
  if (!session) return null;
  const users = readUsers();
  const user = users.find((u) => u.id === session.userId);
  return user ? toPublic(user) : null;
}
