import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { FloralCornerDecoration } from "@/components/app/FloralDecoration";
import { saveMediaFile, saveProject } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/clips/new")({
  component: ReactionOnboardingPage,
});

type ReactionMode = "record" | "upload";
type LayoutType = "split-top-bottom" | "pip-bottom-right" | "side-by-side";

const VIRAL_SAMPLES = [
  {
    name: "Crazy Tech Demo",
    path: "/samples/tech-review.mp4",
    duration: 15,
    tag: "Tech",
  },
  {
    name: "Podcast Debate",
    path: "/samples/podcast-snippet.mp4",
    duration: 20,
    tag: "Podcast",
  },
  {
    name: "Gaming Clutch",
    path: "/samples/gaming-moment.mp4",
    duration: 18,
    tag: "Gaming",
  },
];

function ReactionOnboardingPage() {
  const navigate = useNavigate();

  // Source Video State (The video to react to)
  const [sourceFile, setSourceFile] = useState<Blob | null>(null);
  const [sourceName, setSourceName] = useState<string>("");
  const [sourceThumb, setSourceThumb] = useState<string>("");
  const [sourceDuration, setSourceDuration] = useState<number>(0);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  // Reaction Video State (Creator Face / Mic)
  const [reactionMode, setReactionMode] = useState<ReactionMode>("record");
  const [reactionFile, setReactionFile] = useState<Blob | null>(null);
  const [reactionUrl, setReactionUrl] = useState<string>("");
  const reactionInputRef = useRef<HTMLInputElement>(null);

  // Webcam live recording state
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Split Layout Selection
  const [layout, setLayout] = useState<LayoutType>("split-top-bottom");
  const [isStarting, setIsStarting] = useState(false);

  // Stop camera stream when leaving component
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mediaStream]);

  // Handle Source Video Selection
  const handleSourceUpload = (blob: Blob, name: string) => {
    setSourceFile(blob);
    setSourceName(name);

    const url = URL.createObjectURL(blob);
    const v = document.createElement("video");
    v.src = url;
    v.muted = true;
    v.onloadedmetadata = () => {
      setSourceDuration(v.duration);
      v.currentTime = Math.min(1, v.duration / 2);
    };
    v.onseeked = () => {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 180;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(v, 0, 0, 320, 180);
        setSourceThumb(c.toDataURL("image/jpeg", 0.7));
      }
      URL.revokeObjectURL(url);
    };
  };

  // Load a 1-click viral sample clip
  const handleLoadSample = async (sample: typeof VIRAL_SAMPLES[0]) => {
    try {
      toast.info(`Loading sample "${sample.name}"...`);
      const res = await fetch(sample.path);
      const blob = await res.blob();
      handleSourceUpload(blob, sample.name);
      toast.success("Sample loaded!");
    } catch {
      toast.error("Failed to load sample clip");
    }
  };

  // Start Webcam Stream
  const startWebcam = async () => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      setMediaStream(stream);
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not access camera and microphone. Please check permissions.");
    }
  };

  // Start Recording Reaction with 3-2-1 countdown
  const handleStartRecording = () => {
    if (!mediaStream) {
      toast.error("Please turn on your camera first");
      return;
    }

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setCountdown(null);
          beginActualRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const beginActualRecording = () => {
    if (!mediaStream) return;
    recordedChunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(mediaStream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const recordedBlob = new Blob(recordedChunksRef.current, { type: mimeType });
      setReactionFile(recordedBlob);
      const url = URL.createObjectURL(recordedBlob);
      setReactionUrl(url);
      setIsRecording(false);
      setRecordingSeconds(0);
      toast.success("Reaction recorded successfully!");
    };

    recorder.start(250);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingSeconds(0);
  };

  // Live timer tick during recording
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isRecording) {
      t = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Handle Starting the Project
  const handleStartStudio = async () => {
    if (!sourceFile) {
      toast.error("Please upload or choose a video to react to first");
      return;
    }

    setIsStarting(true);
    try {
      const runId = `reaction-${Date.now()}`;

      // Save Source Video
      await saveMediaFile(`source_${runId}`, sourceFile);

      // If user recorded or uploaded a reaction, save it too
      if (reactionFile) {
        await saveMediaFile(`reaction_${runId}`, reactionFile);
      } else {
        // Fallback reaction: use sample or mirror for dual split
        await saveMediaFile(`reaction_${runId}`, sourceFile);
      }

      const totalDuration = sourceDuration || 30;

      // Save project metadata
      await saveProject({
        id: runId,
        name: `Reaction · ${sourceName || "Split Short"}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        type: "reaction",
        layout,
        sourceName,
        reactionName: reactionFile ? "Webcam Reaction" : "Synced Track",
        sourceVolume: 40,
        reactionVolume: 100,
        fileName: `${sourceName || "reaction"}.mp4`,
        fileSize: sourceFile.size,
        fileHash: `hash_${runId}`,
        duration: totalDuration,
        aspect: "9:16",
        captionSettings: {
          style: "bold",
          fontSize: 52,
          color: "#FFFFFF",
          position: "bottom",
          fontFamily: "Inter",
        },
        status: "ready",
      });

      toast.success("Reaction project ready! Opening Studio...");
      void navigate({ to: "/app/clips/$runId", params: { runId } });
    } catch (err) {
      console.error(err);
      toast.error("Could not initialize studio project");
      setIsStarting(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center py-6 px-4">
      {/* Decorative Floral Background (Matching videocaptions.ai exact corner aesthetic) */}
      <FloralCornerDecoration />

      {/* Main Centered Modal Card (Exact aesthetic of videocaptions.ai upload card) */}
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-[#232328] bg-[#141417] p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Create Reaction Video
          </h2>
          <p className="mt-1 text-xs text-[#8e8e93]">
            Drop in your video to react to, and record your live camera or upload your reaction.
          </p>
        </div>

        {/* ── SECTION 1: SOURCE VIDEO DROPZONE (Matches videocaptions.ai dropzone) ── */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-white flex items-center justify-between">
            <span>1. Video To React To</span>
            {sourceFile && (
              <span className="text-[11px] text-[#4ADE80] flex items-center gap-1">
                ✓ Ready ({Math.round(sourceDuration)}s)
              </span>
            )}
          </label>

          {!sourceFile ? (
            <div
              onClick={() => sourceInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleSourceUpload(f, f.name);
              }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#27272a] bg-[#18181c]/60 p-8 text-center transition-all hover:border-[#2563EB] hover:bg-[#1a1a1f]"
            >
              <input
                ref={sourceInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSourceUpload(f, f.name);
                }}
                className="hidden"
              />

              {/* Floating file icons exactly matching videocaptions.ai */}
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-9 items-center justify-center rounded-lg border border-[#27272a] bg-[#121215] text-[10px] font-bold text-[#8e8e93] shadow-sm">
                  MOV
                </div>
                <div className="flex h-12 w-10 items-center justify-center rounded-xl border border-[#2563EB]/40 bg-[#16161c] text-xs font-bold text-white shadow-md">
                  MP4
                </div>
                <div className="flex h-10 w-9 items-center justify-center rounded-lg border border-[#27272a] bg-[#121215] text-[10px] font-bold text-[#8e8e93] shadow-sm">
                  WAV
                </div>
              </div>

              <p className="text-xs font-semibold text-white">
                Drop, paste, or <span className="text-[#2563EB]">browse</span>
              </p>
              <p className="mt-1 text-[11px] text-[#71717a]">
                Audio or video with speech · Up to 500MB
              </p>

              {/* 1-Click Viral Test Clips */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-4 pt-3 border-t border-[#232328] w-full"
              >
                <div className="text-[10px] text-[#71717a] mb-2 font-medium">
                  Or test with 1-click viral clips:
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {VIRAL_SAMPLES.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => handleLoadSample(s)}
                      className="rounded-lg border border-[#232328] bg-[#141417] px-2.5 py-1 text-[10px] font-medium text-[#f4f4f5] hover:border-[#2563EB] hover:text-[#60A5FA] transition-all"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5 rounded-2xl border border-[#232328] bg-[#18181c] p-3.5">
              {sourceThumb ? (
                <img
                  src={sourceThumb}
                  alt="Source video thumbnail"
                  className="h-14 w-24 rounded-xl object-cover bg-black"
                />
              ) : (
                <div className="flex h-14 w-24 items-center justify-center rounded-xl bg-black text-xl">
                  🎬
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="truncate text-xs font-bold text-white">{sourceName}</h4>
                <p className="text-[11px] text-[#71717a] mt-0.5">
                  {(sourceFile.size / (1024 * 1024)).toFixed(1)} MB · {Math.round(sourceDuration)}s
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSourceFile(null);
                  setSourceName("");
                  setSourceThumb("");
                }}
                className="rounded-lg border border-[#27272a] px-2.5 py-1 text-xs text-[#8e8e93] hover:text-white hover:bg-[#232328]"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* ── SECTION 2: CREATOR REACTION (WEBCAM / MIC) ── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white">
              2. Your Reaction (Camera & Mic)
            </label>
            <div className="flex items-center rounded-lg border border-[#232328] bg-[#18181c] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setReactionMode("record")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  reactionMode === "record"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#8e8e93] hover:text-white",
                )}
              >
                🎥 Record Webcam
              </button>
              <button
                type="button"
                onClick={() => setReactionMode("upload")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  reactionMode === "upload"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#8e8e93] hover:text-white",
                )}
              >
                📁 Upload File
              </button>
            </div>
          </div>

          {reactionMode === "record" ? (
            <div className="rounded-2xl border border-[#232328] bg-[#18181c] p-4 space-y-4">
              {/* Camera Preview Area */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center">
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "h-full w-full object-cover -scale-x-100",
                    !mediaStream && "hidden",
                  )}
                />

                {!mediaStream && !reactionUrl && (
                  <div className="text-center space-y-2 p-6">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e24] text-xl">
                      📷
                    </div>
                    <p className="text-xs font-medium text-[#8e8e93]">
                      Click below to turn on your webcam & mic
                    </p>
                    <button
                      type="button"
                      onClick={startWebcam}
                      className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                    >
                      Turn On Camera
                    </button>
                  </div>
                )}

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-xs">
                    <span className="text-6xl font-black text-white animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Live Recording Badge */}
                {isRecording && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-black/80 px-2.5 py-1 text-xs font-mono font-bold text-red-400 border border-red-500/30">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </div>
                )}

                {/* Recorded Review Mode */}
                {reactionUrl && !isRecording && (
                  <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                    <video
                      src={reactionUrl}
                      controls
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Webcam Controls */}
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-[#71717a]">
                  {reactionFile ? "✓ Reaction captured!" : "Record your commentary reaction"}
                </div>

                <div className="flex items-center gap-2">
                  {mediaStream && !isRecording && !reactionFile && (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-500 transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-white" />
                      <span>Record Reaction</span>
                    </button>
                  )}

                  {isRecording && (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-md hover:bg-zinc-200"
                    >
                      <span>■ Stop Recording</span>
                    </button>
                  )}

                  {reactionFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setReactionFile(null);
                        setReactionUrl("");
                        void startWebcam();
                      }}
                      className="rounded-xl border border-[#27272a] px-3 py-1.5 text-xs text-[#8e8e93] hover:text-white"
                    >
                      Re-record
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => reactionInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#27272a] bg-[#18181c]/60 p-6 text-center hover:border-[#2563EB]"
            >
              <input
                ref={reactionInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setReactionFile(f);
                    setReactionUrl(URL.createObjectURL(f));
                    toast.success("Reaction video uploaded!");
                  }
                }}
                className="hidden"
              />
              <span className="text-xl mb-1">📁</span>
              <p className="text-xs font-semibold text-white">
                {reactionFile ? "Reaction file selected" : "Upload your selfie or facecam video"}
              </p>
              <p className="text-[10px] text-[#71717a] mt-0.5">MP4, MOV or WEBM</p>
            </div>
          )}
        </div>

        {/* ── SECTION 3: SPLIT-SCREEN LAYOUT ── */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-white">
            3. Split Layout Format
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                id: "split-top-bottom" as const,
                label: "TikTok Split",
                sub: "50/50 Top & Bottom",
                icon: "↕️",
              },
              {
                id: "pip-bottom-right" as const,
                label: "Bubble (PiP)",
                sub: "Floating Circle",
                icon: "🔘",
              },
              {
                id: "side-by-side" as const,
                label: "Side by Side",
                sub: "50/50 Duel",
                icon: "↔️",
              },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setLayout(st.id)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                  layout === st.id
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-white shadow-sm"
                    : "border-[#232328] bg-[#18181c] text-[#8e8e93] hover:text-white",
                )}
              >
                <span className="text-base mb-1">{st.icon}</span>
                <span className="text-xs font-bold text-white">{st.label}</span>
                <span className="text-[10px] text-[#71717a]">{st.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── FOOTER CONTROLS (Matches videocaptions.ai exact buttons) ── */}
        <div className="flex items-center justify-between border-t border-[#232328] pt-5">
          <Link
            to="/app"
            className="flex items-center gap-1.5 text-xs font-medium text-[#8e8e93] hover:text-white transition-colors"
          >
            <span>← Projects</span>
          </Link>

          <button
            type="button"
            disabled={!sourceFile || isStarting}
            onClick={handleStartStudio}
            className="rounded-xl bg-[#2563EB] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#2563EB]/25 hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isStarting ? "Loading..." : "Start Reaction Studio →"}
          </button>
        </div>
      </div>
    </div>
  );
}
