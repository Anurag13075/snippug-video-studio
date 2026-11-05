/**
 * Lightweight Supabase Auth client using REST API directly.
 * No @supabase/supabase-js dependency required.
 */
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ── Types ────────────────────────────────────────────────────────────

export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
    picture?: string;
  };
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: SupabaseUser;
}

type AuthChangeCallback = (
  event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED",
  session: SupabaseSession | null,
) => void;

const STORAGE_KEY = "snippug-auth-session";

// ── Helpers ──────────────────────────────────────────────────────────

function getBaseUrl(): string {
  return SUPABASE_URL || "";
}

function getAnonKey(): string {
  return SUPABASE_ANON_KEY || "";
}

function headers(accessToken?: string): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: getAnonKey(),
  };
  if (accessToken) {
    h["Authorization"] = `Bearer ${accessToken}`;
  }
  return h;
}

function saveSession(session: SupabaseSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable */
  }
}

function loadSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    return null;
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ── Client ───────────────────────────────────────────────────────────

const listeners = new Set<AuthChangeCallback>();

function notify(
  event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED",
  session: SupabaseSession | null,
): void {
  for (const cb of listeners) {
    try {
      cb(event, session);
    } catch {
      /* listener threw */
    }
  }
}

/**
 * Start Google OAuth sign-in via Supabase redirect flow.
 */
export function signInWithGoogle(): void {
  if (!SUPABASE_URL) {
    toast.error("VITE_SUPABASE_URL is not set. Please add it in your Vercel Project Settings → Environment Variables and redeploy.");
    return;
  }
  const redirectTo = `${window.location.origin}/auth/callback`;
  const url = `${getBaseUrl()}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  window.location.href = url;
}

/**
 * Parse OAuth tokens from the URL hash (after Supabase redirects back).
 * Returns the session if tokens are found, null otherwise.
 */
export async function handleAuthCallback(): Promise<SupabaseSession | null> {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const expiresIn = params.get("expires_in");

  if (!accessToken || !refreshToken) return null;

  const expiresAt = Date.now() + (Number(expiresIn) || 3600) * 1000;

  // Fetch user profile from Supabase
  const user = await getUser(accessToken);
  if (!user) return null;

  const session: SupabaseSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    user,
  };

  saveSession(session);
  notify("SIGNED_IN", session);

  return session;
}

/**
 * Get user info from Supabase using an access token.
 */
async function getUser(accessToken: string): Promise<SupabaseUser | null> {
  if (!SUPABASE_URL) return null;
  try {
    const res = await fetch(`${getBaseUrl()}/auth/v1/user`, {
      headers: headers(accessToken),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SupabaseUser;
    return data;
  } catch {
    return null;
  }
}

/**
 * Refresh the session using a refresh token.
 */
async function refreshSession(
  refreshToken: string,
): Promise<SupabaseSession | null> {
  if (!SUPABASE_URL) return null;
  try {
    const res = await fetch(`${getBaseUrl()}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: SupabaseUser;
    };

    const session: SupabaseSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
      user: data.user,
    };

    saveSession(session);
    notify("TOKEN_REFRESHED", session);
    return session;
  } catch {
    return null;
  }
}

/**
 * Get the current session, refreshing if expired.
 */
export async function getSession(): Promise<SupabaseSession | null> {
  const session = loadSession();
  if (!session) return null;

  // If token is expired or will expire within 60s, refresh
  if (session.expires_at < Date.now() + 60_000) {
    const refreshed = await refreshSession(session.refresh_token);
    if (!refreshed) {
      clearSession();
      notify("SIGNED_OUT", null);
      return null;
    }
    return refreshed;
  }

  return session;
}

/**
 * Sign the user out.
 */
export async function signOut(): Promise<void> {
  const session = loadSession();
  if (session && SUPABASE_URL) {
    try {
      await fetch(`${getBaseUrl()}/auth/v1/logout`, {
        method: "POST",
        headers: headers(session.access_token),
      });
    } catch {
      /* best-effort server logout */
    }
  }
  clearSession();
  notify("SIGNED_OUT", null);
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(callback: AuthChangeCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
