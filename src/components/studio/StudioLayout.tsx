import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useSound } from "@/components/snippug/sound";
import { StudioHeader } from "./StudioHeader";
import { StudioNavRail } from "./StudioNavRail";
import { LeftSidebar } from "./LeftSidebar";
import { CenterCanvas } from "./CenterCanvas";
import { RightSidebar } from "./RightSidebar";
import { BottomTimeline } from "./BottomTimeline";
import { useStudioState, drawComposed } from "./useStudioState";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

export function StudioLayout() {
  const state = useStudioState();
  const { isPro } = useAuth();
  const { play } = useSound();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const srcNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  /* ---- Single Export routine ---- */
  const exportClip = useCallback(
    async (
      inTime: number,
      outTime: number,
      targetAspect: typeof state.aspect,
      captionOverride?: typeof state.caption,
    ): Promise<boolean> => {
      const v = state.videoRef.current;
      if (!v || !state.src || state.exporting) return false;

      if (outTime - inTime < 0.3) {
        toast.error("Clip is too short — mark at least 0.3 seconds.");
        return false;
      }

      state.setExporting(true);
      state.setExportProgress(0);
      state.cancelRef.current = false;
      play("whoosh");

      try {
        const aspectCfg = state.aspectCfg;
        const resMultiplier =
          state.resolution === "4K" ? 2 : state.resolution === "1080p" ? 1.5 : 1;
        const W = Math.round(aspectCfg.w * resMultiplier);
        const H = Math.round(aspectCfg.h * resMultiplier);

        // Audio setup
        let audioTracks: MediaStreamTrack[] = [];
        if (state.exportConfig.includeAudio) {
          try {
            if (!audioCtxRef.current) {
              const AC =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                  .webkitAudioContext;
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
            if (destRef.current) {
              audioTracks = destRef.current.stream.getAudioTracks();
            }
          } catch {
            audioTracks = [];
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const c2d = canvas.getContext("2d")!;

        const stream = canvas.captureStream(30);
        audioTracks.forEach((t) => stream.addTrack(t));

        const mimes = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
        ];
        const mime = mimes.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
        const recorder = new MediaRecorder(
          stream,
          mime ? { mimeType: mime } : undefined,
        );
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        const done = new Promise<Blob | null>((resolve) => {
          recorder.onstop = () =>
            resolve(
              state.cancelRef.current
                ? null
                : new Blob(chunks, { type: "video/webm" }),
            );
        });

        // Seek video to inPoint
        v.pause();
        v.currentTime = inTime;
        await new Promise<void>((res) => {
          const ok = () => res();
          v.addEventListener("seeked", ok, { once: true });
          setTimeout(ok, 1200);
        });

        recorder.start(200);
        await v.play();

        const activeCaption = captionOverride ?? state.caption;
        const hasWatermark = isPro ? false : state.exportConfig.watermark;

        await new Promise<void>((res) => {
          let raf = 0;
          const step = () => {
            const curTime = v.currentTime;
            drawComposed(c2d, v, W, H, targetAspect, activeCaption, hasWatermark);
            const p = Math.min(
              1,
              Math.max(0, (curTime - inTime) / (outTime - inTime)),
            );
            state.setExportProgress(Math.round(p * 100));

            if (curTime >= outTime || v.ended || state.cancelRef.current) {
              cancelAnimationFrame(raf);
              res();
            } else {
              raf = requestAnimationFrame(step);
            }
          };
          raf = requestAnimationFrame(step);
        });

        recorder.stop();
        v.pause();
        const blob = await done;

        if (!blob || state.cancelRef.current) {
          toast.info("Export cancelled.");
          return false;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${state.fileName || "snippug"}-clip.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        play("fanfare");
        toast.success("Export complete! Video downloaded 🎉");
        return true;
      } catch (err) {
        console.error("Export failed:", err);
        toast.error("Export failed: " + (err instanceof Error ? err.message : "Error"));
        return false;
      } finally {
        state.setExporting(false);
        state.setExportProgress(0);
      }
    },
    [state, isPro, play],
  );

  /* ---- Quick Export current selection ---- */
  const handleExportCurrent = useCallback(() => {
    void exportClip(state.inPt, state.outPt, state.aspect);
  }, [exportClip, state.inPt, state.outPt, state.aspect]);

  // Keyboard shortcut listener
  useKeyboardShortcuts({
    state,
    onExport: handleExportCurrent,
    onExportAll: handleExportCurrent,
  });

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0B0A0F] text-[#FFFFFF] select-none font-sans">
      {/* ── Top Bar Header ── */}
      <StudioHeader
        onExport={handleExportCurrent}
        exporting={state.exporting}
      />

      {/* ── Main Workspace Body (Sidebar, Media Bin, Center Canvas, Inspector) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Far-Left Nav Rail (Home, My Projects, Templates, Brand Kit, Settings, Go Pro, More Tools, User) */}
        <StudioNavRail
          activeTab={state.activeNavTab}
          onTabChange={state.setActiveNavTab}
        />

        {/* Left Workspace Panel (Tabs: Media, Text, Elements, Audio, Uploads; Dropzone; Your Media) */}
        <LeftSidebar
          activeTab={state.leftSidebarTab}
          onTabChange={state.setLeftSidebarTab}
          mediaItems={state.mediaItems}
          selectedMediaId={state.selectedMediaId}
          onSelectMedia={state.selectMediaItem}
          onFileUpload={state.loadFile}
        />

        {/* Center Preview Player (9:16 vertical phone, aspect badge, resolution, play overlay, transport) */}
        <CenterCanvas
          src={state.src}
          videoRef={state.videoRef}
          canvasRef={state.canvasRef}
          duration={state.duration}
          time={state.time}
          setTime={state.setTime}
          playing={state.playing}
          setPlaying={state.setPlaying}
          aspect={state.aspect}
          setAspect={state.setAspect}
          resolution={state.resolution}
          setResolution={state.setResolution}
          caption={state.caption}
          onLoadedMetadata={state.onLoadedMetadata}
          togglePlay={state.togglePlay}
          seekTo={state.seekTo}
        />

        {/* Right Inspector Panel (Captions, Style, Effects, Adjust; Auto Captions; Language; 8 Presets; Font; Size; Color; Position) */}
        <RightSidebar
          caption={state.caption}
          setCaption={state.setCaption}
          autoCaptions={state.autoCaptions}
          setAutoCaptions={state.setAutoCaptions}
          language={state.language}
          setLanguage={state.setLanguage}
          fontFamily={state.fontFamily}
          setFontFamily={state.setFontFamily}
          activeTab={state.rightSidebarTab}
          onTabChange={state.setRightSidebarTab}
        />
      </div>

      {/* ── Bottom Multi-Track Timeline (Toolbar, Ruler, 3 Tracks: Captions, Video, Audio, Need Help) ── */}
      <BottomTimeline
        duration={state.duration}
        time={state.time}
        zoom={state.timelineZoom}
        onZoomIn={state.zoomIn}
        onZoomOut={state.zoomOut}
        onSeek={state.seekTo}
        trackVisibility={state.trackVisibility}
        onToggleTrack={state.toggleTrackVisibility}
        captionSegments={state.captionSegments}
      />
    </div>
  );
}
