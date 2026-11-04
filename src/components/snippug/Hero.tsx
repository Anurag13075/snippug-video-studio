import { InteractivePuggy } from "./Puggy";
import { useSnipCount } from "./useSnipCount";
import { KeycapStatic } from "./Keycap";
import { useSound } from "./sound";

function StatCard({
  children,
  sub,
  className,
}: {
  children: React.ReactNode;
  sub: string;
  className?: string;
}) {
  return (
    <div
      className={`tactile rounded-2xl px-5 py-4 text-center pressable ${className ?? ""}`}
    >
      <div className="text-lg font-bold tracking-tight">{children}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

export function Hero() {
  const count = useSnipCount();
  const { play } = useSound();

  return (
    <section id="top" className="grain-bg relative overflow-hidden px-4 pb-16 pt-12 sm:pt-16">
      {/* soft warm blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-140px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-skywash opacity-60 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[8%] h-[260px] w-[260px] rounded-full bg-tan opacity-40 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[6%] h-[220px] w-[220px] rounded-full bg-blush opacity-30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        {/* live stats badge */}
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border-[1.5px] border-border bg-card px-4 py-1.5 text-sm shadow-key">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-leaf" style={{ animation: "soft-pulse 2s ease-in-out infinite" }} />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
          </span>
          <span className="text-muted-foreground">
            Puggy has snipped{" "}
            <span className="font-bold text-foreground">{count === null ? "…" : count.toLocaleString()}</span> clips
          </span>
        </div>

        {/* mascot stage */}
        <div className="relative mx-auto mt-8 h-48 w-48 sm:h-56 sm:w-56">
          <div className="pug-anim-float h-full w-full">
            <InteractivePuggy className="h-full w-full" />
          </div>
          <div
            aria-hidden
            className="absolute bottom-[-14px] left-1/2 h-5 w-40 -translate-x-1/2 rounded-[50%] bg-cocoa/15 blur-md"
          />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Try it: click Puggy once. He can take it.
        </p>

        {/* headline */}
        <h1 className="mt-4 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
          Slice long videos.
          <br />
          <span className="serif-accent text-cocoa">Export viral clips.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          SnipPug is a tiny clipper that runs right in your browser. Drop a video, tap{" "}
          <KeycapStatic>I</KeycapStatic> and <KeycapStatic>O</KeycapStatic> to mark the good part,
          export a 9:16 Reel. No AI, no uploads, no waiting.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#studio"
            onClick={() => play("click")}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border-b-4 border-cocoa/40 bg-primary px-7 text-base font-semibold text-primary-foreground shadow-key transition-all hover:shadow-key-active active:translate-y-[3px] active:border-b-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
            </svg>
            Open the Studio
          </a>
          <a
            href="#how-it-works"
            onClick={() => play("pop")}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border-[1.5px] border-border bg-card px-6 text-base font-semibold shadow-key transition-all hover:shadow-key-active active:translate-y-[3px]"
          >
            How it works
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Free forever · works offline · your video never leaves your device
        </p>

        {/* tactile stat cards */}
        <div className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard sub="and counting. That's a lot of Reels.">
            {count === null ? "…" : count.toLocaleString()} snips
          </StatCard>
          <StatCard sub="your footage stays on your machine.">0 uploads</StatCard>
          <StatCard sub="the Free plan is the whole clipper.">$0 today</StatCard>
        </div>
      </div>
    </section>
  );
}
