import heroHills from "@/assets/hero-hills.jpg";
import { InteractivePuggy } from "./Puggy";
import { useSnipCount } from "./useSnipCount";
import { useSound } from "./sound";

function StatCard({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="tactile rounded-2xl px-5 py-4 text-center">
      <div className="text-lg font-bold tracking-tight">{children}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

export function Hero() {
  const count = useSnipCount();
  const { play } = useSound();

  return (
    <>
      <section
        id="top"
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-28 pt-24 text-center"
      >
        {/* full-bleed photo backdrop */}
        <img
          src={heroHills}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-background"
        />

        <div className="relative mx-auto max-w-4xl">
          {/* live counter */}
          <p className="text-[15px] font-medium text-white [text-shadow:0_1px_12px_rgba(10,25,10,0.55)]">
            Puggy has snipped{" "}
            <span className="font-bold">{count === null ? "…" : count.toLocaleString()}</span> clips
          </p>

          {/* app-icon mascot */}
          <div className="relative mx-auto mt-7 w-fit">
            <button
              type="button"
              aria-label="Click Puggy"
              className="pressable relative block h-24 w-24 overflow-hidden rounded-[26%] border-[1.5px] border-cocoa/25 bg-cream shadow-[0_22px_50px_-12px_rgba(15,30,15,0.5)] sm:h-28 sm:w-28"
            >
              <InteractivePuggy className="h-full w-full scale-[1.12] translate-y-[4%]" />
            </button>
          </div>
          <p className="mt-3 text-xs font-medium text-white/85 [text-shadow:0_1px_10px_rgba(10,25,10,0.55)]">
            Try it: click Puggy once, twice or three times.
          </p>

          {/* headline */}
          <h1 className="mt-6 text-5xl font-bold leading-[1.0] tracking-tight text-white [text-shadow:0_3px_28px_rgba(10,25,10,0.45)] sm:text-7xl md:text-8xl">
            Slice long videos.
            <br />
            <span className="serif-accent">Export viral clips.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/95 [text-shadow:0_1px_14px_rgba(10,25,10,0.55)] sm:text-lg">
            SnipPug marks the good part of your video and turns it into a Reel. Drop a file, tap{" "}
            <kbd className="rounded-md border border-white/40 bg-white/15 px-1.5 py-0.5 text-[0.8em] font-semibold">
              I
            </kbd>{" "}
            and{" "}
            <kbd className="rounded-md border border-white/40 bg-white/15 px-1.5 py-0.5 text-[0.8em] font-semibold">
              O
            </kbd>{" "}
            on the moment, export — without learning an editor.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#studio"
              onClick={() => play("click")}
              className="inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-cocoa shadow-[0_10px_30px_-8px_rgba(15,30,15,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-8px_rgba(15,30,15,0.55)] active:translate-y-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m10 8 6 4-6 4V8z" fill="currentColor" stroke="none" />
                <rect x="2.5" y="5" width="19" height="14" rx="3" />
              </svg>
              Open the Studio
            </a>
            <a
              href="#how-it-works"
              onClick={() => play("pop")}
              className="inline-flex h-13 items-center rounded-full border border-white/40 bg-white/15 px-7 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25"
            >
              How it works
            </a>
          </div>
          <p className="mt-4 text-sm font-medium text-white/85 [text-shadow:0_1px_10px_rgba(10,25,10,0.55)]">
            Free forever · works offline · your video never leaves your device
          </p>
        </div>
      </section>

      {/* stat strip, on paper like TapMac's stats */}
      <section className="px-4 pb-4 pt-10">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard sub="and counting. That's a lot of Reels.">
            {count === null ? "…" : count.toLocaleString()} snips
          </StatCard>
          <StatCard sub="your footage stays on your machine.">0 uploads</StatCard>
          <StatCard sub="the Free plan is the whole clipper.">$0 today</StatCard>
        </div>
      </section>
    </>
  );
}
