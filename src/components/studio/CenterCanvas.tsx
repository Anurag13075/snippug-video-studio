import { useEffect, useRef } from "react";
import { type Aspect, type CaptionState, drawComposed, fmtTimecode } from "./useStudioState";
import { cn } from "@/lib/utils";

interface CenterCanvasProps {
  src: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  duration: number;
  time: number;
  setTime: (t: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  aspect: Aspect;
  setAspect: (a: Aspect) => void;
  resolution: "1080p" | "4K" | "720p";
  setResolution: (r: "1080p" | "4K" | "720p") => void;
  caption: CaptionState;
  onLoadedMetadata: () => void;
  togglePlay: () => void;
  seekTo: (t: number) => void;
}

export function CenterCanvas({
  src,
  videoRef,
  canvasRef,
  duration,
  time,
  setTime,
  playing,
  setPlaying,
  aspect,
  setAspect,
  resolution,
  setResolution,
  caption,
  onLoadedMetadata,
  togglePlay,
  seekTo,
}: CenterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Render loop to sync video element with canvas
  useEffect(() => {
    let raf = 0;
    let lastSet = -1;

    const loop = () => {
      const v = videoRef.current;
      const c = canvasRef.current;

      if (v && c && src && v.readyState >= 2) {
        const pw = aspect === "9:16" ? 540 : aspect === "1:1" ? 720 : 960;
        const ph = aspect === "9:16" ? 960 : aspect === "1:1" ? 720 : 540;

        if (c.width !== pw || c.height !== ph) {
          c.width = pw;
          c.height = ph;
        }

        const ctx = c.getContext("2d");
        if (ctx) {
          drawComposed(ctx, v, pw, ph, aspect, caption, false);
        }

        const t = v.currentTime;
        if (Math.abs(t - lastSet) > 0.05) {
          lastSet = t;
          setTime(t);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [src, aspect, caption, setTime, videoRef, canvasRef]);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  };

  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pct * (duration || 45));
  };

  const progressPct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#0B0A0F] p-4"
    >
      {/* Hidden background Video element for media capture */}
      <video
        ref={videoRef}
        src={src ?? undefined}
        playsInline
        muted={false}
        crossOrigin="anonymous"
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="hidden"
      />

      {/* Main Preview Phone Container */}
      <div className="relative flex max-h-[82vh] w-auto flex-col items-center justify-center">
        {/* Aspect & Resolution Badges */}
        <div className="absolute -top-11 left-0 right-0 z-10 flex items-center justify-between px-1">
          {/* Aspect Badge */}
          <button
            type="button"
            onClick={() => {
              const next: Aspect = aspect === "9:16" ? "1:1" : aspect === "1:1" ? "16:9" : "9:16";
              setAspect(next);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[#262330] bg-[#131118] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:border-[#7C3AED]/50"
          >
            <span>📱</span>
            <span>{aspect}</span>
          </button>

          {/* Resolution Dropdown */}
          <button
            type="button"
            onClick={() => {
              const next = resolution === "1080p" ? "4K" : resolution === "4K" ? "720p" : "1080p";
              setResolution(next);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[#262330] bg-[#131118] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:border-[#7C3AED]/50"
          >
            <span>{resolution}</span>
            <svg className="h-3.5 w-3.5 text-[#6B6778]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Video Canvas Phone Frame */}
        <div className="group relative aspect-[9/16] h-[66vh] max-h-[620px] overflow-hidden rounded-3xl border border-[#262330] bg-black shadow-2xl">
          <canvas
            ref={canvasRef}
            className="h-full w-full object-cover"
          />

          {/* Big Center Play / Pause Overlay Button */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause video" : "Play video"}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
              playing ? "opacity-0 hover:opacity-100" : "opacity-100",
            )}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md shadow-2xl transition-transform hover:scale-110 active:scale-95">
              {playing ? (
                <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="h-6 w-6 translate-x-0.5 fill-white" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </div>
          </button>

          {/* Integrated Preview Transport Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 py-3 text-xs text-white">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="text-white hover:text-[#7C3AED]"
            >
              {playing ? (
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Scrub Progress Track */}
            <div
              onClick={handleTimelineScrub}
              className="relative flex-1 h-1.5 cursor-pointer rounded-full bg-white/25 transition-all hover:h-2"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#7C3AED]"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Timecode 00:00 / 00:45 */}
            <span className="font-mono text-[11px] font-medium text-white/90">
              {fmtTimecode(time, duration || 45)}
            </span>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Fullscreen"
              className="text-white/80 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
