import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  signInWithGoogle as supabaseSignInWithGoogle,
  signOut as supabaseSignOut,
  onAuthStateChange,
  type SupabaseUser,
  type SupabaseSession,
} from "@/lib/supabase";
import { isPurchased } from "@/lib/polar";

// ── Context types ────────────────────────────────────────────────────

interface AuthContextValue {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  loading: boolean;
  isPro: boolean;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isPro: false,
  signInWithGoogle: () => {},
  signOut: async () => {},
});

// ── Provider ─────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [pro, setPro] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const existing = await getSession();
        if (!cancelled) {
          setSession(existing);
          setPro(isPurchased());
        }
      } catch {
        /* no session */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setPro(isPurchased());
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(() => {
    supabaseSignInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await supabaseSignOut();
    setSession(null);
    setPro(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isPro: pro,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, pro, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
