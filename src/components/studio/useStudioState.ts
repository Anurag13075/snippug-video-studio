import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

/* ---- Shared types ---- */

export type Aspect = "9:16" | "1:1" | "16:9";

export type ReframePreset = "center" | "blurred" | "split";

export type CaptionStyle = "hormozi" | "minimalist" | "typewriter" | "neon";

export type CaptionPosition = "top" | "center" | "bottom";

export interface CaptionState {
  text: string;
  style: CaptionStyle;
  position: CaptionPosition;
  fontSize: number;
  color: string;
}

export interface SnipItem {
  id: string;
  inPoint: number;
  outPoint: number;
  aspectRatio: Aspect;
  thumbnail: string;
  captionText: string;
  captionStyle: CaptionStyle;
}

export interface ExportConfig {
  format: "webm" | "mp4";
  resolution: "720p" | "1080p";
  quality: number;
  includeAudio: boolean;
  watermark: boolean;
}

export interface AspectConfig {
  id: Aspect;
  label: string;
  hint: string;
  w: number;
  h: number;
}

export const ASPECTS: AspectConfig[] = [
  { id: "9:16", label: "9:16 Reel", hint: "Reels / TikTok / Shorts", w: 720, h: 1280 },
  { id: "1:1", label: "1:1 Square", hint: "Feed post", w: 720, h: 720 },
  { id: "16:9", label: "16:9 Wide", hint: "YouTube / landscape", w: 1280, h: 720 },
];

export const SAMPLES = [
  { id: "podcast-snippet", title: "Podcast snippet", emoji: "🎙️", file: "/samples/podcast-snippet.mp4" },
  { id: "tech-review", title: "Tech review", emoji: "📷", file: "/samples/tech-review.mp4" },
  { id: "gaming-moment", title: "Gaming moment", emoji: "🎮", file: "/samples/gaming-moment.mp4" },
];

export const CAPTION_COLORS = [
  "#FFFFFF", "#FFFC00", "#FF6B35", "#E0526E",
  "#00D4FF", "#69B578", "#9A6BD0", "#1A1612",
];

const MIN_CLIP = 0.3;

export function fmt(t: number): string {
  if (!isFinite(t)) return "0:00.0";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s < 10 ? "0" : ""}${s.toFixed(1)}`;
}

/* ---- Canvas rendering ---- */

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
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

export function drawComposed(
  ctx: CanvasRenderingContext2D,
  v: HTMLVideoElement,
  W: number, H: number,
  aspect: Aspect,
  caption?: CaptionState,
  watermark = true,
) {
  const vw = v.videoWidth || 16;
  const vh = v.videoHeight || 9;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#181310";
  ctx.fillRect(0, 0, W, H);

  const drawCover = () => {
    const s = Math.max(W / vw, H / vh);
    const w2 = vw * s;
    const h2 = vh * s;
    ctx.drawImage(v, (W - w2) / 2, (H - h2) / 2, w2, h2);
  };
  const drawContain = () => {
    const s = Math.min(W / vw, H / vh);
    const w2 = vw * s;
    const h2 = vh * s;
    ctx.drawImage(v, (W - w2) / 2, (H - h2) / 2, w2, h2);
  };

  if (aspect === "16:9") {
    drawCover();
  } else {
    // blurred backdrop
    ctx.save();
    try { ctx.filter = "blur(28px) saturate(1.25) brightness(0.85)"; } catch { /* older browsers */ }
    const s = Math.max(W / vw, H / vh) * 1.35;
    ctx.drawImage(v, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);
    ctx.restore();
    ctx.filter = "none";
    ctx.fillStyle = "rgba(12, 9, 7, 0.18)";
    ctx.fillRect(0, 0, W, H);
    drawContain();

    if (aspect === "9:16") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 252, 246, 0.85)";
      ctx.lineWidth = Math.max(4, W * 0.008);
      roundRectPath(ctx, W * 0.045, H * 0.028, W * 0.91, H * 0.944, W * 0.07);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Caption overlay
  if (caption && caption.text.trim()) {
    ctx.save();
    const fs = caption.fontSize * (W / 720);
    let fontFamily = '"Instrument Sans", sans-serif';
    let fontWeight = "700";
    let fontStyle = "";

    switch (caption.style) {
      case "hormozi":
        fontWeight = "800";
        break;
      case "minimalist":
        fontFamily = '"Instrument Serif", serif';
        fontWeight = "400";
        fontStyle = "italic ";
        break;
      case "typewriter":
        fontFamily = '"Courier New", monospace';
        fontWeight = "600";
        break;
      case "neon":
        fontWeight = "700";
        break;
    }

    ctx.font = `${fontStyle}${fontWeight} ${fs}px ${fontFamily}`;
    ctx.textAlign = "center";

    const lines = caption.text.split("\n");
    const lineHeight = fs * 1.3;
    const totalHeight = lines.length * lineHeight;

    let baseY: number;
    if (caption.position === "top") baseY = H * 0.12;
    else if (caption.position === "bottom") baseY = H - totalHeight - H * 0.08;
    else baseY = (H - totalHeight) / 2;

    lines.forEach((line, i) => {
      const y = baseY + i * lineHeight + fs;
      const tw = ctx.measureText(line).width;

      if (caption.style === "hormozi") {
        ctx.fillStyle = "rgba(255, 252, 0, 0.9)";
        roundRectPath(ctx, W / 2 - tw / 2 - fs * 0.4, y - fs * 0.85, tw + fs * 0.8, fs * 1.2, fs * 0.2);
        ctx.fill();
        ctx.fillStyle = "#1a1612";
        ctx.fillText(line, W / 2, y);
      } else if (caption.style === "neon") {
        ctx.shadowColor = caption.color;
        ctx.shadowBlur = fs * 0.5;
        ctx.fillStyle = caption.color;
        ctx.fillText(line, W / 2, y);
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = fs * 0.08;
        ctx.strokeText(line, W / 2, y);
        ctx.fillStyle = caption.color;
        ctx.fillText(line, W / 2, y);
      }
    });
    ctx.restore();
  }

  // Watermark
  if (watermark) {
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
}

/* ---- Main state hook ---- */

export function useStudioState() {
  // Source
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("untitled");
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Editing
  const [inPt, setInPt] = useState(0);
  const [outPt, setOutPt] = useState(0);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [reframe, setReframe] = useState<ReframePreset>("blurred");
  const [timelineZoom, setTimelineZoom] = useState(1);

  // Caption
  const [caption, setCaption] = useState<CaptionState>({
    text: "",
    style: "hormozi",
    position: "bottom",
    fontSize: 36,
    color: "#FFFFFF",
  });

  // Export
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: "webm",
    resolution: "720p",
    quality: 80,
    includeAudio: true,
    watermark: true,
  });

  // Snip queue
  const [snipQueue, setSnipQueue] = useState<SnipItem[]>([]);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // UI state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(0.7);

  // Drag
  const [dragOver, setDragOver] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cancelRef = useRef(false);

  const aspectCfg = ASPECTS.find((a) => a.id === aspect)!;

  /* ---- Loading ---- */
  const loadSource = useCallback(
    (url: string, label: string, revokeOld?: string) => {
      if (revokeOld && revokeOld.startsWith("blob:")) URL.revokeObjectURL(revokeOld);
      setSrc(url);
      setFileName(label.replace(/\.[^.]+$/, "").slice(0, 40) || "clip");
      setDuration(0);
      setTime(0);
      setInPt(0);
      setOutPt(0);
      setPlaying(false);
      setExportProgress(0);
    },
    [],
  );

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v)$/i.test(file.name)) {
        toast.error("That doesn't look like a video. Try MP4, WebM or MOV.");
        return;
      }
      loadSource(URL.createObjectURL(file), file.name, src ?? undefined);
      toast.success(`Loaded ${file.name}`);
    },
    [loadSource, src],
  );

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const d = v.duration || 0;
    setDuration(d);
    setInPt(0);
    setOutPt(Math.min(d, 8) || 0);
    setTime(0);
  }, []);

  /* ---- Playback ---- */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (v.paused) void v.play();
    else v.pause();
  }, [src]);

  const markIn = useCallback(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    const t = v.currentTime;
    setInPt(Math.min(t, outPt - MIN_CLIP > 0 ? outPt - MIN_CLIP : duration || t));
  }, [outPt, src, duration]);

  const markOut = useCallback(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    const t = v.currentTime;
    setOutPt(Math.max(t, inPt + MIN_CLIP));
  }, [inPt, src]);

  const nudge = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v || !src) return;
      v.currentTime = Math.min(Math.max(0, v.currentTime + delta), duration);
      setTime(v.currentTime);
    },
    [duration, src],
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

  /* ---- Snip queue ---- */
  const addSnip = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !src) return;
    if (outPt - inPt < MIN_CLIP) {
      toast.error("Select at least 0.3s before snipping.");
      return;
    }

    // capture thumbnail
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 160;
    thumbCanvas.height = 90;
    const tc = thumbCanvas.getContext("2d")!;
    tc.drawImage(v, 0, 0, 160, 90);
    const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.6);

    const snip: SnipItem = {
      id: `snip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      inPoint: inPt,
      outPoint: outPt,
      aspectRatio: aspect,
      thumbnail,
      captionText: caption.text,
      captionStyle: caption.style,
    };

    setSnipQueue((q) => [...q, snip]);
    toast.success(`Snip added: ${fmt(inPt)} → ${fmt(outPt)}`);
  }, [src, inPt, outPt, aspect, caption.text, caption.style]);

  const removeSnip = useCallback((id: string) => {
    setSnipQueue((q) => q.filter((s) => s.id !== id));
  }, []);

  /* ---- Zoom ---- */
  const zoomIn = useCallback(() => setTimelineZoom((z) => Math.min(z * 1.5, 10)), []);
  const zoomOut = useCallback(() => setTimelineZoom((z) => Math.max(z / 1.5, 0.5)), []);

  return {
    // Source
    src, fileName, duration, time, setTime, playing, setPlaying,
    // Editing
    inPt, setInPt, outPt, setOutPt, aspect, setAspect, reframe, setReframe,
    timelineZoom, setTimelineZoom,
    // Caption
    caption, setCaption,
    // Export
    exportConfig, setExportConfig,
    exporting, setExporting, exportProgress, setExportProgress,
    // Snip queue
    snipQueue, setSnipQueue, addSnip, removeSnip,
    // UI
    leftSidebarOpen, setLeftSidebarOpen, rightSidebarOpen, setRightSidebarOpen,
    sfxVolume, setSfxVolume, dragOver, setDragOver,
    // Refs
    videoRef, canvasRef, cancelRef,
    // Computed
    aspectCfg,
    // Actions
    loadSource, loadFile, onLoadedMetadata,
    togglePlay, markIn, markOut, nudge, seekTo,
    zoomIn, zoomOut,
  };
}

export type StudioState = ReturnType<typeof useStudioState>;
