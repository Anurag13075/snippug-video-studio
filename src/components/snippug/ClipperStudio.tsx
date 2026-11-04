import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Keycap, KeycapStatic } from "./Keycap";
import { Puggy } from "./Puggy";
import { useSound } from "./sound";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Aspect = "9:16" | "1:1" | "16:9";

const ASPECTS: Array<{ id: Aspect; label: string; hint: string; w: number; h: number }> = [
  { id: "9:16", label: "9:16 Reel", hint: "blurred backdrop + phone frame", w: 720, h: 1280 },
  { id: "1:1", label: "1:1 Square", hint: "feed post", w: 720, h: 720 },
  { id: "16:9", label: "16:9 Wide", hint: "YouTube / landscape", w: 1280, h: 720 },
];

const SAMPLES = [
  { id: "podcast-snippet", title: "Podcast snippet", emoji: "🎙️", file: "/samples/podcast-snippet.mp4" },
  { id: "tech-review", title: "Tech review", emoji: "📷", file: "/samples/tech-review.mp4" },
  { id: "gaming-moment", title: "Gaming moment", emoji: "🎮", file: "/samples/gaming-moment.mp4" },
];

const MIN_CLIP = 0.3;

function fmt(t: number) {
  if (!isFinite(t)) return "0:00.0";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s < 10 ? "0" : ""}${s.toFixed(1)}`;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Draws one composed frame: blurred backdrop, contained video, frame, watermark. */
function drawComposed(
  ctx: CanvasRenderingContext2D,
  v: HTMLVideoElement,
  W: number,
  H: number,
  aspect: Aspect,
) {
  const vw = v.videoWidth || 16;
  const vh = v.videoHeight || 9;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#181310";
  ctx.fillRect(0, 0, W, H);

  const drawCover = () => {
    const s = Math.max(W / vw, H / vh);
    const w = vw * s;
    const h = vh * s;
    ctx.drawImage(v, (W - w) / 2, (H - h) / 2, w, h);
  };
  const drawContain = () => {
    const s = Math.min(W / vw, H / vh);
    const w = vw * s;
    const h = vh * s;
    ctx.drawImage(v, (W - w) / 2, (H - h) / 2, w, h);
  };

  if (aspect === "16:9") {
    drawCover();
    return;
  }

  // blurred backdrop
  ctx.save();
  try {
    ctx.filter = "blur(28px) saturate(1.25) brightness(0.85)";
  } catch {
    /* older browsers */
  }
  const s = Math.max(W / vw, H / vh) * 1.35;
  ctx.drawImage(v, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);
  ctx.restore();
  ctx.filter = "none";
  // subtle darkening
  ctx.fillStyle = "rgba(12, 9, 7, 0.18)";
  ctx.fillRect(0, 0, W, H);

  drawContain();

  if (aspect === "9:16") {
    // phone frame
    ctx.save();
    ctx.strokeStyle = "rgba(255, 252, 246, 0.85)";
    ctx.lineWidth = Math.max(4, W * 0.008);
    roundRectPath(ctx, W * 0.045, H * 0.028, W * 0.91, H * 0.944, W * 0.07);
    ctx.stroke();
    ctx.restore();
  }

  // free-plan watermark tag
  ctx.save();
  const fs = Math.max(13, W * 0.026);
  ctx.font = `600 ${fs}px "Instrument Sans", sans-serif`;
  const text = "SnipPug";
  const tw = ctx.measureText(text).width;
  const px = fs * 0.55;
  const bx = W - tw - px * 2 - fs * 0.9;
  const by = H - fs * 2.1;
  ctx.fillStyle = "rgba(20, 15, 11, 0.55)";
  roundRectPath(ctx, bx, by, tw + px * 2, fs * 1.6, fs * 0.8);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 250, 240, 0.92)";
  ctx.fillText(text, bx + px, by + fs * 1.12);
  ctx.restore();
}

export function ClipperStudio() {
  const [src, setSrc] = useState<string | null>(null);
  const [name, setName] = useState("clip");
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [inPt, setInPt] = useState(0);
  const [outPt, setOutPt] = useState(0);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [playing, setPlaying] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [armed, setArmed] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const srcNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const cancelRef = useRef(false);
  const { play } = useSound();

  const aspectCfg = ASPECTS.find((a) => a.id === aspect)!;

  /* ---------- loading ---------- */

  const loadSource = useCallback(
    (url: string, label: string, revokeOld?: string) => {
      if (revokeOld && revokeOld.startsWith("blob:")) URL.revokeObjectURL(revokeOld);
      setSrc(url);
      setName(label.replace(/\.[^.]+$/, "").slice(0, 40) || "clip");
      setDuration(0);
      setTime(0);
      setInPt(0);
      setOutPt(0);
      setPlaying(false);
      setProgress(0);
    },
    [],
  );

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v)$/i.test(file.name)) {
        toast.error("That doesn't look like a video. Try MP4, WebM or MOV.");
        return;
      }
      play("whoosh");
      loadSource(URL.createObjectURL(file), file.name, src ?? undefined);
      toast.success(`Loaded ${file.name}`);
    },
    [loadSource, play, src],
  );

  /* ---------- metadata & time sync ---------- */

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const d = v.duration || 0;
    setDuration(d);
    setInPt(0);
    setOutPt(Math.min(d, 8) || 0);
    setTime(0);
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastSet = -1;
    const loop = () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (v && c && src && v.readyState >= 2) {
        // keep canvas at preview resolution for the current aspect
        const pw = aspect === "9:16" ? 480 : aspect === "1:1" ? 640 : 854;
        const ph = aspect === "9:16" ? 854 : aspect === "1:1" ? 640 : 480;
        if (c.width !== pw || c.height !== ph) {
          c.width = pw;
          c.height = ph;
        }
        drawComposed(c.getContext("2d")!, v, pw, ph, aspect);
        const t = v.currentTime;
        if (Math.abs(t - lastSet) > 0.04) {
          lastSet = t;
          setTime(t);
          if (!v.paused && duration > 0) setPlaying(true);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [src, aspect, duration]);

  /* ---------- playback & markers ---------- */

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (v.paused) {
      void v.play();
      play("click");
    } else {
      v.pause();
      play("click");
    }
  }, [play, src]);

  const markIn = useCallback(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    const t = v.currentTime;
    setInPt(Math.min(t, outPt - MIN_CLIP > 0 ? outPt - MIN_CLIP : duration || t));
    play("snip");
  }, [outPt, play, src]);

  const markOut = useCallback(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    const t = v.currentTime;
    setOutPt(Math.max(t, inPt + MIN_CLIP));
    play("snip");
  }, [inPt, play, src]);

  const nudge = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v || !src) return;
      v.currentTime = Math.min(Math.max(0, v.currentTime + delta), duration);
      setTime(v.currentTime);
      play("click");
    },
    [duration, play, src],
  );

  const seekTo = useCallback(
    (t: number) => {
      const v = videoRef.current;
      if (!v || !src) return;
      v.currentTime = Math.min(Math.max(0, t), duration || 0);
      setTime(v.currentTime);
    },
    [duration, src],
  );

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!armed || exporting) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)))
        return;
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "s") {
        e.preventDefault();
        void doExport();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (k === "i") {
        e.preventDefault();
        markIn();
      } else if (k === "o") {
        e.preventDefault();
        markOut();
      } else if (k === " ") {
        e.preventDefault();
        togglePlay();
      } else if (k === "j") {
        e.preventDefault();
        nudge(-1);
      } else if (k === "l") {
        e.preventDefault();
        nudge(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, exporting, markIn, markOut, togglePlay, nudge]);

  /* ---------- timeline dragging ---------- */

  const dragMode = useRef<"in" | "out" | "seek" | null>(null);

  const timeFromEvent = (clientX: number) => {
    const el = trackRef.current;
    if (!el || !duration) return 0;
    const r = el.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return pct * duration;
  };

  const onTrackPointerDown = (e: React.PointerEvent, mode: "in" | "out" | "seek") => {
    if (!duration || exporting) return;
    dragMode.current = mode;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const t = timeFromEvent(e.clientX);
    if (mode === "in") {
      setInPt(Math.min(t, outPt - MIN_CLIP));
      play("snip");
    } else if (mode === "out") {
      setOutPt(Math.max(t, inPt + MIN_CLIP));
      play("snip");
    } else {
      seekTo(t);
    }
  };

  const onTrackPointerMove = (e: React.PointerEvent) => {
    if (!dragMode.current || !duration) return;
    const t = timeFromEvent(e.clientX);
    if (dragMode.current === "in") setInPt(Math.min(t, outPt - MIN_CLIP));
    else if (dragMode.current === "out") setOutPt(Math.max(t, inPt + MIN_CLIP));
    else if (dragMode.current === "seek") seekTo(t);
  };

  const onTrackPointerUp = () => {
    dragMode.current = null;
  };

  /* ---------- export ---------- */

  const doExport = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !src || exporting) return;
    if (outPt - inPt < MIN_CLIP) {
      toast.error("Your clip is too short — mark at least a third of a second.");
      return;
    }
    setExporting(true);
    setProgress(0);
    cancelRef.current = false;
    play("whoosh");

    let cleanup = () => {};
    try {
      const cfg = aspectCfg;
      const W = cfg.w;
      const H = cfg.h;

      // audio graph
      let audioTracks: MediaStreamTrack[] = [];
      try {
        if (!audioCtxRef.current) {
          const AC =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
        await ctx.resume();
        if (!srcNodeRef.current) {
          srcNodeRef.current = ctx.createMediaElementSource(v);
          destRef.current = ctx.createMediaStreamDestination();
          srcNodeRef.current.connect(destRef.current);
          srcNodeRef.current.connect(ctx.destination);
        }
        audioTracks = destRef.current!.stream.getAudioTracks();
      } catch {
        audioTracks = []; // export video-only if audio graph fails
      }

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const c2d = canvas.getContext("2d")!;

      const stream = canvas.captureStream(30);
      audioTracks.forEach((t) => stream.addTrack(t));

      const mimes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      const mime = mimes.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

      const done = new Promise<Blob | null>((resolve) => {
        recorder.onstop = () => resolve(cancelRef.current ? null : new Blob(chunks, { type: "video/webm" }));
      });

      v.pause();
      v.currentTime = inPt;
      await new Promise<void>((res) => {
        const ok = () => res();
        v.addEventListener("seeked", ok, { once: true });
        setTimeout(ok, 1200);
      });

      recorder.start(200);
      await v.play();

      await new Promise<void>((res) => {
        let raf = 0;
        const step = () => {
          const t = v.currentTime;
          drawComposed(c2d, v, W, H, aspect);
          setProgress(Math.min(1, Math.max(0, (t - inPt) / (outPt - inPt))));
          if (cancelRef.current || t >= outPt - 0.02 || v.ended) {
            cancelAnimationFrame(raf);
            res();
            return;
          }
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      });

      v.pause();
      recorder.stop();
      const blob = await done;

      cleanup = () => stream.getTracks().forEach((t) => t.stop());

      if (!blob) {
        toast.info("Export cancelled.");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}-snippug-clip.webm`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        window.dispatchEvent(new Event("snippug:exported"));
        play("fanfare");
        toast.success("Clip exported! Check your downloads.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Export hit a snag. Try a shorter clip or a different format.");
    } finally {
      cleanup();
      v.pause();
      setExporting(false);
      setProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect, aspectCfg, exporting, inPt, name, outPt, play, src]);

  /* ---------- render ---------- */

  const hasVideo = !!src && duration > 0;
  const inPct = duration ? (inPt / duration) * 100 : 0;
  const outPct = duration ? (outPt / duration) * 100 : 0;
  const timePct = duration ? (time / duration) * 100 : 0;

  return (
    <section id="studio" ref={sectionRef} className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          The Studio
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Clip it <span className="serif-accent text-cocoa">right here.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          This is the real app, running in your browser. Nothing is uploaded — ever.
        </p>

        <div
          onPointerDown={() => setArmed(true)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) loadFile(f);
          }}
          className={cn(
            "mt-10 rounded-4xl border-[1.5px] bg-card p-4 shadow-card transition-colors sm:p-6",
            dragOver ? "border-leaf bg-secondary" : "border-border",
          )}
        >
          {/* input row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border-[1.5px] border-b-4 border-border bg-cream px-4 text-sm font-semibold shadow-key pressable hover:bg-secondary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload video
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) loadFile(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <span className="hidden text-xs text-muted-foreground sm:inline">or drop a file anywhere in this box</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Try a sample:</span>
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    play("pop");
                    loadSource(s.file, s.title, src?.startsWith("blob:") ? src : undefined);
                  }}
                  className="rounded-xl border-[1.5px] border-b-4 border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-key pressable hover:bg-secondary"
                >
                  {s.emoji} {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* stage */}
          <div className="mt-4 flex justify-center">
            {!hasVideo ? (
              <div className="flex w-full max-w-lg flex-col items-center rounded-3xl border-2 border-dashed border-border bg-secondary/50 px-6 py-14 text-center">
                <div className="h-28 w-28">
                  <Puggy mood="listening" className="h-full w-full" />
                </div>
                <p className="mt-4 font-semibold">Drop a video here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  MP4, WebM or MOV — it opens instantly and never leaves your device.
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  "relative overflow-hidden rounded-3xl border-[1.5px] border-border bg-[#14100c] shadow-pop",
                  aspect === "9:16" && "h-[72vh] max-h-[640px] w-auto aspect-[9/16]",
                  aspect === "1:1" && "aspect-square w-full max-w-[560px]",
                  aspect === "16:9" && "aspect-video w-full",
                )}
              >
                <canvas ref={canvasRef} className="h-full w-full" />
                {exporting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#14100c]/70 px-8 text-center backdrop-blur-[2px]">
                    <div className="h-20 w-20">
                      <Puggy mood="focus" className="h-full w-full" />
                    </div>
                    <p className="font-semibold text-cream">Recording your clip…</p>
                    <div className="h-2.5 w-56 overflow-hidden rounded-full border border-white/20 bg-white/10">
                      <div
                        className="h-full rounded-full bg-tan transition-[width] duration-150"
                        style={{ width: `${Math.round(progress * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-cream/70">
                      {Math.round(progress * 100)}% · real-time capture — keep this tab in front
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-white/30 bg-white/10 text-cream hover:bg-white/20"
                      onClick={() => {
                        cancelRef.current = true;
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* hidden video element (single source of truth) */}
          {src && (
            <video
              ref={videoRef}
              src={src}
              className="pointer-events-none absolute h-px w-px opacity-0"
              playsInline
              preload="auto"
              onLoadedMetadata={onLoadedMetadata}
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
            />
          )}

          {/* controls */}
          {hasVideo && (
            <>
              {/* timeline */}
              <div className="mt-5">
                <div
                  ref={trackRef}
                  onPointerDown={(e) => {
                    const el = e.target as HTMLElement;
                    onTrackPointerDown(e, el.dataset["handle"] === "in" ? "in" : el.dataset["handle"] === "out" ? "out" : "seek");
                  }}
                  onPointerMove={onTrackPointerMove}
                  onPointerUp={onTrackPointerUp}
                  onPointerCancel={onTrackPointerUp}
                  className="relative h-11 touch-none select-none rounded-xl border-[1.5px] border-border bg-secondary"
                >
                  {/* selection */}
                  <div
                    className="absolute inset-y-1 rounded-lg border-x-[3px] bg-tan/45"
                    style={{ left: `${inPct}%`, width: `${Math.max(0, outPct - inPct)}%`, borderColor: "var(--color-cocoa)" }}
                  />
                  {/* playhead */}
                  <div
                    className="absolute inset-y-0 z-10 w-[2px] bg-foreground"
                    style={{ left: `${timePct}%` }}
                  >
                    <span className="absolute -top-0.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-foreground" />
                  </div>
                  {/* handles */}
                  <div
                    data-handle="in"
                    className="absolute inset-y-0 z-20 flex w-6 -translate-x-1/2 cursor-ew-resize items-center justify-center"
                    style={{ left: `${inPct}%` }}
                  >
                    <span className="flex h-7 w-4 items-center justify-center rounded-md border border-border bg-leaf text-[9px] font-bold text-white shadow-key">
                      I
                    </span>
                  </div>
                  <div
                    data-handle="out"
                    className="absolute inset-y-0 z-20 flex w-6 -translate-x-1/2 cursor-ew-resize items-center justify-center"
                    style={{ left: `${outPct}%` }}
                  >
                    <span className="flex h-7 w-4 items-center justify-center rounded-md border border-border bg-tomato text-[9px] font-bold text-white shadow-key">
                      O
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-medium tabular-nums text-muted-foreground">
                  <span>In {fmt(inPt)}</span>
                  <span>
                    clip length <span className="font-bold text-foreground">{fmt(Math.max(0, outPt - inPt))}</span> ·
                    export {aspectCfg.w}×{aspectCfg.h}
                  </span>
                  <span>Out {fmt(outPt)}</span>
                </div>
              </div>

              {/* button rows */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Keycap onClick={markIn} title="Mark in (I)">
                  I · Mark In
                </Keycap>
                <Keycap onClick={markOut} title="Mark out (O)">
                  O · Mark Out
                </Keycap>
                <Keycap onClick={togglePlay} active={playing} title="Play / pause (Space)">
                  {playing ? "⏸ Pause" : "▶ Play"}
                </Keycap>
                <Keycap onClick={() => nudge(-1)} title="Back 1s (J)">
                  ⏪ J
                </Keycap>
                <Keycap onClick={() => nudge(1)} title="Forward 1s (L)">
                  L ⏩
                </Keycap>
                <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {fmt(time)} / {fmt(duration)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {/* aspect presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {ASPECTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      title={a.hint}
                      onClick={() => {
                        setAspect(a.id);
                        play("click");
                      }}
                      className={cn(
                        "rounded-xl border-[1.5px] border-b-4 px-3 py-2 text-xs font-semibold pressable",
                        aspect === a.id
                          ? "translate-y-[2px] border-border bg-tan text-cocoa shadow-key-active"
                          : "border-border bg-card shadow-key hover:bg-secondary",
                      )}
                    >
                      {a.id === "9:16" ? "📱" : a.id === "1:1" ? "🔲" : "🖥️"} {a.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => void doExport()}
                  disabled={exporting}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border-b-4 border-cocoa/40 bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-key pressable hover:shadow-key-active active:translate-y-[3px] active:border-b-0 disabled:opacity-60"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Export clip
                  <KeycapStatic>⌘ + S</KeycapStatic>
                </button>
              </div>

              <p className={cn("mt-3 text-xs text-muted-foreground", armed && "text-foreground")}>
                {armed
                  ? "⌨️ Keyboard armed — I, O, Space, J / L and ⌘ + S all work now."
                  : "Click anywhere in the studio to arm the keyboard shortcuts."}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
