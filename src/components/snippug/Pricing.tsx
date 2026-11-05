import { toast } from "sonner";
import { KeycapStatic } from "./Keycap";
import { useSound } from "./sound";

const PRO_FEATURES = [
  "Every feature unlocked from day one",
  "No SnipPug tag on exports — or your own watermark",
  "1080p export resolution",
  "Batch queue: snip a whole video, export all at once",
  "Lifetime updates included",
  "Money back within 5 days",
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
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Pricing
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Pay once. <span className="serif-accent text-cocoa">Keep it.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
          The studio is free, with no account. Pro is one payment for creators who ship every day —
          no subscription.
        </p>

        <div className="mx-auto mt-10 max-w-lg">
          <div className="tactile relative rounded-3xl p-7">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold">SnipPug Pro</h3>
              <div className="text-right">
                <div className="text-3xl font-bold tracking-tight">
                  $19 <span className="text-base font-semibold text-muted-foreground line-through">later $29</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  one-time payment · no subscription
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border-[1.5px] border-border bg-secondary/70 p-4">
              <div className="text-sm font-bold">50% off in India</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Buying from India? Enter this code at checkout to pay half.
              </p>
              <div className="mt-2">
                <KeycapStatic className="min-w-0 px-3 tracking-[0.12em]">EXCLUSIVE50</KeycapStatic>
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
                toast.info("Pro checkout opens at launch. The free studio is fully usable right now — go snip something!", {
                  duration: 5000,
                });
              }}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-key transition-all hover:shadow-key-active active:translate-y-[2px]"
            >
              Get Pro · $19
            </button>
            <a
              href="#studio"
              onClick={() => play("click")}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border-[1.5px] border-border bg-card text-sm font-semibold shadow-key pressable hover:bg-secondary"
            >
              Use it free first
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              License delivered by email · keep it forever
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
