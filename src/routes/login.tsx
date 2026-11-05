import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroHills from "@/assets/hero-hills.jpg";
import { useAuth } from "@/lib/auth";
import { useSound } from "@/components/snippug/sound";
import { handleAuthCallback } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — SnipPug Studio" },
      {
        name: "description",
        content: "Sign in to SnipPug Studio with Google to access viral video clipping tools.",
      },
    ],
  }),
  component: LoginPage,
});

export function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const { play } = useSound();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  // If already signed in or redirected with access token in hash, handle it
  useEffect(() => {
    if (user) {
      void navigate({ to: "/app" });
      return;
    }

    if (window.location.hash.includes("access_token")) {
      setProcessing(true);
      void handleAuthCallback().then((session) => {
        if (session) {
          play("fanfare");
          void navigate({ to: "/app" });
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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    play("click");
    toast.info("Entering SnipPug Studio as guest creator...", { duration: 3000 });
    setTimeout(() => {
      void navigate({ to: "/app" });
    }, 600);
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-[1.15fr_1fr] bg-[#100f0e] text-[#EDEDED] select-none">
      {/* ── Left Side: Gorgeous Scenic Landscape & Editorial Quotes (Exact match) ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        {/* Full-bleed Photo Background */}
        <img
          src={heroHills}
          alt="SnipPug Landscape"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Vibrant Blue Sky Gradient Overlay (Exact match to reference image) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#1E5ED8]/95 via-[#1E5ED8]/75 to-transparent"
        />

        {/* Top Wordmark */}
        <div className="relative z-10">
          <Link
            to="/"
            className="font-mono text-xs font-bold tracking-[0.22em] text-white/90 hover:text-white"
          >
            SNIPPUG.AI
          </Link>
        </div>

        {/* Editorial Quote Box */}
        <div className="relative z-10 max-w-lg space-y-6 text-white pb-6">
          <blockquote className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
            “Built because never seen a good prodcut for reaction videos which is one of the biggest niche in social media"
          </blockquote>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
            The founder
          </p>

          <div className="h-px w-20 bg-white/30" />

          <div className="space-y-2 text-xs leading-relaxed text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            <p>“One upload and done, No need to open capcut .”</p>
            <p>“Every other tool butchered the cuts. This one just gets it right.”</p>
          </div>
        </div>

        <div className="relative z-10" />
      </div>

      {/* ── Right Side: Clean Dark Auth Card (Exact match to reference image) ── */}
      <div className="flex flex-1 flex-col justify-between bg-[#121110] p-6 sm:p-12 lg:p-16">
        {/* Top Right Social Proof Rating */}
        <div className="flex items-center justify-end gap-1.5 text-xs text-[#A89F91]">
        
        
        </div>

        {/* Center Auth Card Box */}
        <div className="mx-auto my-auto w-full max-w-sm rounded-2xl border border-white/10 bg-[#191715] p-7 text-left shadow-2xl sm:p-8">
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">
              Sign in to SnipPug
            </h1>
            <p className="mt-1 text-xs text-[#8E867A]">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* Continue with Google Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading || processing}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#221F1C] text-xs font-semibold text-white transition-all hover:border-white/20 hover:bg-[#2A2622] disabled:opacity-50"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" className="shrink-0">
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
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] text-[#7A7163]">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Email Input Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#C8C0B5]">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-10 w-full rounded-xl border border-white/10 bg-[#121110] px-3 text-xs text-white placeholder:text-[#5E5649] focus:border-white/30 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-white text-xs font-bold text-[#121110] transition-all hover:bg-neutral-100 active:translate-y-px"
            >
              <span>Continue</span>
              <span className="text-[10px]">▶</span>
            </button>
          </form>

          {/* Card Footer Badge */}
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <span className="text-[10px] text-[#6A6255]">
              Secured by <span className="font-semibold text-[#8E867A]">Supabase Auth</span>
            </span>
          </div>
        </div>

        {/* Bottom Switch to Guest & Legal Links */}
        <div className="mx-auto mt-6 w-full max-w-sm space-y-3 text-center text-xs text-[#8E867A]">
          <p>
            Want to try without account?{" "}
            <Link to="/app" className="font-semibold text-white hover:underline">
              Enter App as Guest
            </Link>
          </p>

          <div className="flex justify-center gap-4 text-[11px] text-[#6A6255]">
            <Link to="/" className="hover:text-[#A89F91]">Privacy Policy</Link>
            <span>·</span>
            <Link to="/" className="hover:text-[#A89F91]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
