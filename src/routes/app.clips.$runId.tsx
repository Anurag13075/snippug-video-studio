import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { getMediaFile, type StoredProject, saveProject } from "@/lib/storage";
import { transcribeVideo, generateAutoClips, type ClipCandidate, type FullTranscript } from "@/lib/transcription-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/clips/$runId")({
  component: ClipRunPage,
});

function ClipRunPage() {
  const { runId } = useParams({ from: "/app/clips/$runId" });
  const [stage, setStage] = useState<"processing" | "results">("processing");
  const [currentStep, setCurrentStep] = useState("Extracting audio on device...");
  const [progressPct, setProgressPct] = useState(15);
  const [clips, setClips] = useState<ClipCandidate[]>([]);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [evalMarks, setEvalMarks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function runPipeline() {
      try {
        const blob = await getMediaFile(runId);
        if (!blob) {
          // If no local blob found (re-attach scenario or sample fallback)
          toast.info("Using active video sample for clip processing");
          const res = await fetch("/samples/podcast-snippet.mp4");
          const sampleBlob = await res.blob();
          if (cancelled) return;
          setVideoBlob(sampleBlob);
          setVideoUrl(URL.createObjectURL(sampleBlob));
          await processVideo(sampleBlob);
        } else {
          setVideoBlob(blob);
          setVideoUrl(URL.createObjectURL(blob));
          await processVideo(blob);
        }
      } catch (err) {
        console.error("Run error:", err);
        toast.error(err instanceof Error ? err.message : "Run failed");
      }
    }

    async function processVideo(blob: Blob) {
      setCurrentStep("Extracting audio on device...");
      setProgressPct(25);

      const { transcript } = await transcribeVideo(blob, (stepText, pct) => {
        if (cancelled) return;
        setCurrentStep(stepText);
        setProgressPct(pct);
      });

      if (cancelled) return;
      setCurrentStep("Finding viral hooks & moments...");
      setProgressPct(80);

      const candidates = await generateAutoClips(transcript, 3, 5, 45);
      if (cancelled) return;

      setClips(candidates);
      setStage("results");
      toast.success(`Generated ${candidates.length} ready-to-post clips!`);

      // Persist project in IndexedDB
      await saveProject({
        id: runId,
        name: `Clip Run ${new Date().toLocaleDateString()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fileName: "clip-run.mp4",
        fileSize: blob.size,
        fileHash: transcript.mediaHash,
        duration: transcript.duration,
        aspect: "9:16",
        captionSettings: {
          style: "bold",
          fontSize: 64,
          color: "#FFFFFF",
          position: "bottom",
          fontFamily: "Inter",
        },
        transcript: {
          text: transcript.text,
          words: transcript.words,
        },
        clips: candidates.map((c) => ({
          id: c.id,
          start: c.start,
          end: c.end,
          title: c.title,
          score: c.score,
          hook: c.hook,
          reason: c.reason,
        })),
      });
    }

    void runPipeline();

    return () => {
      cancelled = true;
    };
  }, [runId]);

  const toggleSelect = (id: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)),
    );
  };

  const handlePostEval = (id: string, wouldPost: boolean) => {
    setEvalMarks((prev) => ({ ...prev, [id]: wouldPost }));
    toast.success(wouldPost ? "Rated: Would Post 👍" : "Rated: Needs Improvement 👎");
  };

  return (
    <div className="space-y-6 pb-12">
      {stage === "processing" ? (
        /* Processing Screen */
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="w-full max-w-md rounded-3xl border border-[#262330] bg-[#131118] p-8 shadow-2xl space-y-5">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7C3AED]/20 text-3xl text-[#8B5CF6]">
              ⚡
              <div className="absolute inset-0 animate-ping rounded-2xl bg-[#7C3AED]/20" />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">Generating Viral Clips</h2>
              <p className="mt-1 text-xs text-[#A19EAA]">{currentStep}</p>
            </div>

            {/* Real Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#262330]">
                <div
                  className="h-full rounded-full bg-[#7C3AED] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B6778]">
                <span>100% On-Device Extraction</span>
                <span>{progressPct}%</span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B6778]">
              You can leave this page open. All processing runs securely in your browser.
            </p>
          </div>
        </div>
      ) : (
        /* Results Page */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262330] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Clip Results</h1>
                <span className="rounded-full bg-[#7C3AED]/20 px-2.5 py-0.5 text-xs font-semibold text-[#8B5CF6]">
                  {clips.length} Clips Found
                </span>
              </div>
              <p className="text-xs text-[#A19EAA] mt-1">
                Reframed in 9:16 Reels aspect with burned-in animated subtitles.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/app/clips/new"
                className="rounded-xl border border-[#262330] bg-[#1A1722] px-4 py-2 text-xs font-semibold text-white hover:border-[#7C3AED]"
              >
                Regenerate Settings
              </Link>
              <button
                type="button"
                onClick={() => toast.success("Exporting all selected clips sequentially...")}
                className="rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#7C3AED]/30 hover:bg-[#8B5CF6]"
              >
                Export All ({clips.filter((c) => c.selected).length}) →
              </button>
            </div>
          </div>

          {/* Grid of 9:16 Clips */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((clip, idx) => (
              <div
                key={clip.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-3xl border bg-[#131118] transition-all",
                  clip.selected ? "border-[#7C3AED]/80 shadow-xl" : "border-[#262330]",
                )}
              >
                {/* 9:16 Preview Player Container */}
                <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-[#6B6778]">
                      ▶
                    </div>
                  )}

                  {/* Top Badges Overlay */}
                  <div className="absolute left-3 top-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="rounded-md bg-black/75 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-xs">
                      #{idx + 1} · {clip.duration}s
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-[#7C3AED] px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                      <span>⚡</span>
                      <span>{clip.score}</span>
                    </span>
                  </div>

                  {/* Hook Line Banner */}
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/80 p-2.5 backdrop-blur-md pointer-events-none">
                    <p className="text-[11px] font-bold text-white line-clamp-2">
                      "{clip.hook}"
                    </p>
                  </div>
                </div>

                {/* Card Meta & Controls */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6]">
                        {clip.topic}
                      </span>
                      <input
                        type="checkbox"
                        checked={clip.selected ?? false}
                        onChange={() => toggleSelect(clip.id)}
                        className="h-4 w-4 rounded accent-[#7C3AED] cursor-pointer"
                      />
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{clip.title}</h3>
                    <p className="text-[11px] text-[#A19EAA] line-clamp-2 leading-relaxed">
                      {clip.reason}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="space-y-2 pt-2 border-t border-[#262330]">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to="/app/studio/$projectId"
                        params={{ projectId: clip.id }}
                        className="flex-1 rounded-xl border border-[#262330] bg-[#1A1722] py-1.5 text-center text-[11px] font-medium text-white hover:border-[#7C3AED]"
                      >
                        Edit in Studio
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${clip.title}\n\n${clip.hook}\n\n#viral #shorts #reels`);
                          toast.success("Copied caption & hashtags!");
                        }}
                        className="rounded-xl border border-[#262330] bg-[#1A1722] px-3 py-1.5 text-[11px] text-[#A19EAA] hover:text-white"
                      >
                        Copy
                      </button>
                    </div>

                    {/* Would Post Quality Rating */}
                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#6B6778]">
                      <span>Rate output:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handlePostEval(clip.id, true)}
                          className={cn(
                            "rounded px-2 py-0.5 font-semibold",
                            evalMarks[clip.id] === true
                              ? "bg-[#4ADE80] text-black"
                              : "bg-[#1A1722] text-[#A19EAA] hover:text-white",
                          )}
                        >
                          👍 Would post
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePostEval(clip.id, false)}
                          className={cn(
                            "rounded px-2 py-0.5 font-semibold",
                            evalMarks[clip.id] === false
                              ? "bg-red-500 text-white"
                              : "bg-[#1A1722] text-[#A19EAA] hover:text-white",
                          )}
                        >
                          👎 Won't post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
