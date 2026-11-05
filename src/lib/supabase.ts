/**
 * Lightweight Supabase Auth client using REST API directly.
 * No @supabase/supabase-js dependency required.
 */
import { toast } from "sonner";

// Primary Supabase Project URL (Auto-detected from your Supabase Dashboard)
const DEFAULT_SUPABASE_URL = "https://yzdwpdrfvjethozxxqaa.supabase.co";

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
  const envUrl = (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
    ""
  ).trim();
  return envUrl || DEFAULT_SUPABASE_URL;
}

function getAnonKey(): string {
  const envKey = (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
    ""
  ).trim();
  return envKey;
}

function headers(accessToken?: string): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = getAnonKey();
  if (key) {
    h["apikey"] = key;
  }
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
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    toast.error("Supabase URL is not configured.");
    return;
  }
  const redirectTo = `${window.location.origin}/auth/callback`;
  const url = `${baseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
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

  // Fetch user profile from Supabase with access token
  try {
    const res = await fetch(`${getBaseUrl()}/auth/v1/user`, {
      headers: headers(accessToken),
    });

    if (!res.ok) {
      console.warn("Failed to fetch user in auth callback:", res.status);
      return null;
    }

    const userData = (await res.json()) as {
      id: string;
      email: string;
      user_metadata?: {
        full_name?: string;
        avatar_url?: string;
        name?: string;
        picture?: string;
      };
    };

    const session: SupabaseSession = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      user: {
        id: userData.id,
        email: userData.email,
        user_metadata: userData.user_metadata ?? {},
      },
    };

    saveSession(session);
    notify("SIGNED_IN", session);
    return session;
  } catch (err) {
    console.warn("Error handling auth callback:", err);
    return null;
  }
}

/**
 * Get the current session, refreshing if expired.
 */
export async function getSession(): Promise<SupabaseSession | null> {
  const session = loadSession();
  if (!session) return null;

  // If token expires in less than 60s, refresh it
  if (Date.now() > session.expires_at - 60_000) {
    return refreshSession(session.refresh_token);
  }

  return session;
}

/**
 * Refresh an existing session using its refresh token.
 */
export async function refreshSession(
  refreshToken: string,
): Promise<SupabaseSession | null> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  try {
    const res = await fetch(
      `${baseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
    );

    if (!res.ok) {
      clearSession();
      notify("SIGNED_OUT", null);
      return null;
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: SupabaseUser;
    };

    const newSession: SupabaseSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in || 3600) * 1000,
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata ?? {},
      },
    };

    saveSession(newSession);
    notify("TOKEN_REFRESHED", newSession);
    return newSession;
  } catch (err) {
    console.warn("Failed to refresh session:", err);
    clearSession();
    notify("SIGNED_OUT", null);
    return null;
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const session = loadSession();
  if (session?.access_token) {
    try {
      await fetch(`${getBaseUrl()}/auth/v1/logout`, {
        method: "POST",
        headers: headers(session.access_token),
      });
    } catch {
      /* network error during logout */
    }
  }

  clearSession();
  notify("SIGNED_OUT", null);
}

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 */
export function onAuthStateChange(callback: AuthChangeCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
