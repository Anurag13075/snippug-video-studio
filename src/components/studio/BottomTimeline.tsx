import { useRef } from "react";
import { WaveformCanvas } from "./WaveformCanvas";
import { SnipQueue } from "./SnipQueue";
import { type SnipItem, fmt } from "./useStudioState";
import { useSound } from "@/components/snippug/sound";

interface BottomTimelineProps {
  duration: number;
  time: number;
  inPt: number;
  outPt: number;
  zoom: number;
  onSetIn: (t: number) => void;
  onSetOut: (t: number) => void;
  onSeek: (t: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  snipQueue: SnipItem[];
  onRemoveSnip: (id: string) => void;
  onExportSingle: (snip: SnipItem) => void;
  onExportAll: () => void;
  onAddCurrentSnip: () => void;
  exporting: boolean;
}

export function BottomTimeline({
  duration,
  time,
  inPt,
  outPt,
  zoom,
  onSetIn,
  onSetOut,
  onSeek,
  onZoomIn,
  onZoomOut,
  snipQueue,
  onRemoveSnip,
  onExportSingle,
  onExportAll,
  onAddCurrentSnip,
  exporting,
}: BottomTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragMode = useRef<"in" | "out" | "seek" | null>(null);
  const { play } = useSound();

  const minClip = 0.3;
  const inPct = duration > 0 ? (inPt / duration) * 100 : 0;
  const outPct = duration > 0 ? (outPt / duration) * 100 : 0;
  const timePct = duration > 0 ? (time / duration) * 100 : 0;

  const timeFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || duration <= 0) return 0;
    const r = el.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return pct * duration;
  };

  const onPointerDown = (e: React.PointerEvent, mode: "in" | "out" | "seek") => {
    if (duration <= 0 || exporting) return;
    dragMode.current = mode;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const t = timeFromClientX(e.clientX);
    if (mode === "in") {
      onSetIn(Math.min(t, outPt - minClip));
      play("snip");
    } else if (mode === "out") {
      onSetOut(Math.max(t, inPt + minClip));
      play("snip");
    } else {
      onSeek(t);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragMode.current || duration <= 0) return;
    const t = timeFromClientX(e.clientX);
    if (dragMode.current === "in") {
      onSetIn(Math.min(t, outPt - minClip));
    } else if (dragMode.current === "out") {
      onSetOut(Math.max(t, inPt + minClip));
    } else if (dragMode.current === "seek") {
      onSeek(t);
    }
  };

  const onPointerUp = () => {
    dragMode.current = null;
  };

  return (
    <footer className="shrink-0 border-t border-[#3a3228] bg-[#16120e]">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between border-b border-[#3a3228]/60 px-4 py-1.5 text-xs text-[#A89F91]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[#F5E6CB]">In: {fmt(inPt)}</span>
          <span className="text-[#5E5649]">|</span>
          <span className="font-mono font-semibold text-[#E6C395]">
            Clip: {fmt(Math.max(0, outPt - inPt))}
          </span>
          <span className="text-[#5E5649]">|</span>
          <span className="font-mono text-[#F5E6CB]">Out: {fmt(outPt)}</span>
        </div>

        {/* Timeline Zoom Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#7A7163]">
            Zoom
          </span>
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom out timeline ([)"
            className="flex h-5 w-5 items-center justify-center rounded border border-[#3a3228] bg-[#231E18] text-xs text-[#F5E6CB] hover:border-[#E6C395]"
          >
            -
          </button>
          <span className="font-mono text-[11px] text-[#A89F91]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom in timeline (])"
            className="flex h-5 w-5 items-center justify-center rounded border border-[#3a3228] bg-[#231E18] text-xs text-[#F5E6CB] hover:border-[#E6C395]"
          >
            +
          </button>
        </div>
      </div>

      {/* Scrubbing Waveform Bar */}
      <div className="p-3 pb-2">
        <div
          ref={trackRef}
          onPointerDown={(e) => {
            const target = e.target as HTMLElement;
            const handle = target.getAttribute("data-handle");
            onPointerDown(
              e,
              handle === "in" ? "in" : handle === "out" ? "out" : "seek",
            );
          }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative h-12 w-full touch-none select-none overflow-hidden rounded-xl border border-[#3a3228] bg-[#1d1813] cursor-pointer"
        >
          {/* Waveform graphic */}
          <div className="pointer-events-none absolute inset-0">
            <WaveformCanvas
              duration={duration}
              time={time}
              inPt={inPt}
              outPt={outPt}
              zoom={zoom}
            />
          </div>

          {/* Active selection region */}
          <div
            className="pointer-events-none absolute inset-y-0 border-x-2 border-[#E6C395] bg-[#E6C395]/20 backdrop-blur-[1px]"
            style={{
              left: `${inPct}%`,
              width: `${Math.max(0, outPct - inPct)}%`,
            }}
          />

          {/* Playhead marker */}
          <div
            className="pointer-events-none absolute inset-y-0 z-20 w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ left: `${timePct}%` }}
          >
            <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-white" />
          </div>

          {/* In Handle (Green) */}
          <div
            data-handle="in"
            className="absolute inset-y-0 z-30 flex w-7 -translate-x-1/2 cursor-ew-resize items-center justify-center"
            style={{ left: `${inPct}%` }}
          >
            <span
              data-handle="in"
              className="flex h-8 w-4.5 items-center justify-center rounded-md border border-black/40 bg-emerald-500 text-[10px] font-black text-black shadow-key"
            >
              I
            </span>
          </div>

          {/* Out Handle (Red/Coral) */}
          <div
            data-handle="out"
            className="absolute inset-y-0 z-30 flex w-7 -translate-x-1/2 cursor-ew-resize items-center justify-center"
            style={{ left: `${outPct}%` }}
          >
            <span
              data-handle="out"
              className="flex h-8 w-4.5 items-center justify-center rounded-md border border-black/40 bg-rose-500 text-[10px] font-black text-black shadow-key"
            >
              O
            </span>
          </div>
        </div>
      </div>

      {/* Snip Queue Strip */}
      <SnipQueue
        queue={snipQueue}
        onRemove={onRemoveSnip}
        onExportSingle={onExportSingle}
        onExportAll={onExportAll}
        onAddCurrent={onAddCurrentSnip}
        exporting={exporting}
      />
    </footer>
  );
}
