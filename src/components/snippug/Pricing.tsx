import { toast } from "sonner";
import { useSound } from "./sound";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "Unlimited clips, forever",
  "9:16, 1:1 and 16:9 exports",
  "All keyboard shortcuts",
  "Sample clips included",
  "Runs offline after first visit",
];

const PRO_FEATURES = [
  "No SnipPug tag on exports",
  "1080p export resolution",
  "Custom watermark text",
  "Batch queue for long videos",
  "Priority feature requests from Puggy",
];

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-leaf">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Pricing() {
  const { play } = useSound();

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Pricing
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Snip free. <span className="serif-accent text-cocoa">Go Pro when you're famous.</span>
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {/* Free */}
          <div className="tactile rounded-3xl p-7">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold">Free</h3>
              <div className="text-right">
                <div className="text-3xl font-bold tracking-tight">$0</div>
                <div className="text-xs text-muted-foreground">forever</div>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#studio"
              onClick={() => play("click")}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border-[1.5px] border-border bg-card text-sm font-semibold shadow-key pressable hover:bg-secondary"
            >
              Open the Studio
            </a>
          </div>

          {/* Pro */}
          <div className="tactile relative rounded-3xl border-cocoa/25 bg-tan/25 p-7">
            <span className="absolute -top-3 right-6 rounded-full border-[1.5px] border-border bg-cocoa px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-key">
              Creator license
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="text-right">
                <div className="text-3xl font-bold tracking-tight">
                  $5<span className="text-base font-semibold text-muted-foreground">/mo</span>
                </div>
                <div className="text-xs text-muted-foreground">or $29 once — keep it forever</div>
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
            <button
              type="button"
              onClick={() => {
                play("pop");
                toast.info("Pro checkout is coming soon. The Free studio is fully usable right now — go snip something!", {
                  duration: 5000,
                });
              }}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border-b-4 border-cocoa/40 bg-primary text-sm font-semibold text-primary-foreground shadow-key pressable hover:shadow-key-active active:translate-y-[3px] active:border-b-0"
            >
              Get Pro
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Cancel anytime · lifetime option never expires
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
