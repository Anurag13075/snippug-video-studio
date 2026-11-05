import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { createCheckoutUrl } from "@/lib/polar";
import { KeycapStatic } from "./Keycap";
import { useSound } from "./sound";

const PRO_FEATURES = [
  "Every feature unlocked from day one",
  "No SnipPug tag on exports — or your own watermark",
  "1080p FHD crystal-clear export resolution",
  "Batch queue: snip an entire podcast/stream, export all at once",
  "Viral kinetic caption presets (Hormozi, Editorial, Typewriter, Neon)",
  "Meme soundboard drops with instant procedural audio",
  "Lifetime updates included forever",
  "Money back within 5 days",
];

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-leaf"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Pricing() {
  const { play } = useSound();
  const { user, isPro } = useAuth();

  const handleCheckout = () => {
    play("pop");
    const checkoutUrl = createCheckoutUrl(user?.email);
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    toast.info("Opening Polar checkout for SnipPug Pro ($4)...", {
      duration: 4000,
    });
  };

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Pricing
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Pay once. <span className="serif-accent text-cocoa">Keep it forever.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
          The studio is free forever. Pro is a single $4 payment for short-form creators who want 1080p, no watermarks, and batch clipping — no recurring subscription.
        </p>

        <div className="mx-auto mt-10 max-w-lg">
          <div className="tactile relative rounded-3xl p-7">
            <div className="flex items-baseline justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">SnipPug Pro</h3>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                  ONE-TIME PURCHASE
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tracking-tight">
                  $4 <span className="text-base font-semibold text-muted-foreground line-through">$29</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  single $4 payment · keep it for life
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border-[1.5px] border-border bg-secondary/70 p-4">
              <div className="text-sm font-bold">Early Creator Special — 86% Off</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Get full lifetime access to the entire studio suite for just four dollars via Polar secure checkout.
              </p>
              <div className="mt-2">
                <KeycapStatic className="min-w-0 px-3 tracking-[0.12em]">
                  LIFETIME4
                </KeycapStatic>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <p className="text-sm font-bold text-emerald-800">
                  🎉 You already own SnipPug Pro!
                </p>
                <Link
                  to="/app"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-key"
                >
                  Enter App
                </Link>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-key transition-all hover:shadow-key-active active:translate-y-[2px]"
                >
                  <span>Get Pro Lifetime Access · $4</span>
                  <span className="text-xs font-normal opacity-80">(Polar)</span>
                </button>
                <Link
                  to="/app"
                  onClick={() => play("click")}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border-[1.5px] border-border bg-card text-sm font-semibold shadow-key pressable hover:bg-secondary"
                >
                  Use Free App First
                </Link>
              </>
            )}

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Instant license unlock · processed securely by Polar Payments
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
