import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

/* ---- Shared types ---- */

export type Aspect = "9:16" | "1:1" | "16:9";

export type ReframePreset = "center" | "blurred" | "split";

export type CaptionStyle =
  | "bold"
  | "classic"
  | "modern"
  | "minimal"
  | "neon"
  | "glow"
  | "outline"
  | "fade"
  // Legacy aliases for backward compatibility:
  | "hormozi"
  | "minimalist"
  | "typewriter";

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

export interface MediaItem {
  id: string;
  title: string;
  durationStr: string;
  durationSec: number;
  thumbnail: string;
  videoUrl: string;
}

export const ASPECTS: AspectConfig[] = [
  { id: "9:16", label: "9:16 Reel", hint: "Reels / TikTok / Shorts", w: 720, h: 1280 },
  { id: "1:1", label: "1:1 Square", hint: "Feed post", w: 720, h: 720 },
  { id: "16:9", label: "16:9 Wide", hint: "YouTube / landscape", w: 1280, h: 720 },
];

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "media-1",
    title: "Anime Creator",
    durationStr: "00:45",
    durationSec: 45,
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
    videoUrl: "/samples/podcast-snippet.mp4",
  },
  {
    id: "media-2",
    title: "City Skyline",
    durationStr: "01:12",
    durationSec: 72,
    thumbnail: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=400&auto=format&fit=crop&q=80",
    videoUrl: "/samples/tech-review.mp4",
  },
  {
    id: "media-3",
    title: "Desk Setup",
    durationStr: "00:28",
    durationSec: 28,
    thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80",
    videoUrl: "/samples/gaming-moment.mp4",
  },
  {
    id: "media-4",
    title: "Mountain Lake",
    durationStr: "00:36",
    durationSec: 36,
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80",
    videoUrl: "/samples/podcast-snippet.mp4",
  },
  {
    id: "media-5",
    title: "Puppy Joy",
    durationStr: "00:20",
    durationSec: 20,
    thumbnail: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80",
    videoUrl: "/samples/gaming-moment.mp4",
  },
];

export const CAPTION_PRESET_STYLES: Array<{
  id: CaptionStyle;
  label: string;
  preview: string;
}> = [
  { id: "classic", label: "Classic", preview: "Aa" },
  { id: "bold", label: "Bold", preview: "Aa" },
  { id: "modern", label: "Modern", preview: "Aa" },
  { id: "minimal", label: "Minimal", preview: "Aa" },
  { id: "neon", label: "Neon", preview: "Aa" },
  { id: "glow", label: "Glow", preview: "Ae" },
  { id: "outline", label: "Outline", preview: "Aa" },
  { id: "fade", label: "Fade", preview: "Aa" },
];

export const CAPTION_SWATCH_COLORS = [
  "#FFFFFF",
  "#FACC15",
  "#38BDF8",
  "#F472B6",
  "#4ADE80",
];

const MIN_CLIP = 0.3;

export function fmt(t: number): string {
  if (!isFinite(t)) return "00:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

export function fmtTimecode(t: number, total: number): string {
  return `${fmt(t)} / ${fmt(total)}`;
}

/* ---- Canvas rendering ---- */

export function roundRectPath(
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

export function drawComposed(
  ctx: CanvasRenderingContext2D,
  v: HTMLVideoElement,
  W: number,
  H: number,
  aspect: Aspect,
  caption?: CaptionState,
  watermark = true,
) {
  const vw = v.videoWidth || 16;
  const vh = v.videoHeight || 9;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0B0A0F";
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
    // blurred background
    ctx.save();
    try {
      ctx.filter = "blur(24px) saturate(1.2) brightness(0.75)";
    } catch {
      /* older browsers */
    }
    const s = Math.max(W / vw, H / vh) * 1.25;
    ctx.drawImage(v, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);
    ctx.restore();
    ctx.filter = "none";
    ctx.fillStyle = "rgba(11, 10, 15, 0.35)";
    ctx.fillRect(0, 0, W, H);
    drawContain();
  }

  // Kinetic Caption Overlay matching Mockup
  if (caption && caption.text.trim()) {
    ctx.save();
    const fs = Math.round(caption.fontSize * (W / 720));
    const fontFam = '"Inter", system-ui, sans-serif';

    const text = caption.text.trim();
    const lines = text.split("\n");
    const lineHeight = fs * 1.35;
    const totalHeight = lines.length * lineHeight;

    let baseY: number;
    if (caption.position === "top") baseY = H * 0.14;
    else if (caption.position === "bottom") baseY = H * 0.76;
    else baseY = (H - totalHeight) / 2;

    lines.forEach((line, lineIdx) => {
      const y = baseY + lineIdx * lineHeight;

      // Check if style is "bold" (with violet capsule highlight on the last word or 'Share.')
      if (caption.style === "bold" || caption.style === "hormozi") {
        ctx.font = `800 ${fs}px ${fontFam}`;
        const words = line.split(" ");
        // Measure total width to center properly
        let totalW = 0;
        const measured = words.map((w, idx) => {
          const isHighlight =
            w.toLowerCase().includes("share") ||
            idx === words.length - 1;
          const mw = ctx.measureText(w + " ").width;
          totalW += mw;
          return { word: w, isHighlight, w: mw };
        });

        let curX = (W - totalW) / 2;

        measured.forEach(({ word, isHighlight, w }) => {
          const pureW = ctx.measureText(word).width;
          if (isHighlight) {
            // Draw violet capsule
            ctx.fillStyle = "#7C3AED";
            roundRectPath(
              ctx,
              curX - fs * 0.15,
              y - fs * 0.85,
              pureW + fs * 0.3,
              fs * 1.15,
              fs * 0.22,
            );
            ctx.fill();
            // Drop shadow for text inside capsule
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(word, curX, y);
          } else {
            // Dark outline for punchy contrast
            ctx.strokeStyle = "rgba(0,0,0,0.85)";
            ctx.lineWidth = fs * 0.08;
            ctx.strokeText(word, curX, y);
            ctx.fillStyle = caption.color || "#FFFFFF";
            ctx.fillText(word, curX, y);
          }
          curX += w;
        });
      } else if (caption.style === "neon") {
        ctx.font = `700 ${fs}px ${fontFam}`;
        ctx.textAlign = "center";
        ctx.shadowColor = "#EC4899";
        ctx.shadowBlur = fs * 0.45;
        ctx.fillStyle = "#F472B6";
        ctx.fillText(line, W / 2, y);
        ctx.shadowColor = "#38BDF8";
        ctx.shadowBlur = fs * 0.2;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(line, W / 2, y);
        ctx.shadowBlur = 0;
      } else if (caption.style === "glow") {
        ctx.font = `700 ${fs}px ${fontFam}`;
        ctx.textAlign = "center";
        ctx.shadowColor = "#8B5CF6";
        ctx.shadowBlur = fs * 0.6;
        ctx.fillStyle = "#EDE9FE";
        ctx.fillText(line, W / 2, y);
        ctx.shadowBlur = 0;
      } else if (caption.style === "outline") {
        ctx.font = `800 ${fs}px ${fontFam}`;
        ctx.textAlign = "center";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = Math.max(3, fs * 0.06);
        ctx.strokeText(line, W / 2, y);
      } else if (caption.style === "modern") {
        ctx.font = `600 ${fs}px ${fontFam}`;
        ctx.textAlign = "center";
        const tw = ctx.measureText(line).width;
        ctx.fillStyle = "rgba(19, 17, 24, 0.75)";
        roundRectPath(
          ctx,
          W / 2 - tw / 2 - fs * 0.3,
          y - fs * 0.85,
          tw + fs * 0.6,
          fs * 1.15,
          fs * 0.25,
        );
        ctx.fill();
        ctx.fillStyle = caption.color || "#FFFFFF";
        ctx.fillText(line, W / 2, y);
      } else if (caption.style === "minimal" || caption.style === "minimalist") {
        ctx.font = `400 italic ${fs * 0.95}px serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillText(line, W / 2 + 1, y + 1);
        ctx.fillStyle = caption.color || "#FFFFFF";
        ctx.fillText(line, W / 2, y);
      } else if (caption.style === "fade") {
        ctx.font = `600 ${fs}px ${fontFam}`;
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.fillText(line, W / 2, y);
      } else {
        // Classic
        ctx.font = `700 ${fs}px ${fontFam}`;
        ctx.textAlign = "center";
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.lineWidth = fs * 0.08;
        ctx.strokeText(line, W / 2, y);
        ctx.fillStyle = caption.color || "#FFFFFF";
        ctx.fillText(line, W / 2, y);
      }
    });

    ctx.restore();
  }

  // Discreet Studio Watermark
  if (watermark) {
    ctx.save();
    const fs = Math.max(12, W * 0.024);
    ctx.font = `600 ${fs}px "Inter", sans-serif`;
    const text = "SnipPug";
    const tw = ctx.measureText(text).width;
    const px = fs * 0.6;
    const bx = W - tw - px * 2 - fs;
    const by = H - fs * 2.2;
    ctx.fillStyle = "rgba(11, 10, 15, 0.7)";
    roundRectPath(ctx, bx, by, tw + px * 2, fs * 1.7, fs * 0.4);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(text, bx + px, by + fs * 1.15);
    ctx.restore();
  }
}

/* ---- Main state hook ---- */

export function useStudioState() {
  // Source
  const [src, setSrc] = useState<string | null>(
    INITIAL_MEDIA_ITEMS[0].videoUrl,
  );
  const [fileName, setFileName] = useState("Anime Creator");
  const [duration, setDuration] = useState(45);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Active Media Item Selection
  const [selectedMediaId, setSelectedMediaId] = useState<string>("media-1");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA_ITEMS);

  // Editing
  const [inPt, setInPt] = useState(0);
  const [outPt, setOutPt] = useState(45);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [reframe, setReframe] = useState<ReframePreset>("blurred");
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [resolution, setResolution] = useState<"1080p" | "4K" | "720p">("1080p");

  // Caption State matching Mockup
  const [caption, setCaption] = useState<CaptionState>({
    text: "Build. Edit. Share.",
    style: "bold",
    position: "bottom",
    fontSize: 64,
    color: "#FFFFFF",
  });
  const [autoCaptions, setAutoCaptions] = useState(true);
  const [language, setLanguage] = useState("English");
  const [fontFamily, setFontFamily] = useState("Inter");

  // Multi-track Timeline State
  const [trackVisibility, setTrackVisibility] = useState({
    captions: true,
    video: true,
    audio: true,
  });

  const [captionSegments, setCaptionSegments] = useState([
    { id: "seg-1", text: "Build. Edit. Share.", start: 0, end: 5.5 },
    { id: "seg-2", text: "Create stunning captions", start: 6.0, end: 11.0 },
    { id: "seg-3", text: "in seconds!", start: 11.5, end: 15.0 },
    { id: "seg-4", text: "With SnipPug", start: 15.5, end: 23.0 },
  ]);

  // Export
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: "mp4",
    resolution: "1080p",
    quality: 90,
    includeAudio: true,
    watermark: false,
  });

  // Snip queue
  const [snipQueue, setSnipQueue] = useState<SnipItem[]>([]);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // UI state
  const [leftSidebarTab, setLeftSidebarTab] = useState<
    "media" | "text" | "elements" | "audio" | "uploads"
  >("media");
  const [rightSidebarTab, setRightSidebarTab] = useState<
    "captions" | "style" | "effects" | "adjust"
  >("captions");
  const [activeNavTab, setActiveNavTab] = useState<
    "home" | "projects" | "templates" | "brand" | "settings"
  >("projects");

  const [sfxVolume, setSfxVolume] = useState(0.7);
  const [dragOver, setDragOver] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cancelRef = useRef(false);

  const aspectCfg = ASPECTS.find((a) => a.id === aspect) ?? ASPECTS[0];

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
        toast.error("Please upload an MP4, MOV, or WebM video.");
        return;
      }
      const url = URL.createObjectURL(file);
      const newMedia: MediaItem = {
        id: `upload-${Date.now()}`,
        title: file.name.slice(0, 20),
        durationStr: "00:30",
        durationSec: 30,
        thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80",
        videoUrl: url,
      };
      setMediaItems((prev) => [newMedia, ...prev]);
      setSelectedMediaId(newMedia.id);
      loadSource(url, file.name, src ?? undefined);
      toast.success(`Loaded ${file.name}`);
    },
    [loadSource, src],
  );

  const selectMediaItem = useCallback(
    (item: MediaItem) => {
      setSelectedMediaId(item.id);
      loadSource(item.videoUrl, item.title, src ?? undefined);
      toast.success(`Switched to "${item.title}"`);
    },
    [loadSource, src],
  );

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const d = v.duration || 45;
    setDuration(d);
    setInPt(0);
    setOutPt(d);
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
      if (!v) return;
      v.currentTime = Math.min(Math.max(0, t), duration);
      setTime(v.currentTime);
    },
    [duration],
  );

  const toggleTrackVisibility = useCallback(
    (track: "captions" | "video" | "audio") => {
      setTrackVisibility((prev) => ({
        ...prev,
        [track]: !prev[track],
      }));
    },
    [],
  );

  const zoomIn = useCallback(() => {
    setTimelineZoom((z) => Math.min(z * 1.25, 4));
  }, []);

  const zoomOut = useCallback(() => {
    setTimelineZoom((z) => Math.max(z / 1.25, 0.5));
  }, []);

  /* ---- Snip Queue Operations ---- */
  const addSnip = useCallback(() => {
    if (!src || duration <= 0) return;
    const canvas = canvasRef.current;
    const thumb = canvas ? canvas.toDataURL("image/jpeg", 0.6) : "";

    const item: SnipItem = {
      id: `snip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      inPoint: inPt,
      outPoint: outPt,
      aspectRatio: aspect,
      thumbnail: thumb,
      captionText: caption.text,
      captionStyle: caption.style,
    };

    setSnipQueue((prev) => [...prev, item]);
    toast.success("Added clip to export queue!");
  }, [src, duration, inPt, outPt, aspect, caption]);

  const removeSnip = useCallback((id: string) => {
    setSnipQueue((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    src,
    fileName,
    duration,
    time,
    setTime,
    playing,
    setPlaying,
    inPt,
    setInPt,
    outPt,
    setOutPt,
    aspect,
    setAspect,
    aspectCfg,
    reframe,
    setReframe,
    resolution,
    setResolution,
    timelineZoom,
    setTimelineZoom,
    zoomIn,
    zoomOut,
    caption,
    setCaption,
    autoCaptions,
    setAutoCaptions,
    language,
    setLanguage,
    fontFamily,
    setFontFamily,
    exportConfig,
    setExportConfig,
    snipQueue,
    addSnip,
    removeSnip,
    exporting,
    setExporting,
    exportProgress,
    setExportProgress,
    leftSidebarTab,
    setLeftSidebarTab,
    rightSidebarTab,
    setRightSidebarTab,
    activeNavTab,
    setActiveNavTab,
    sfxVolume,
    setSfxVolume,
    dragOver,
    setDragOver,
    selectedMediaId,
    mediaItems,
    selectMediaItem,
    trackVisibility,
    toggleTrackVisibility,
    captionSegments,
    setCaptionSegments,
    videoRef,
    canvasRef,
    cancelRef,
    loadSource,
    loadFile,
    onLoadedMetadata,
    togglePlay,
    markIn,
    markOut,
    nudge,
    seekTo,
  };
}

export type StudioState = ReturnType<typeof useStudioState>;
