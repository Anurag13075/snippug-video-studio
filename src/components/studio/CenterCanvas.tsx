import { useEffect } from "react";
import { Puggy } from "@/components/snippug/Puggy";
import { Keycap } from "@/components/snippug/Keycap";
import { Button } from "@/components/ui/button";
import {
  type Aspect,
  type CaptionState,
  type ReframePreset,
  drawComposed,
  fmt,
} from "./useStudioState";
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
  reframe: ReframePreset;
  caption: CaptionState;
  watermark: boolean;
  exporting: boolean;
  exportProgress: number;
  onCancelExport: () => void;
  onLoadedMetadata: () => void;
  togglePlay: () => void;
  markIn: () => void;
  markOut: () => void;
  nudge: (delta: number) => void;
  dragOver: boolean;
  setDragOver: (d: boolean) => void;
  onFileUpload: (file: File) => void;
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
  reframe,
  caption,
  watermark,
  exporting,
  exportProgress,
  onCancelExport,
  onLoadedMetadata,
  togglePlay,
  markIn,
  markOut,
  nudge,
  dragOver,
  setDragOver,
  onFileUpload,
}: CenterCanvasProps) {
  // Continuous render loop into preview canvas
  useEffect(() => {
    let raf = 0;
    let lastSet = -1;

    const loop = () => {
      const v = videoRef.current;
      const c = canvasRef.current;

      if (v && c && src && v.readyState >= 2) {
        const pw = aspect === "9:16" ? 480 : aspect === "1:1" ? 640 : 854;
        const ph = aspect === "9:16" ? 854 : aspect === "1:1" ? 640 : 480;

        if (c.width !== pw || c.height !== ph) {
          c.width = pw;
          c.height = ph;
        }

        const ctx = c.getContext("2d");
        if (ctx) {
          drawComposed(ctx, v, pw, ph, aspect, caption, watermark);
        }

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
  }, [src, aspect, reframe, caption, watermark, duration, videoRef, canvasRef, setTime, setPlaying]);

  return (
    <main
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFileUpload(f);
      }}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#14100c] p-6 transition-colors",
        dragOver && "bg-[#231E18]/80 outline-2 outline-dashed outline-[#E6C395]",
      )}
    >
      {/* Hidden source video */}
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

      {/* Main Canvas Area */}
      {!src ? (
        <div className="flex max-w-md flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#3a3228] bg-[#1a1612]/60 p-10 text-center">
          <div className="h-24 w-24">
            <Puggy mood="listening" className="h-full w-full" />
          </div>
          <h3 className="mt-4 text-base font-bold text-[#F5E6CB]">
            Drop any video onto SnipPug Studio
          </h3>
          <p className="mt-1 text-xs text-[#A89F91]">
            MP4, WebM, MOV. Instant local processing. Zero video uploads.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col items-center">
          {/* Canvas Box */}
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border-[2px] border-[#3a3228] bg-[#181310] shadow-pop transition-all",
              aspect === "9:16" && "h-[62vh] max-h-[600px] w-auto aspect-[9/16]",
              aspect === "1:1" && "aspect-square w-full max-w-[500px]",
              aspect === "16:9" && "aspect-video w-full max-w-[760px]",
            )}
          >
            <canvas ref={canvasRef} className="h-full w-full" />

            {/* Subtle grid crop guides */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
              <div className="border-b border-r border-white/40" />
              <div className="border-b border-r border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-b border-r border-white/40" />
              <div className="border-b border-r border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-r border-white/40" />
              <div className="border-r border-white/40" />
              <div />
            </div>

            {/* Exporting Progress Overlay */}
            {exporting && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#14100c]/85 p-6 text-center backdrop-blur-sm">
                <div className="h-20 w-20">
                  <Puggy mood="focus" className="h-full w-full" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#F5E6CB]">
                    Recording clip frame-by-frame...
                  </h4>
                  <p className="text-xs text-[#A89F91]">
                    {Math.round(exportProgress * 100)}% complete · Keep tab in front
                  </p>
                </div>
                <div className="h-2 w-52 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E6C395] to-[#D9B183] transition-all duration-100"
                    style={{ width: `${Math.round(exportProgress * 100)}%` }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancelExport}
                  className="mt-2 border-white/20 bg-white/5 text-xs text-[#F5E6CB] hover:bg-white/10"
                >
                  Cancel Export
                </Button>
              </div>
            )}
          </div>

          {/* Quick canvas control bar */}
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#3a3228] bg-[#1d1813]/90 px-3 py-1.5 backdrop-blur-md shadow-key">
            <Keycap onClick={() => nudge(-1)} title="Jump 1s back (J)">
              ⏪ J
            </Keycap>
            <Keycap
              onClick={togglePlay}
              active={playing}
              title="Play / Pause (Space)"
              className="min-w-[70px]"
            >
              {playing ? "⏸ Pause" : "▶ Play"}
            </Keycap>
            <Keycap onClick={() => nudge(1)} title="Jump 1s forward (L)">
              L ⏩
            </Keycap>
            <span className="mx-1 h-5 w-px bg-[#3a3228]" />
            <Keycap onClick={markIn} title="Mark In point (I)">
              [ I ]
            </Keycap>
            <Keycap onClick={markOut} title="Mark Out point (O)">
              [ O ]
            </Keycap>
            <span className="mx-1 h-5 w-px bg-[#3a3228]" />
            <div className="font-mono text-xs text-[#E6C395]">
              {fmt(time)} <span className="text-[#5E5649]">/</span> {fmt(duration)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
