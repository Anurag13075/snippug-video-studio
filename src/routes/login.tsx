import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroHills from "@/assets/hero-hills.jpg";
import { SnipPugLogo } from "@/components/snippug/SnipPugLogo";
import { Puggy } from "@/components/snippug/Puggy";
import { useAuth } from "@/lib/auth";
import { useSound } from "@/components/snippug/sound";
import { handleAuthCallback } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SnipPug Studio" },
      {
        name: "description",
        content:
          "Sign in to SnipPug with Google to unlock cloud project sync, Pro creator features, and unlimited batch clipping.",
      },
    ],
  }),
  component: LoginPage,
});

export function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const { play } = useSound();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  // If already signed in or redirected with access token in hash, handle it
  useEffect(() => {
    if (user) {
      void navigate({ to: "/studio" });
      return;
    }

    if (window.location.hash.includes("access_token")) {
      setProcessing(true);
      void handleAuthCallback().then((session) => {
        if (session) {
          play("fanfare");
          void navigate({ to: "/studio" });
        } else {
          setProcessing(false);
        }
      });
    }
  }, [user, navigate, play]);

  const handleGoogleClick = () => {
    play("pop");
    setProcessing(true);
    signInWithGoogle();
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#14100c] px-4 py-12">
      {/* ── Background Landscape Backdrop ── */}
      <img
        src={heroHills}
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover opacity-90 scale-105 filter blur-[1px]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#14100c]/90"
      />

      {/* Subtle floating ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl"
      />

      {/* ── Main Centered Tactile Auth Card ── */}
      <div className="relative z-10 w-full max-w-md rounded-4xl border-[1.5px] border-white/20 bg-[#1e1914]/90 p-8 text-center text-[#F5E6CB] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-10">
        {/* Top Mascot Squircle Badge */}
        <div className="mx-auto w-fit">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <SnipPugLogo size="lg" showWordmark={false} />
          </Link>
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Welcome to <span className="serif-accent text-[#E6C395]">SnipPug</span>
        </h1>
        <p className="mx-auto mt-2 text-xs leading-relaxed text-[#A89F91] sm:text-sm">
          The frame-perfect viral video clipper. Sign in to save clips, sync your Pro status, or continue as guest.
        </p>

        {/* Status / Processing */}
        {processing ? (
          <div className="my-8 flex flex-col items-center justify-center gap-3 py-4">
            <div className="h-16 w-16">
              <Puggy mood="listening" bouncing className="h-full w-full" />
            </div>
            <p className="text-xs font-semibold text-[#E6C395] animate-pulse">
              Connecting with Google...
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3.5">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading || processing}
              className="pressable group relative flex h-13 w-full items-center justify-center gap-3 rounded-2xl border-[1.5px] border-b-4 border-[#3a2a1c] bg-white text-sm font-bold text-[#1a1612] shadow-key transition-all hover:bg-neutral-50 active:translate-y-1 active:border-b-[1.5px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-white/15" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#7A7163]">
                or jump right in
              </span>
              <div className="h-px flex-1 bg-white/15" />
            </div>

            {/* Guest Access Button */}
            <Link
              to="/studio"
              onClick={() => play("click")}
              className="pressable flex h-11 w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-white/20 bg-white/10 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <span>Try Studio as Guest (Free Forever)</span>
              <span>→</span>
            </Link>
          </div>
        )}

        {/* Feature Badges Strip */}
        <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/30 p-3 text-center">
          <div className="space-y-0.5">
            <div className="text-base">🔒</div>
            <div className="text-[10px] font-bold text-[#F5E6CB]">100% Private</div>
            <div className="text-[9px] text-[#7A7163]">On-device only</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-base">⚡</div>
            <div className="text-[10px] font-bold text-[#F5E6CB]">Zero Queues</div>
            <div className="text-[9px] text-[#7A7163]">No AI waiting</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-base">🐕</div>
            <div className="text-[10px] font-bold text-[#F5E6CB]">Puggy Inside</div>
            <div className="text-[9px] text-[#7A7163]">Never loses frame</div>
          </div>
        </div>

        {/* Footer info link */}
        <div className="mt-6 flex items-center justify-between text-[11px] text-[#7A7163]">
          <Link to="/" className="hover:text-[#F5E6CB]">
            ← Back to Home
          </Link>
          <span>Puggy retains all treats 🦴</span>
        </div>
      </div>
    </div>
  );
}
