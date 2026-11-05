import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { getMediaFile, getProject, saveProject, type StoredProject } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/clips/$runId")({
  component: ReactionStudioPage,
});

type LayoutMode = "split-top-bottom" | "split-bottom-top" | "pip-bottom-right" | "side-by-side";

function ReactionStudioPage() {
  const { runId } = useParams({ from: "/app/clips/$runId" });

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<StoredProject | null>(null);

  // Video Sources
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [reactionUrl, setReactionUrl] = useState<string>("");

  // Playback & Sync State
  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const reactionVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // Reaction Studio Layout & Audio Controls
  const [layout, setLayout] = useState<LayoutMode>("split-top-bottom");
  const [sourceVolume, setSourceVolume] = useState<number>(40);
  const [reactionVolume, setReactionVolume] = useState<number>(100);

  // Captions & Subtitles
  const [captionText, setCaptionText] = useState("Wait... did he just say that?! 🤯");
  const [captionStyle, setCaptionStyle] = useState<"bold" | "yellow" | "minimal">("bold");
  const [showCaptions, setShowCaptions] = useState(true);

  // Exporter State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Canvas composite ref for preview/export
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── 1. Load project directly from local storage (NO PIPELINE DELAY) ──
  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      setLoading(true);
      try {
        const proj = await getProject(runId);
        if (proj) {
          setProject(proj);
          if (proj.layout) setLayout(proj.layout as LayoutMode);
          if (proj.sourceVolume !== undefined) setSourceVolume(proj.sourceVolume);
          if (proj.reactionVolume !== undefined) setReactionVolume(proj.reactionVolume);
          if (proj.duration) setDuration(proj.duration);
        }

        // 1. Fetch Source Video
        let sBlob = await getMediaFile(`source_${runId}`);
        if (!sBlob) sBlob = await getMediaFile(runId);
        if (!sBlob) {
          const res = await fetch("/samples/tech-review.mp4");
          sBlob = await res.blob();
        }

        // 2. Fetch Reaction Video
        let rBlob = await getMediaFile(`reaction_${runId}`);
        if (!rBlob) {
          const res = await fetch("/samples/podcast-snippet.mp4");
          rBlob = await res.blob();
        }

        if (cancelled) return;

        setSourceUrl(URL.createObjectURL(sBlob));
        setReactionUrl(URL.createObjectURL(rBlob));
        setLoading(false);
      } catch (err) {
        console.error("Load error:", err);
        setLoading(false);
      }
    }

    void loadProject();

    return () => {
      cancelled = true;
    };
  }, [runId]);

  // Sync Volume to video elements
  useEffect(() => {
    if (sourceVideoRef.current) {
      sourceVideoRef.current.volume = sourceVolume / 100;
    }
  }, [sourceVolume]);

  useEffect(() => {
    if (reactionVideoRef.current) {
      reactionVideoRef.current.volume = reactionVolume / 100;
    }
  }, [reactionVolume]);

  // Synchronize Playback
  const togglePlay = () => {
    const s = sourceVideoRef.current;
    const r = reactionVideoRef.current;
    if (!s || !r) return;

    if (isPlaying) {
      s.pause();
      r.pause();
      setIsPlaying(false);
    } else {
      // align time before playing
      r.currentTime = s.currentTime;
      void s.play();
      void r.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (sourceVideoRef.current) sourceVideoRef.current.currentTime = newTime;
    if (reactionVideoRef.current) reactionVideoRef.current.currentTime = newTime;
  };

  // Keep time synced on update
  const handleTimeUpdate = () => {
    const s = sourceVideoRef.current;
    const r = reactionVideoRef.current;
    if (!s) return;

    setCurrentTime(s.currentTime);

    // If source ends or loops
    if (s.currentTime >= duration || s.ended) {
      s.currentTime = 0;
      if (r) r.currentTime = 0;
      void s.play();
      if (r) void r.play();
    }
  };

  // Quick Preset: Audio Ducking
  const handleDuckAudio = () => {
    setSourceVolume(20);
    setReactionVolume(100);
    toast.success("Audio Ducked: Background set to 20%, Reaction voice 100%");
  };

  // Save Settings
  const handleSaveSettings = async (newLayout: LayoutMode) => {
    setLayout(newLayout);
    if (project) {
      const updated = {
        ...project,
        layout: newLayout,
        sourceVolume,
        reactionVolume,
        updatedAt: Date.now(),
      };
      setProject(updated);
      await saveProject(updated);
    }
  };

  // ── Render & Export Split Video Directly In Browser ──
  const handleExportReactionShort = async () => {
    const s = sourceVideoRef.current;
    const r = reactionVideoRef.current;
    if (!s || !r) return;

    setIsExporting(true);
    setExportProgress(5);

    try {
      const W = 720;
      const H = 1280;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize export canvas");

      // Set playback to 0
      s.pause();
      r.pause();
      s.currentTime = 0;
      r.currentTime = 0;

      await new Promise<void>((resolve) => setTimeout(resolve, 300));

      const stream = canvas.captureStream(30);

      // Mix Audio from both videos
      try {
        const audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();

        const sSrc = audioCtx.createMediaElementSource(s);
        const sGain = audioCtx.createGain();
        sGain.gain.value = sourceVolume / 100;
        sSrc.connect(sGain);
        sGain.connect(dest);
        sGain.connect(audioCtx.destination);

        const rSrc = audioCtx.createMediaElementSource(r);
        const rGain = audioCtx.createGain();
        rGain.gain.value = reactionVolume / 100;
        rSrc.connect(rGain);
        rGain.connect(dest);
        rGain.connect(audioCtx.destination);

        dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      } catch {
        /* audio routing fallback */
      }

      const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
        ? "video/mp4;codecs=avc1"
        : "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_500_000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordDone = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
      });

      recorder.start(100);
      await s.play();
      await r.play();

      const totalSec = Math.min(duration, s.duration || duration);

      await new Promise<void>((resolve) => {
        let raf = 0;
        const renderFrame = () => {
          const t = s.currentTime;
          const pct = Math.min(100, Math.max(0, Math.round((t / totalSec) * 100)));
          setExportProgress(pct);

          // Clear
          ctx.fillStyle = "#0c0c0e";
          ctx.fillRect(0, 0, W, H);

          // Draw Layout
          if (layout === "split-top-bottom") {
            // Source on top half
            ctx.drawImage(s, 0, 0, W, H / 2);
            // Reaction on bottom half
            ctx.drawImage(r, 0, H / 2, W, H / 2);
            // Divider
            ctx.fillStyle = "#2563EB";
            ctx.fillRect(0, H / 2 - 2, W, 4);
          } else if (layout === "split-bottom-top") {
            ctx.drawImage(r, 0, 0, W, H / 2);
            ctx.drawImage(s, 0, H / 2, W, H / 2);
            ctx.fillStyle = "#2563EB";
            ctx.fillRect(0, H / 2 - 2, W, 4);
          } else if (layout === "pip-bottom-right") {
            // Source fills canvas
            ctx.drawImage(s, 0, 0, W, H);
            // Reaction in rounded circle bubble in bottom right
            const size = 260;
            const x = W - size - 30;
            const y = H - size - 80;
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(r, x, y, size, size);
            ctx.restore();
            // Border around bubble
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.strokeStyle = "#2563EB";
            ctx.lineWidth = 6;
            ctx.stroke();
          } else {
            // Side-by-side
            ctx.drawImage(s, 0, 0, W / 2, H);
            ctx.drawImage(r, W / 2, 0, W / 2, H);
            ctx.fillStyle = "#2563EB";
            ctx.fillRect(W / 2 - 2, 0, 4, H);
          }

          // Burn captions if enabled
          if (showCaptions && captionText) {
            ctx.font = "bold 38px Inter, sans-serif";
            ctx.textAlign = "center";
            const textY = H - 140;
            const textWidth = ctx.measureText(captionText).width;

            // Background pill
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.beginPath();
            ctx.roundRect(W / 2 - textWidth / 2 - 20, textY - 38, textWidth + 40, 52, 12);
            ctx.fill();

            // Text
            ctx.fillStyle = captionStyle === "yellow" ? "#FBBF24" : "#FFFFFF";
            ctx.fillText(captionText, W / 2, textY);
          }

          if (t >= totalSec || s.ended) {
            cancelAnimationFrame(raf);
            resolve();
          } else {
            raf = requestAnimationFrame(renderFrame);
          }
        };
        raf = requestAnimationFrame(renderFrame);
      });

      recorder.stop();
      s.pause();
      r.pause();

      const blob = await recordDone;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reaction_${runId}.mp4`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Reaction short exported successfully! Ready for TikTok & Shorts.");
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/20 text-xl text-[#2563EB] animate-spin">
          ⚡
        </div>
        <p className="mt-3 text-xs text-[#8e8e93]">Opening Reaction Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e1e24] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#232328] bg-[#141417] text-xs text-[#8e8e93] hover:text-white"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">
                {project?.name || "Reaction Studio"}
              </h1>
              <span className="rounded-md bg-[#2563EB]/20 px-2 py-0.5 text-[10px] font-semibold text-[#60A5FA]">
                9:16 Short
              </span>
            </div>
            <p className="text-xs text-[#71717a] mt-0.5">
              Split-screen layout with synchronized commentary and audio mixing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDuckAudio}
            className="rounded-xl border border-[#232328] bg-[#141417] px-3 py-2 text-xs font-medium text-[#f4f4f5] hover:border-[#3f3f46] hover:bg-[#1a1a1e] transition-colors"
          >
            🦆 Duck Audio
          </button>
          <button
            type="button"
            onClick={handleExportReactionShort}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#2563EB]/25 hover:bg-[#1D4ED8] transition-all disabled:opacity-50"
          >
            <span>⬇️</span>
            <span>{isExporting ? `Exporting (${exportProgress}%)` : "Export 9:16 Short"}</span>
          </button>
        </div>
      </div>

      {/* Exporting Progress Modal Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#232328] bg-[#141417] p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/20 text-2xl text-[#60A5FA] animate-bounce">
              🎬
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rendering Reaction Short</h3>
              <p className="text-xs text-[#8e8e93]">
                Compositing dual video split, mixing audio, and burning subtitles...
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#232328]">
              <div
                className="h-full bg-[#2563EB] transition-all duration-150"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <div className="text-xs font-mono text-[#60A5FA] font-bold">
              {exportProgress}%
            </div>
          </div>
        </div>
      )}

      {/* ── WORKSPACE GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 9:16 CANVAS PREVIEW */}
        <div className="lg:col-span-6 flex flex-col items-center">
          {/* 9:16 Frame Container */}
          <div className="relative aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-3xl border border-[#232328] bg-black shadow-2xl select-none">
            {/* Visual Layout Preview */}
            {layout === "split-top-bottom" && (
              <div className="flex h-full w-full flex-col">
                {/* Top Half: Source Video */}
                <div className="relative h-1/2 w-full overflow-hidden bg-black">
                  <video
                    ref={sourceVideoRef}
                    src={sourceUrl}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-[#93C5FD]">
                    SOURCE
                  </span>
                </div>

                {/* Divider Line */}
                <div className="h-1 w-full bg-[#2563EB]" />

                {/* Bottom Half: Reaction Video */}
                <div className="relative h-1/2 w-full overflow-hidden bg-black">
                  <video
                    ref={reactionVideoRef}
                    src={reactionUrl}
                    playsInline
                    className="h-full w-full object-cover -scale-x-100"
                  />
                  <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-[#F43F5E]">
                    REACTION 🎙️
                  </span>
                </div>
              </div>
            )}

            {layout === "split-bottom-top" && (
              <div className="flex h-full w-full flex-col">
                <div className="relative h-1/2 w-full overflow-hidden bg-black">
                  <video
                    ref={reactionVideoRef}
                    src={reactionUrl}
                    playsInline
                    className="h-full w-full object-cover -scale-x-100"
                  />
                  <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-[#F43F5E]">
                    REACTION 🎙️
                  </span>
                </div>
                <div className="h-1 w-full bg-[#2563EB]" />
                <div className="relative h-1/2 w-full overflow-hidden bg-black">
                  <video
                    ref={sourceVideoRef}
                    src={sourceUrl}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-[#93C5FD]">
                    SOURCE
                  </span>
                </div>
              </div>
            )}

            {layout === "pip-bottom-right" && (
              <div className="relative h-full w-full overflow-hidden bg-black">
                {/* Fullbleed Source */}
                <video
                  ref={sourceVideoRef}
                  src={sourceUrl}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  className="h-full w-full object-cover"
                />

                {/* Floating PiP Reaction Bubble */}
                <div className="absolute bottom-16 right-4 h-28 w-28 overflow-hidden rounded-full border-2 border-[#2563EB] shadow-2xl bg-black">
                  <video
                    ref={reactionVideoRef}
                    src={reactionUrl}
                    playsInline
                    className="h-full w-full object-cover -scale-x-100"
                  />
                </div>
              </div>
            )}

            {layout === "side-by-side" && (
              <div className="flex h-full w-full">
                <div className="relative h-full w-1/2 overflow-hidden bg-black">
                  <video
                    ref={sourceVideoRef}
                    src={sourceUrl}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="w-1 h-full bg-[#2563EB]" />
                <div className="relative h-full w-1/2 overflow-hidden bg-black">
                  <video
                    ref={reactionVideoRef}
                    src={reactionUrl}
                    playsInline
                    className="h-full w-full object-cover -scale-x-100"
                  />
                </div>
              </div>
            )}

            {/* Kinetic Caption Overlay */}
            {showCaptions && captionText && (
              <div className="absolute inset-x-3 bottom-6 flex justify-center pointer-events-none">
                <span
                  className={cn(
                    "rounded-xl bg-black/80 px-3 py-1.5 text-center text-xs font-bold shadow-lg backdrop-blur-xs",
                    captionStyle === "yellow" ? "text-[#FBBF24]" : "text-white",
                  )}
                >
                  {captionText}
                </span>
              </div>
            )}

            {/* Play Button Overlay */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-transform hover:scale-110 border border-white/20 shadow-2xl"
              >
                <span className="text-xl ml-0.5">▶</span>
              </button>
            )}
          </div>

          {/* Scrubbing & Controls Bar */}
          <div className="mt-4 w-full max-w-[340px] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#71717a]">
              <span>{Math.floor(currentTime)}s</span>
              <span>{Math.round(duration)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={togglePlay}
                className="rounded-xl border border-[#232328] bg-[#141417] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1f1f23]"
              >
                {isPlaying ? "❚❚ Pause" : "▶ Play Reaction"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REACTION STUDIO SETTINGS PANEL */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Layout Mode Switcher */}
          <div className="rounded-3xl border border-[#232328] bg-[#141417] p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#71717a]">
              Layout Format
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "split-top-bottom" as const, label: "Top & Bottom (Standard)", icon: "↕️" },
                { id: "pip-bottom-right" as const, label: "Floating Bubble (PiP)", icon: "🔘" },
                { id: "split-bottom-top" as const, label: "Bottom & Top", icon: "🔄" },
                { id: "side-by-side" as const, label: "Side-by-Side (50/50)", icon: "↔️" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSaveSettings(m.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all text-left",
                    layout === m.id
                      ? "border-[#2563EB] bg-[#2563EB]/15 text-white"
                      : "border-[#232328] bg-[#18181c] text-[#8e8e93] hover:text-white",
                  )}
                >
                  <span>{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Audio Mixer (Volume & Ducking) */}
          <div className="rounded-3xl border border-[#232328] bg-[#141417] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#71717a]">
                Audio Mixer
              </h3>
              <button
                type="button"
                onClick={handleDuckAudio}
                className="text-[11px] text-[#60A5FA] hover:underline"
              >
                Auto-Duck Voice
              </button>
            </div>

            {/* Source Video Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8e8e93]">🔊 Video to React To Volume</span>
                <span className="font-mono text-white">{sourceVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={sourceVolume}
                onChange={(e) => setSourceVolume(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
            </div>

            {/* Reaction Mic Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8e8e93]">🎙️ Your Voice (Reaction) Volume</span>
                <span className="font-mono text-white">{reactionVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={reactionVolume}
                onChange={(e) => setReactionVolume(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Subtitles & Caption Customization */}
          <div className="rounded-3xl border border-[#232328] bg-[#141417] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#71717a]">
                Reaction Subtitles
              </h3>
              <label className="flex items-center gap-2 text-xs text-[#8e8e93] cursor-pointer">
                <span>Enable</span>
                <input
                  type="checkbox"
                  checked={showCaptions}
                  onChange={(e) => setShowCaptions(e.target.checked)}
                  className="accent-[#2563EB]"
                />
              </label>
            </div>

            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="Enter on-screen reaction hook..."
              className="w-full rounded-xl border border-[#232328] bg-[#18181c] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2563EB]"
            />

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: "bold" as const, label: "Bold White" },
                { id: "yellow" as const, label: "Viral Yellow" },
                { id: "minimal" as const, label: "Minimal" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setCaptionStyle(st.id)}
                  className={cn(
                    "rounded-xl border py-1.5 text-center text-xs font-medium transition-colors",
                    captionStyle === st.id
                      ? "border-[#2563EB] bg-[#2563EB]/20 text-white"
                      : "border-[#232328] bg-[#18181c] text-[#8e8e93] hover:text-white",
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Quick Actions */}
          <div className="rounded-3xl border border-[#232328] bg-[#141417] p-5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Need to react to a new clip?</h4>
              <p className="text-[11px] text-[#71717a] mt-0.5">
                Start a fresh reaction with your webcam
              </p>
            </div>
            <Link
              to="/app/clips/new"
              className="rounded-xl border border-[#232328] bg-[#18181c] px-3.5 py-2 text-xs font-semibold text-white hover:border-[#2563EB] transition-colors"
            >
              + New Reaction
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
