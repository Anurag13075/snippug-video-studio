import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SoundName =
  | "click"
  | "pop"
  | "boop"
  | "snip"
  | "fanfare"
  | "zzz"
  | "wobble"
  | "sad"
  | "bounce"
  | "whoosh";

interface ToneOpts {
  type?: OscillatorType;
  from: number;
  to?: number;
  dur?: number;
  gain?: number;
  delay?: number;
}

interface SoundApi {
  enabled: boolean;
  toggle: () => void;
  play: (name: SoundName) => void;
}

const SoundContext = createContext<SoundApi>({
  enabled: false,
  toggle: () => {},
  play: () => {},
});

function createEngine() {
  let ctx: AudioContext | null = null;

  const get = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    try {
      if (!ctx) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ctx = new AC();
      }
      if (ctx.state === "suspended") void ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  };

  const tone = (c: AudioContext, o: ToneOpts) => {
    const t0 = c.currentTime + (o.delay ?? 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(o.from, t0);
    if (o.to && o.to !== o.from) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.dur ?? 0.08));
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.gain ?? 0.12, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (o.dur ?? 0.08));
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + (o.dur ?? 0.08) + 0.05);
  };

  const noise = (c: AudioContext, dur: number, gain: number, delay = 0) => {
    const t0 = c.currentTime + delay;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 3200;
    src.connect(f).connect(g).connect(c.destination);
    src.start(t0);
  };

  const play = (name: SoundName) => {
    const c = get();
    if (!c) return;
    switch (name) {
      case "click":
        tone(c, { type: "square", from: 1250, dur: 0.035, gain: 0.06 });
        break;
      case "pop":
        tone(c, { from: 420, to: 860, dur: 0.07, gain: 0.1 });
        break;
      case "boop":
        tone(c, { type: "triangle", from: 520, dur: 0.12, gain: 0.11 });
        tone(c, { type: "triangle", from: 780, dur: 0.1, gain: 0.08, delay: 0.09 });
        break;
      case "snip":
        noise(c, 0.05, 0.14);
        noise(c, 0.05, 0.14, 0.09);
        tone(c, { type: "square", from: 1800, to: 900, dur: 0.05, gain: 0.05 });
        break;
      case "fanfare":
        tone(c, { type: "triangle", from: 523, dur: 0.11, gain: 0.1 });
        tone(c, { type: "triangle", from: 659, dur: 0.11, gain: 0.1, delay: 0.1 });
        tone(c, { type: "triangle", from: 784, dur: 0.16, gain: 0.11, delay: 0.2 });
        tone(c, { type: "triangle", from: 1047, dur: 0.24, gain: 0.1, delay: 0.32 });
        break;
      case "zzz":
        tone(c, { from: 300, to: 220, dur: 0.5, gain: 0.05 });
        tone(c, { from: 260, to: 190, dur: 0.6, gain: 0.045, delay: 0.5 });
        break;
      case "wobble":
        tone(c, { type: "triangle", from: 340, to: 180, dur: 0.28, gain: 0.09 });
        tone(c, { type: "triangle", from: 220, to: 380, dur: 0.28, gain: 0.09, delay: 0.26 });
        break;
      case "sad":
        tone(c, { type: "triangle", from: 392, to: 370, dur: 0.22, gain: 0.09 });
        tone(c, { type: "triangle", from: 311, to: 290, dur: 0.38, gain: 0.09, delay: 0.24 });
        break;
      case "bounce":
        tone(c, { from: 220, to: 640, dur: 0.14, gain: 0.1 });
        break;
      case "whoosh":
        noise(c, 0.22, 0.08);
        break;
    }
  };

  return { play };
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("snippug-sound");
      if (saved === "on") setEnabled(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        if (!engineRef.current) engineRef.current = createEngine();
        engineRef.current.play("pop");
      }
      try {
        window.localStorage.setItem("snippug-sound", next ? "on" : "off");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const play = useCallback((name: SoundName) => {
    if (!engineRef.current) engineRef.current = createEngine();
    if (engineRef.current && enabled) engineRef.current.play(name);
  }, [enabled]);

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
