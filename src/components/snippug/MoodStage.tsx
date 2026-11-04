import { useState } from "react";
import { MOODS, Puggy, type PugMood } from "./Puggy";
import { useSound } from "./sound";
import { cn } from "@/lib/utils";

const MOOD_ORDER: PugMood[] = [
  "snip",
  "love",
  "listening",
  "focus",
  "celebrate",
  "sleepy",
  "dizzy",
  "oops",
];

export function MoodStage() {
  const [mood, setMood] = useState<PugMood>("snip");
  const [bouncing, setBouncing] = useState(false);
  const { play } = useSound();
  const cfg = MOODS[mood];

  const pick = (m: PugMood) => {
    setMood(m);
    play(MOODS[m].sound);
    setBouncing(true);
    window.setTimeout(() => setBouncing(false), 600);
  };

  return (
    <section id="puggy" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Meet Puggy
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          He never loses a frame.{" "}
          <span className="serif-accent text-cocoa">He doesn't have to.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Puggy lives in your studio and reacts to every cut. Pick a mood and watch him work it.
        </p>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* stage */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="tactile rounded-4xl bg-gradient-to-b from-skywash/70 to-card p-8">
              <div className="mx-auto h-64 w-64 sm:h-72 sm:w-72">
                <Puggy mood={mood} bouncing={bouncing} className="h-full w-full" />
              </div>
              <div
                aria-hidden
                className="mx-auto h-4 w-44 rounded-[50%] bg-cocoa/15 blur-md"
              />
              <div
                key={cfg.bubble}
                className="mx-auto mt-6 max-w-xs rounded-2xl border-[1.5px] border-border bg-card px-4 py-3 text-center text-sm font-medium shadow-pop"
                style={{ animation: "bubble-in 0.3s ease-out" }}
              >
                {cfg.bubble}
              </div>
            </div>
          </div>

          {/* mood chips */}
          <div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {MOOD_ORDER.map((m) => {
                const mc = MOODS[m];
                const selected = m === mood;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => pick(m)}
                    className={cn(
                      "rounded-2xl border-[1.5px] border-b-4 px-3 py-4 text-center pressable",
                      selected
                        ? "translate-y-[2px] border-border bg-tan text-cocoa shadow-key-active"
                        : "border-border bg-card shadow-key hover:bg-secondary",
                    )}
                  >
                    <div className="text-2xl">{mc.emoji}</div>
                    <div className="mt-1.5 text-sm font-semibold">{mc.label}</div>
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Every mood has its own little sound. Flip on the speaker toggle up top and click
              through all eight.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
