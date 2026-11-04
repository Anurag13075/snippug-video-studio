import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useSound, type SoundName } from "./sound";

export type PugMood =
  | "snip"
  | "love"
  | "listening"
  | "focus"
  | "celebrate"
  | "sleepy"
  | "dizzy"
  | "oops";

interface MoodConfig {
  label: string;
  emoji: string;
  sound: SoundName;
  bubble: string;
  eyes: "open" | "hearts" | "closed" | "dizzy" | "wide";
  mouth: "smile" | "open" | "o" | "flat" | "wavy";
  brows: "none" | "angled" | "raised";
  extras: Array<"headphones" | "hearts" | "zzz" | "confetti" | "sweat" | "blush" | "scissors">;
}

export const MOODS: Record<PugMood, MoodConfig> = {
  snip: {
    label: "Snip",
    emoji: "✂️",
    sound: "snip",
    bubble: "Snip snip! Frame-perfect, every time.",
    eyes: "open",
    mouth: "open",
    brows: "angled",
    extras: ["scissors"],
  },
  love: {
    label: "Love",
    emoji: "❤️",
    sound: "boop",
    bubble: "That take? Chef's kiss. Keep it.",
    eyes: "hearts",
    mouth: "smile",
    brows: "none",
    extras: ["hearts", "blush"],
  },
  listening: {
    label: "Listening",
    emoji: "🎧",
    sound: "pop",
    bubble: "I'm all ears. Roll the tape.",
    eyes: "open",
    mouth: "flat",
    brows: "raised",
    extras: ["headphones"],
  },
  focus: {
    label: "Focus",
    emoji: "🎯",
    sound: "click",
    bubble: "Locked in. Not a frame lost.",
    eyes: "open",
    mouth: "flat",
    brows: "angled",
    extras: [],
  },
  celebrate: {
    label: "Celebrate",
    emoji: "🎉",
    sound: "fanfare",
    bubble: "Exported! Go ship it!",
    eyes: "open",
    mouth: "open",
    brows: "raised",
    extras: ["confetti", "blush"],
  },
  sleepy: {
    label: "Sleepy",
    emoji: "💤",
    sound: "zzz",
    bubble: "Zzz... five more minutes...",
    eyes: "closed",
    mouth: "flat",
    brows: "none",
    extras: ["zzz"],
  },
  dizzy: {
    label: "Dizzy",
    emoji: "🌀",
    sound: "wobble",
    bubble: "Whoa. How many cuts WAS that?",
    eyes: "dizzy",
    mouth: "wavy",
    brows: "raised",
    extras: [],
  },
  oops: {
    label: "Oops",
    emoji: "🐾",
    sound: "sad",
    bubble: "Wrong side of the timeline. My bad.",
    eyes: "wide",
    mouth: "o",
    brows: "raised",
    extras: ["sweat"],
  },
};

const INK = "#3a2a1c";
const FAWN = "#e6c395";
const FAWN_SHADE = "#d9b183";
const MUZZLE = "#f5e6cb";
const COCOA = "#4a3120";

function Eyes({ kind }: { kind: MoodConfig["eyes"] }) {
  const white = (
    <>
      <circle cx="88" cy="106" r="13.5" fill="#fffdf7" stroke={INK} strokeWidth="3" />
      <circle cx="152" cy="106" r="13.5" fill="#fffdf7" stroke={INK} strokeWidth="3" />
    </>
  );
  if (kind === "closed") {
    return (
      <g className="pug-anim-blink" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M76 108 q12 8 24 0" />
        <path d="M140 108 q12 8 24 0" />
      </g>
    );
  }
  if (kind === "hearts") {
    return (
      <g fill="#e0526e" stroke={INK} strokeWidth="3">
        {([
          [88, 106],
          [152, 106],
        ] as [number, number][]).map(([cx, cy], i) => (
          <path
            key={i}
            d={`M${cx} ${cy + 10} C ${cx - 16} ${cy - 2}, ${cx - 8} ${cy - 14}, ${cx} ${cy - 5} C ${
              cx + 8
            } ${cy - 14}, ${cx + 16} ${cy - 2}, ${cx} ${cy + 10} Z`}
          />
        ))}
      </g>
    );
  }
  if (kind === "dizzy") {
    return (
      <g stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round">
        {[88, 152].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="106" r="12.5" fill="#fffdf7" stroke={INK} strokeWidth="3" />
            <path
              d={`M${cx} 106 m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.5 3.5 0 1 1 3.5 -3.5 a6.5 6.5 0 1 1 -6.5 6.5 a9.5 9.5 0 1 1 9.5 -9.5`}
            />
          </g>
        ))}
      </g>
    );
  }
  return (
    <g className="pug-anim-blink">
      {white}
      {kind === "wide" ? (
        <>
          <circle cx="88" cy="106" r="4.5" fill={INK} />
          <circle cx="152" cy="106" r="4.5" fill={INK} />
        </>
      ) : (
        <>
          <circle cx="90" cy="107" r="6" fill={INK} />
          <circle cx="154" cy="107" r="6" fill={INK} />
          <circle cx="92.5" cy="104.5" r="2" fill="#fffdf7" />
          <circle cx="156.5" cy="104.5" r="2" fill="#fffdf7" />
        </>
      )}
    </g>
  );
}

function Mouth({ kind }: { kind: MoodConfig["mouth"] }) {
  const stroke = { stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const, fill: "none" };
  if (kind === "smile") return <path d="M106 146 q14 10 28 0" {...stroke} />;
  if (kind === "open")
    return (
      <g>
        <path d="M103 143 q17 18 34 0 q-4 14 -17 14 q-13 0 -17 -14 Z" fill="#7c3a34" stroke={INK} strokeWidth="3.5" />
        <ellipse cx="120" cy="155" rx="8" ry="5.5" fill="#ef8896" stroke={INK} strokeWidth="2.5" />
      </g>
    );
  if (kind === "o") return <ellipse cx="120" cy="150" rx="7.5" ry="9" fill="#7c3a34" stroke={INK} strokeWidth="3.5" />;
  if (kind === "wavy")
    return (
      <path d="M104 149 q8 -7 16 0 q8 7 16 0" {...stroke} />
    );
  return <path d="M106 149 q14 4 28 0" {...stroke} />;
}

function Extras({ items }: { items: MoodConfig["extras"] }) {
  return (
    <>
      {items.includes("headphones") && (
        <g>
          <path d="M52 96 C 52 44, 188 44, 188 96" fill="none" stroke={COCOA} strokeWidth="9" strokeLinecap="round" />
          <rect x="36" y="88" width="26" height="40" rx="10" fill={COCOA} stroke={INK} strokeWidth="3" />
          <rect x="178" y="88" width="26" height="40" rx="10" fill={COCOA} stroke={INK} strokeWidth="3" />
        </g>
      )}
      {items.includes("blush") && (
        <g fill="#eb9aa6" opacity="0.75">
          <ellipse cx="66" cy="132" rx="11" ry="7" />
          <ellipse cx="174" cy="132" rx="11" ry="7" />
        </g>
      )}
      {items.includes("sweat") && (
        <path d="M198 62 q8 12 0 18 q-9 -6 0 -18 Z" fill="#8fc3e8" stroke={INK} strokeWidth="2.5" />
      )}
      {items.includes("hearts") &&
        [
          { x: 190, y: 58, s: 1, d: "0s", hx: "14px" },
          { x: 34, y: 74, s: 0.7, d: "0.5s", hx: "-10px" },
          { x: 206, y: 96, s: 0.55, d: "1s", hx: "8px" },
        ].map((h, i) => (
          <path
            key={i}
            className="pug-heart"
            style={{ animation: `pug-heart 1.6s ${h.d} ease-out infinite`, ["--hx" as string]: h.hx }}
            fill="#e0526e"
            stroke={INK}
            strokeWidth="2"
            d={`M0 -6 C -10 -13, -4 -20, 0 -14 C 4 -20, 10 -13, 0 -6 Z`}
            transform={`translate(${h.x} ${h.y}) scale(${h.s})`}
          />
        ))}
      {items.includes("zzz") &&
        [
          { x: 196, y: 70, s: 1, d: "0s" },
          { x: 210, y: 46, s: 0.75, d: "0.7s" },
        ].map((z, i) => (
          <text
            key={i}
            className="pug-z"
            style={{ animation: `pug-z 2.4s ${z.d} ease-in-out infinite` }}
            x={z.x}
            y={z.y}
            fontSize={22 * z.s}
            fontWeight="700"
            fill={COCOA}
            fontFamily="Instrument Sans, sans-serif"
          >
            z
          </text>
        ))}
      {items.includes("confetti") &&
        [
          { x: 40, y: 40, c: "#e0526e", d: "0s", cx: "-10px" },
          { x: 200, y: 36, c: "#5b9bd5", d: "0.2s", cx: "12px" },
          { x: 26, y: 96, c: "#f0b429", d: "0.4s", cx: "-14px" },
          { x: 214, y: 100, c: "#69b578", d: "0.6s", cx: "10px" },
          { x: 60, y: 22, c: "#9a6bd0", d: "0.8s", cx: "6px" },
        ].map((p, i) => (
          <rect
            key={i}
            className="pug-confetti"
            style={{ animation: `pug-confetti 1.4s ${p.d} ease-in infinite`, ["--cx" as string]: p.cx }}
            x={p.x}
            y={p.y}
            width="9"
            height="9"
            rx="2"
            fill={p.c}
          />
        ))}
      {items.includes("scissors") && (
        <g transform="translate(196 122) rotate(14)">
          <circle cx="0" cy="14" r="6" fill="none" stroke={INK} strokeWidth="3.5" />
          <circle cx="0" cy="30" r="6" fill="none" stroke={INK} strokeWidth="3.5" />
          <path d="M5 12 L30 2 M5 32 L30 42" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M30 2 L44 14 M30 42 L44 30" stroke="#9aa3ad" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
    </>
  );
}

export function Puggy({
  mood = "snip",
  className,
  onClick,
  bouncing,
  wobbling,
  interactive = false,
}: {
  mood?: PugMood;
  className?: string;
  onClick?: () => void;
  bouncing?: boolean;
  wobbling?: boolean;
  interactive?: boolean;
}) {
  const cfg = MOODS[mood];
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={interactive ? onClick : undefined}
      aria-label={interactive ? `Puggy the pug, feeling ${cfg.label.toLowerCase()}. Click him!` : undefined}
      className={cn(
        "block",
        interactive && "cursor-pointer pressable focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-[2.5rem]",
        className,
      )}
    >
      <svg
        viewBox="0 0 240 240"
        className={cn("h-full w-full", bouncing && "pug-anim-bounce", mood === "dizzy" && wobbling !== false && "pug-anim-wobble")}
        role="img"
        aria-hidden="true"
      >
        {/* ground shadow */}
        <ellipse cx="120" cy="222" rx="66" ry="10" fill={INK} opacity="0.12" />
        <g className={cn(!bouncing && mood !== "sleepy" && "pug-anim-float")}>
          {/* ears behind head */}
          <path
            className="pug-anim-ear-l"
            d="M56 62 C 26 48, 18 116, 40 142 C 56 160, 80 146, 78 114 C 77 96, 70 72, 56 62 Z"
            fill={COCOA}
            stroke={INK}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            className="pug-anim-ear-r"
            d="M184 62 C 214 48, 222 116, 200 142 C 184 160, 160 146, 162 114 C 163 96, 170 72, 184 62 Z"
            fill={COCOA}
            stroke={INK}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* head */}
          <ellipse cx="120" cy="118" rx="80" ry="72" fill={FAWN} stroke={INK} strokeWidth="5" />
          <path d="M42 96 C 60 78, 96 68, 120 68" fill="none" stroke={FAWN_SHADE} strokeWidth="4" opacity="0.6" />
          {/* forehead wrinkles */}
          <g stroke={FAWN_SHADE} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M104 62 q8 -5 16 0" />
            <path d="M100 72 q10 -6 20 0" />
          </g>
          {/* muzzle patch */}
          <ellipse cx="120" cy="142" rx="45" ry="35" fill={MUZZLE} stroke={FAWN_SHADE} strokeWidth="3" />
          {/* brows */}
          {cfg.brows === "angled" && (
            <g stroke={INK} strokeWidth="4.5" strokeLinecap="round">
              <path d="M76 84 L98 90" />
              <path d="M164 84 L142 90" />
            </g>
          )}
          {cfg.brows === "raised" && (
            <g stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M78 82 q10 -8 20 -2" />
              <path d="M162 82 q-10 -8 -20 -2" />
            </g>
          )}
          <Eyes kind={cfg.eyes} />
          {/* nose */}
          <path
            d="M111 122 h18 q5 0 5 5 q-3 10 -14 10 q-11 0 -14 -10 q0 -5 5 -5 Z"
            fill={INK}
          />
          <Mouth kind={cfg.mouth} />
          <Extras items={cfg.extras} />
        </g>
      </svg>
    </Tag>
  );
}

/** Clickable mascot that cycles a surprise mood on click. */
export function InteractivePuggy({
  defaultMood = "snip",
  className,
  onMoodChange,
}: {
  defaultMood?: PugMood;
  className?: string;
  onMoodChange?: (mood: PugMood) => void;
}) {
  const [mood, setMood] = useState<PugMood>(defaultMood);
  const [bouncing, setBouncing] = useState(false);
  const [bubble, setBubble] = useState<string | null>("Ooh! Do that again.");
  const timer = useRef<number | null>(null);
  const { play } = useSound();

  useEffect(() => {
    const id = window.setInterval(() => setMood(defaultMood), 2600);
    return () => window.clearInterval(id);
  }, [defaultMood]);

  const handleClick = useCallback(() => {
    const keys = Object.keys(MOODS) as PugMood[];
    const next = keys[Math.floor(Math.random() * keys.length)] ?? "snip";
    setMood(next);
    onMoodChange?.(next);
    setBouncing(true);
    setBubble(MOODS[next].bubble);
    play(MOODS[next].sound);
    play("bounce");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setBouncing(false);
      setBubble(null);
    }, 2200);
  }, [onMoodChange, play]);

  return (
    <div className={cn("relative", className)}>
      {bubble && (
        <div
          key={bubble}
          className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-2xl border-[1.5px] border-border bg-card px-4 py-2 text-center text-sm font-medium shadow-pop"
          style={{ animation: "bubble-in 0.3s ease-out" }}
        >
          {bubble}
          <span className="absolute left-1/2 top-full -mt-[7px] -translate-x-1/2 border-x-[8px] border-t-[9px] border-x-transparent border-t-border" />
        </div>
      )}
      <Puggy mood={mood} interactive onClick={handleClick} bouncing={bouncing} className="h-full w-full" />
    </div>
  );
}
