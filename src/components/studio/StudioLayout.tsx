import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useSound } from "@/components/snippug/sound";
import { StudioHeader } from "./StudioHeader";
import { LeftSidebar } from "./LeftSidebar";
import { CenterCanvas } from "./CenterCanvas";
import { RightSidebar } from "./RightSidebar";
import { BottomTimeline } from "./BottomTimeline";
import { useStudioState, type SnipItem, drawComposed } from "./useStudioState";
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
      customName?: string,
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

      let cleanup = () => {};

      try {
        const aspectCfg = state.aspectCfg;
        const resMultiplier = state.exportConfig.resolution === "1080p" && isPro ? 1.5 : 1;
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
        const hasWatermark = isPro ? state.exportConfig.watermark : true;

        await new Promise<void>((res) => {
          let raf = 0;
          const step = () => {
            const curTime = v.currentTime;
            drawComposed(
              c2d,
              v,
              W,
              H,
              targetAspect,
              activeCaption,
              hasWatermark,
            );
            const p = Math.min(
              1,
              Math.max(0, (curTime - inTime) / (outTime - inTime)),
            );
            state.setExportProgress(p);

            if (state.cancelRef.current || curTime >= outTime - 0.02 || v.ended) {
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
          return false;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const clipTitle = customName || state.fileName;
        a.download = `${clipTitle}-snip.webm`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        window.dispatchEvent(new Event("snippug:exported"));
        play("fanfare");
        toast.success(`Exported ${clipTitle}!`);
        return true;
      } catch (err) {
        console.error(err);
        toast.error("Export failed. Try a shorter clip or simpler settings.");
        return false;
      } finally {
        cleanup();
        v.pause();
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

  /* ---- Export Single Queued Snip ---- */
  const handleExportSingle = useCallback(
    (snip: SnipItem) => {
      void exportClip(
        snip.inPoint,
        snip.outPoint,
        snip.aspectRatio,
        {
          text: snip.captionText,
          style: snip.captionStyle,
          position: state.caption.position,
          fontSize: state.caption.fontSize,
          color: state.caption.color,
        },
        `clip-${snip.id.slice(-4)}`,
      );
    },
    [exportClip, state.caption.position, state.caption.fontSize, state.caption.color],
  );

  /* ---- Export All Queued Snips in Batch ---- */
  const handleExportAll = useCallback(async () => {
    if (state.snipQueue.length === 0) {
      toast.info("No clips in queue to export.");
      return;
    }
    toast.info(`Starting batch export of ${state.snipQueue.length} clips...`);

    for (let i = 0; i < state.snipQueue.length; i++) {
      const snip = state.snipQueue[i];
      if (!snip) continue;
      const success = await exportClip(
        snip.inPoint,
        snip.outPoint,
        snip.aspectRatio,
        {
          text: snip.captionText,
          style: snip.captionStyle,
          position: state.caption.position,
          fontSize: state.caption.fontSize,
          color: state.caption.color,
        },
        `clip-${i + 1}-of-${state.snipQueue.length}`,
      );
      if (!success) break;
    }

    toast.success("Batch export complete! All viral clips downloaded 🎉");
    play("fanfare");
  }, [state.snipQueue, exportClip, state.caption, play]);

  // Keyboard shortcut listener
  useKeyboardShortcuts({
    state,
    onExport: handleExportCurrent,
    onExportAll: handleExportAll,
  });

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#14100c] text-[#F5E6CB] select-none">
      {/* Studio Header */}
      <StudioHeader
        fileName={state.fileName}
        duration={state.duration}
        onExport={handleExportCurrent}
        exporting={state.exporting}
        snipCount={state.snipQueue.length}
      />

      {/* 3-Column Editorial Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          src={state.src}
          fileName={state.fileName}
          duration={state.duration}
          aspect={state.aspect}
          setAspect={state.setAspect}
          reframe={state.reframe}
          setReframe={state.setReframe}
          onFileUpload={state.loadFile}
          onSampleLoad={(url, title) => state.loadSource(url, title)}
        />

        {/* Center Canvas */}
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
          reframe={state.reframe}
          caption={state.caption}
          watermark={isPro ? state.exportConfig.watermark : true}
          exporting={state.exporting}
          exportProgress={state.exportProgress}
          onCancelExport={() => {
            state.cancelRef.current = true;
          }}
          onLoadedMetadata={state.onLoadedMetadata}
          togglePlay={state.togglePlay}
          markIn={state.markIn}
          markOut={state.markOut}
          nudge={state.nudge}
          dragOver={state.dragOver}
          setDragOver={state.setDragOver}
          onFileUpload={state.loadFile}
        />

        {/* Right Sidebar */}
        <RightSidebar
          caption={state.caption}
          setCaption={state.setCaption}
          exportConfig={state.exportConfig}
          setExportConfig={state.setExportConfig}
          sfxVolume={state.sfxVolume}
          setSfxVolume={state.setSfxVolume}
        />
      </div>

      {/* Bottom Timeline with Snip Queue */}
      <BottomTimeline
        duration={state.duration}
        time={state.time}
        inPt={state.inPt}
        outPt={state.outPt}
        zoom={state.timelineZoom}
        onSetIn={state.setInPt}
        onSetOut={state.setOutPt}
        onSeek={state.seekTo}
        onZoomIn={state.zoomIn}
        onZoomOut={state.zoomOut}
        snipQueue={state.snipQueue}
        onRemoveSnip={state.removeSnip}
        onExportSingle={handleExportSingle}
        onExportAll={handleExportAll}
        onAddCurrentSnip={state.addSnip}
        exporting={state.exporting}
      />
    </div>
  );
}
