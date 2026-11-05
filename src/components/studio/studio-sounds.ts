/**
 * Meme soundboard — Web Audio API synthesized sound effects.
 * Each function creates a short procedural sound, no samples needed.
 */

export type MemeSound =
  | "pop"
  | "vineBoom"
  | "click"
  | "ding"
  | "bell"
  | "woosh"
  | "pugBark"
  | "airhorn";

interface MemeEntry {
  id: MemeSound;
  emoji: string;
  label: string;
}

export const MEME_SOUNDS: MemeEntry[] = [
  { id: "pop", emoji: "🎵", label: "Pop" },
  { id: "vineBoom", emoji: "💥", label: "Vine Boom" },
  { id: "click", emoji: "🖱️", label: "Click" },
  { id: "ding", emoji: "🔔", label: "Ding" },
  { id: "bell", emoji: "🛎️", label: "Bell" },
  { id: "woosh", emoji: "💨", label: "Woosh" },
  { id: "pugBark", emoji: "🐕", label: "Pug Bark" },
  { id: "airhorn", emoji: "🎺", label: "Airhorn" },
];

function tone(
  ctx: AudioContext,
  opts: {
    type?: OscillatorType;
    freq: number;
    freqEnd?: number;
    dur?: number;
    gain?: number;
    delay?: number;
  },
) {
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const dur = opts.dur ?? 0.1;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.freqEnd && opts.freqEnd !== opts.freq) {
    osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, t0 + dur);
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.15, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(
  ctx: AudioContext,
  dur: number,
  gain: number,
  filterFreq: number,
  delay = 0,
) {
  const t0 = ctx.currentTime + delay;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = filterFreq;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t0);
}

let _ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      _ctx = new AC();
    }
    if (_ctx.state === "suspended") void _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

export function playMemeSound(name: MemeSound, volume = 1): void {
  const ctx = getCtx();
  if (!ctx) return;
  const v = Math.max(0.01, Math.min(1, volume));

  switch (name) {
    case "pop":
      tone(ctx, { freq: 380, freqEnd: 900, dur: 0.08, gain: 0.15 * v });
      break;

    case "vineBoom":
      tone(ctx, { freq: 80, freqEnd: 40, dur: 0.6, gain: 0.25 * v });
      tone(ctx, { type: "sawtooth", freq: 120, freqEnd: 50, dur: 0.5, gain: 0.08 * v, delay: 0.02 });
      noise(ctx, 0.3, 0.06 * v, 200);
      break;

    case "click":
      tone(ctx, { type: "square", freq: 2400, dur: 0.02, gain: 0.08 * v });
      noise(ctx, 0.015, 0.04 * v, 6000);
      break;

    case "ding":
      tone(ctx, { freq: 1200, dur: 0.4, gain: 0.12 * v });
      tone(ctx, { freq: 2400, dur: 0.25, gain: 0.06 * v });
      break;

    case "bell":
      tone(ctx, { freq: 800, dur: 0.15, gain: 0.12 * v });
      tone(ctx, { freq: 1600, dur: 0.2, gain: 0.08 * v, delay: 0.02 });
      tone(ctx, { freq: 3200, dur: 0.12, gain: 0.04 * v, delay: 0.04 });
      break;

    case "woosh":
      noise(ctx, 0.3, 0.1 * v, 2400);
      tone(ctx, { freq: 300, freqEnd: 1800, dur: 0.25, gain: 0.04 * v });
      break;

    case "pugBark":
      tone(ctx, { type: "sawtooth", freq: 340, freqEnd: 480, dur: 0.06, gain: 0.12 * v });
      tone(ctx, { type: "sawtooth", freq: 420, freqEnd: 280, dur: 0.08, gain: 0.14 * v, delay: 0.07 });
      noise(ctx, 0.05, 0.08 * v, 1800, 0.02);
      break;

    case "airhorn":
      tone(ctx, { type: "sawtooth", freq: 480, dur: 0.5, gain: 0.18 * v });
      tone(ctx, { type: "sawtooth", freq: 720, dur: 0.45, gain: 0.1 * v, delay: 0.02 });
      tone(ctx, { type: "square", freq: 960, dur: 0.35, gain: 0.06 * v, delay: 0.04 });
      break;
  }
}
