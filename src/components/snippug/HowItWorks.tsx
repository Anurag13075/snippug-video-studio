import { useState } from "react";
import { Keycap } from "./Keycap";
import { useSound } from "./sound";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "1",
    title: "Drop a video",
    body: "Drag any MP4, WebM or MOV straight onto the studio — or grab one of the sample clips and try it in two seconds.",
    keys: ["Drop 📥"],
  },
  {
    n: "2",
    title: "Tap I and O",
    body: "Scrub the timeline and tap I where the good part starts and O where it ends. J and L nudge by a second.",
    keys: ["I", "O", "J", "L"],
  },
  {
    n: "3",
    title: "Export your Reel",
    body: "Pick 9:16 with a blurred backdrop, 1:1 or 16:9, then export. The clip renders on your machine and downloads instantly.",
    keys: ["Space", "⌘ + S"],
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const { play } = useSound();

  return (
    <section id="how-it-works" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          How it works
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Three taps. <span className="serif-accent text-cocoa">One Reel.</span>
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              role="button"
              tabIndex={0}
              onMouseEnter={() => {
                setActive(i);
                play("click");
              }}
              onFocus={() => setActive(i)}
              onClick={() => {
                setActive(i);
                play("pop");
              }}
              className={cn(
                "tactile pressable cursor-pointer rounded-3xl p-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === i && "-translate-y-1 border-tan shadow-pop",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] border-b-4 border-border bg-cream font-bold shadow-key transition-colors",
                    active === i && "bg-tan text-cocoa",
                  )}
                >
                  {step.n}
                </span>
                <div className="flex gap-1.5">
                  {step.keys.map((k) => (
                    <Keycap key={k} active={active === i}>
                      {k}
                    </Keycap>
                  ))}
                </div>
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              <div
                className={cn(
                  "mt-4 h-1 w-full origin-left rounded-full bg-tan transition-transform duration-300",
                  active === i ? "scale-x-100" : "scale-x-0",
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
