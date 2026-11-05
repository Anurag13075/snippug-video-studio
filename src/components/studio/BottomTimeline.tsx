import { useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BottomTimelineProps {
  duration: number;
  time: number;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSeek: (t: number) => void;
  trackVisibility: {
    captions: boolean;
    video: boolean;
    audio: boolean;
  };
  onToggleTrack: (track: "captions" | "video" | "audio") => void;
  captionSegments: Array<{ id: string; text: string; start: number; end: number }>;
  realThumbnails?: string[];
  realWaveformPeaks?: number[];
  onOpenHelp?: () => void;
}

export function BottomTimeline({
  duration,
  time,
  zoom,
  onZoomIn,
  onZoomOut,
  onSeek,
  trackVisibility,
  onToggleTrack,
  captionSegments,
  realThumbnails = [],
  realWaveformPeaks = [],
  onOpenHelp = () => {},
}: BottomTimelineProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const totalDuration = duration || 25;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pct * totalDuration);
  };

  const playheadPct = Math.max(0, Math.min(100, (time / totalDuration) * 100));

  // Generate 6 time ruler markers based on duration
  const rulerInterval = Math.max(1, Math.round(totalDuration / 5));
  const rulerMarkers = Array.from({ length: 6 }, (_, i) => `${i * rulerInterval}s`);

  return (
    <footer className="relative flex flex-col border-t border-[#262330] bg-[#131118]">
      {/* Timeline Controls Toolbar */}
      <div className="flex h-11 items-center justify-between border-b border-[#262330] px-4">
        {/* Left Tools */}
        <div className="flex items-center gap-1">
          {/* Undo */}
          <button
            type="button"
            onClick={() => toast.info("Undo timeline edit")}
            aria-label="Undo"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => toast.info("Redo timeline edit")}
            aria-label="Redo"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
            </svg>
          </button>

          <div className="mx-2 h-4 w-px bg-[#262330]" />

          {/* Trim */}
          <button
            type="button"
            onClick={() => toast.info("Drag timeline in/out handles to trim")}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
            </svg>
            <span>Trim</span>
          </button>

          {/* Split */}
          <button
            type="button"
            onClick={() => toast.info("Split clip at current playhead time")}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" />
              <path d="M8 8 4 12l4 4" />
              <path d="M16 8l4 4-4 4" />
            </svg>
            <span>Split</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => toast.info("Cut or delete segment")}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            </svg>
            <span>Delete</span>
          </button>
        </div>

        {/* Right Tools: Zoom & Fit */}
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          {/* Zoom Slider */}
          <div className="w-16 h-1 rounded-full bg-[#262330]">
            <div
              className="h-full rounded-full bg-[#7C3AED]"
              style={{ width: `${Math.min(100, Math.max(15, zoom * 30))}%` }}
            />
          </div>

          {/* Zoom In */}
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          <div className="mx-1 h-4 w-px bg-[#262330]" />

          {/* Fit */}
          <button
            type="button"
            onClick={() => toast.info("Zoom fitted to view")}
            className="flex items-center gap-1.5 rounded-lg border border-[#262330] bg-[#1A1722] px-2.5 py-1 text-xs font-medium text-white hover:border-[#7C3AED]/40"
          >
            <span>Fit</span>
            <svg className="h-3.5 w-3.5 text-[#6B6778]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tracks Container with Left Track Header & Right Timeline Grid */}
      <div className="relative flex">
        {/* Left Track Names Column */}
        <div className="w-[120px] shrink-0 border-r border-[#262330] bg-[#0F0E14] text-xs">
          <div className="h-7 border-b border-[#262330] px-3 py-1 text-[11px] font-mono text-[#6B6778]">
            Tracks
          </div>

          {/* Captions Track Label */}
          <div className="flex h-11 items-center justify-between border-b border-[#262330]/60 px-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">T</span>
              <span className="text-xs font-medium text-[#A19EAA]">Captions</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleTrack("captions")}
              className="text-[#6B6778] hover:text-white"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          {/* Video Track Label */}
          <div className="flex h-12 items-center justify-between border-b border-[#262330]/60 px-3">
            <div className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span className="text-xs font-medium text-[#A19EAA]">Video</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleTrack("video")}
              className="text-[#6B6778] hover:text-white"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          {/* Audio Track Label */}
          <div className="flex h-11 items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <span className="text-xs font-medium text-[#A19EAA]">Audio</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleTrack("audio")}
              className="text-[#6B6778] hover:text-white"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Timeline Canvas Tracks Area */}
        <div
          ref={rulerRef}
          onClick={handleSeekClick}
          className="relative flex-1 cursor-pointer overflow-hidden bg-[#0B0A0F]"
        >
          {/* Time Ruler */}
          <div className="relative h-7 border-b border-[#262330] bg-[#131118]/80">
            {rulerMarkers.map((label, idx) => {
              const leftPct = (idx / 5) * 96 + 2;
              return (
                <div
                  key={label}
                  className="absolute top-1 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${leftPct}%` }}
                >
                  <span className="font-mono text-[10px] text-[#6B6778]">{label}</span>
                  <div className="mt-0.5 h-1.5 w-px bg-[#262330]" />
                </div>
              );
            })}
          </div>

          {/* Track 1: Captions (Violet Segment Blocks) */}
          <div className="relative flex h-11 items-center border-b border-[#262330]/40 px-2">
            {trackVisibility.captions && (
              <div className="flex w-full items-center gap-2">
                {captionSegments.map((seg) => (
                  <div
                    key={seg.id}
                    className="flex h-7 items-center justify-center rounded-lg bg-[#7C3AED] px-3 font-medium text-white shadow-sm shadow-[#7C3AED]/30 transition-all hover:bg-[#8B5CF6]"
                  >
                    <span className="truncate text-xs">{seg.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Track 2: Video (Real Filmstrip Thumbnails) */}
          <div className="relative flex h-12 items-center border-b border-[#262330]/40 px-2 overflow-hidden">
            {trackVisibility.video && (
              <div className="flex items-center gap-1 w-full">
                {realThumbnails.length > 0 ? (
                  realThumbnails.map((thumb, idx) => (
                    <div
                      key={idx}
                      className="h-9 w-16 shrink-0 overflow-hidden rounded-md border border-[#262330] bg-black"
                    >
                      <img
                        src={thumb}
                        alt="video frame"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex h-9 w-full items-center justify-center rounded-md border border-[#262330] bg-[#1A1722]/50 text-[10px] text-[#A19EAA]">
                    Active Video Track ({totalDuration.toFixed(1)}s)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Track 3: Audio (Real Normalized Waveform Peaks) */}
          <div className="relative flex h-11 items-center px-2">
            {trackVisibility.audio && (
              <div className="flex h-7 w-full items-center rounded-lg bg-[#1A1722]/60 px-2 overflow-hidden">
                {realWaveformPeaks.length > 0 ? (
                  <div className="flex h-5 w-full items-center justify-between gap-[2px]">
                    {realWaveformPeaks.slice(0, 120).map((peak, idx) => (
                      <div
                        key={idx}
                        className="w-1 rounded-full bg-[#7C3AED]"
                        style={{ height: `${Math.max(15, peak * 100)}%` }}
                      />
                    ))}
                  </div>
                ) : (
                  <svg
                    className="h-4 w-full text-[#7C3AED]/70"
                    viewBox="0 0 500 40"
                    preserveAspectRatio="none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M0,20 Q20,5 40,20 T80,20 T120,5 T160,35 T200,10 T240,30 T280,5 T320,35 T360,15 T400,25 T440,8 T480,32 T500,20" />
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* Vertical Playhead Line */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-30 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${playheadPct}%` }}
          >
            <div className="h-3 w-3 rounded-full bg-white shadow-md shadow-black" />
            <div className="h-full w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
        </div>
      </div>

      {/* Floating Need Help Pill in bottom right corner */}
      <div className="absolute bottom-3 right-4 z-40">
        <button
          type="button"
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 rounded-full border border-[#262330] bg-[#1A1722] px-3 py-1.5 text-xs font-medium text-white shadow-xl transition-all hover:border-[#7C3AED]/50 hover:bg-[#262330]"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#262330] text-[10px] text-[#A19EAA]">
            ?
          </span>
          <span>Need help?</span>
        </button>
      </div>
    </footer>
  );
}
