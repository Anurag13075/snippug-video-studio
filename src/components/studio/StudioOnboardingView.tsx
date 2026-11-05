import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SAMPLES } from "./useStudioState";
import { useSound } from "@/components/snippug/sound";
import { cn } from "@/lib/utils";

interface StudioOnboardingViewProps {
  onFileUpload: (file: File) => void;
  onSampleLoad: (url: string, title: string) => void;
  openUploadModal: boolean;
  setOpenUploadModal: (open: boolean) => void;
}

export function StudioOnboardingView({
  onFileUpload,
  onSampleLoad,
  openUploadModal,
  setOpenUploadModal,
}: StudioOnboardingViewProps) {
  const { play } = useSound();
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "more">("hi");
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-[#0a0a0b] text-[#EDEDED] select-none scrollbar-thin">
      {/* ── Top App Bar ── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-6">
        <div />

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-[#C8C0B5] hover:bg-white/10 hover:text-white"
          >
            <span>🎁</span>
            <span>Rewards</span>
          </button>

          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-[#C8C0B5] hover:bg-white/10 hover:text-white"
          >
            <span>📢</span>
            <span>What's New</span>
          </button>

          {/* Credits Badge */}
          <div className="flex h-8 items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 text-xs font-semibold text-amber-300">
            <span>🪙</span>
            <span>25</span>
          </div>

          {/* Notifications */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#C8C0B5] hover:text-white">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white">
              3
            </span>
          </div>

          <Link
            to="/"
            title="Back to Landing"
            className="flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-[#A89F91] hover:text-white"
          >
            Exit Studio
          </Link>
        </div>
      </header>

      {/* ── Main Dashboard Body ── */}
      <div className="mx-auto w-full max-w-4xl space-y-10 p-8 sm:p-12">
        {/* Create Section */}
        <section className="space-y-4 text-left">
          <h2 className="text-sm font-semibold tracking-wide text-white">
            Create
          </h2>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141416] p-7 transition-all hover:border-white/20">
            {/* Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-base font-bold text-white">
                Generate clips & viral captions
              </h3>
              <p className="text-xs text-[#8E867A]">
                Upload any long video or audio to automatically slice, caption, and reframe for TikTok & Reels.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => {
                  play("pop");
                  setOpenUploadModal(true);
                }}
                className="h-10 rounded-full bg-[#2563EB] px-5 text-xs font-bold text-white shadow-md hover:bg-[#1D4ED8]"
              >
                + New project
              </Button>

              <span className="text-xs text-[#5E5649]">or pick a sample below</span>
            </div>
          </div>
        </section>

        {/* Presets Beta Section */}
        <section className="space-y-4 text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Presets
            </h2>
            <Badge className="h-5 border-white/10 bg-white/5 text-[10px] font-medium text-[#A89F91]">
              Beta
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Reddit story */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                play("pop");
                onSampleLoad("/samples/tech-review.mp4", "Reddit Story Demo");
              }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#141416] p-3 text-left transition-all hover:border-[#2563EB] hover:bg-[#18181B]"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#1f1b16]">
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
                  <div className="rounded-lg border border-white/10 bg-[#161412] p-2.5 text-center shadow-lg">
                    <p className="font-mono text-[10px] text-amber-300">r/confession · 7h</p>
                    <p className="mt-0.5 text-[11px] font-bold text-white">
                      "I've been paying my brother's rent for three years..."
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-0.5">
                <div className="text-xs font-bold text-white group-hover:text-[#2563EB]">
                  Reddit story
                </div>
                <p className="text-[11px] text-[#8E867A]">
                  Opens on a Reddit post hook, then captions smoothly.
                </p>
              </div>
            </div>

            {/* Hormozi High Retention Hook */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                play("pop");
                onSampleLoad("/samples/podcast-snippet.mp4", "Hormozi Hook Demo");
              }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#141416] p-3 text-left transition-all hover:border-[#2563EB] hover:bg-[#18181B]"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#1f1b16]">
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
                  <div className="rounded bg-[#FFFC00] px-3 py-1 font-bold text-[#141416] shadow-lg">
                    <span className="text-xs font-black uppercase">THIS 1 TRICK 🤯</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-0.5">
                <div className="text-xs font-bold text-white group-hover:text-[#2563EB]">
                  Hormozi Pop Hook
                </div>
                <p className="text-[11px] text-[#8E867A]">
                  Scale-bounce yellow badge captions with high retention.
                </p>
              </div>
            </div>

            {/* Gaming Highlights */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                play("pop");
                onSampleLoad("/samples/gaming-moment.mp4", "Gaming Clutch Demo");
              }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#141416] p-3 text-left transition-all hover:border-[#2563EB] hover:bg-[#18181B]"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#1f1b16]">
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
                  <div className="rounded-full border border-emerald-400 bg-emerald-500/20 px-3 py-1 font-bold text-emerald-300">
                    <span className="text-xs">🎮 1v4 CLUTCH</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-0.5">
                <div className="text-xs font-bold text-white group-hover:text-[#2563EB]">
                  Gaming Clip Re-frame
                </div>
                <p className="text-[11px] text-[#8E867A]">
                  9:16 blurred padding layout with audio waveform sync.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Exact Upload Modal from VideoCaptions.ai (Image 2 & 3) ── */}
      {openUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) {
                onFileUpload(f);
                setOpenUploadModal(false);
              }
            }}
            className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#141416] p-7 text-left shadow-2xl"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOpenUploadModal(false)}
              className="absolute right-5 top-5 text-[#8E867A] hover:text-white"
            >
              ✕
            </button>

            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Upload your media</h3>
              <p className="text-xs text-[#8E867A]">
                Drop in your audio or video, captions and clips are generated automatically.
              </p>
            </div>

            {/* Dropzone Box */}
            <label
              className={cn(
                "mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
                dragOver
                  ? "border-[#2563EB] bg-[#2563EB]/10"
                  : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-black/40",
              )}
            >
              {/* Stacked File Format Badges */}
              <div className="flex items-center -space-x-2">
                <div className="flex h-10 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#201D1A] text-[10px] font-bold text-[#A89F91] shadow-sm">
                  MOV
                </div>
                <div className="z-10 flex h-12 w-10 items-center justify-center rounded-lg border border-white/20 bg-[#2A2420] text-[11px] font-bold text-white shadow-md">
                  MP4
                </div>
                <div className="flex h-10 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#201D1A] text-[10px] font-bold text-[#A89F91] shadow-sm">
                  WebM
                </div>
              </div>

              <div className="mt-4 space-y-0.5">
                <p className="text-xs font-semibold text-white">
                  Drop, paste, or <span className="text-[#2563EB] underline">browse</span>
                </p>
                <p className="text-[11px] text-[#8E867A]">Audio or video with speech</p>
              </div>

              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    onFileUpload(f);
                    setOpenUploadModal(false);
                  }
                  e.currentTarget.value = "";
                }}
              />
            </label>

            {/* Language Selection (like Image 3) */}
            <div className="mt-5 space-y-2">
              <label className="text-xs font-semibold text-white">Language</label>
              <p className="text-[11px] text-[#8E867A]">What language is spoken in the video?</p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage("en")}
                  className={cn(
                    "flex flex-col rounded-xl border p-2.5 text-left transition-all",
                    selectedLanguage === "en"
                      ? "border-[#2563EB] bg-[#2563EB]/15 text-white"
                      : "border-white/10 bg-black/20 text-[#8E867A] hover:border-white/20",
                  )}
                >
                  <span className="text-xs font-bold text-white">Aa</span>
                  <span className="mt-0.5 text-[11px]">English</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLanguage("hi")}
                  className={cn(
                    "relative flex flex-col rounded-xl border p-2.5 text-left transition-all",
                    selectedLanguage === "hi"
                      ? "border-[#2563EB] bg-[#2563EB]/15 text-white"
                      : "border-white/10 bg-black/20 text-[#8E867A] hover:border-white/20",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">अ—Aa</span>
                    {selectedLanguage === "hi" && (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2563EB] text-[9px] text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="mt-0.5 text-[11px]">Hinglish</span>
                  <span className="text-[9px] text-[#8E867A]">Last used</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLanguage("more")}
                  className={cn(
                    "flex flex-col rounded-xl border p-2.5 text-left transition-all",
                    selectedLanguage === "more"
                      ? "border-[#2563EB] bg-[#2563EB]/15 text-white"
                      : "border-white/10 bg-black/20 text-[#8E867A] hover:border-white/20",
                  )}
                >
                  <span className="text-xs font-bold text-white">文A</span>
                  <span className="mt-0.5 text-[11px]">More</span>
                  <span className="text-[9px] text-[#8E867A]">99+ languages</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Samples */}
            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-[11px] text-[#8E867A]">Quick viral demos:</span>
              <div className="flex gap-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSampleLoad(s.file, s.title);
                      setOpenUploadModal(false);
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/10"
                  >
                    {s.emoji} {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => setOpenUploadModal(false)}
                className="text-xs font-medium text-[#8E867A] hover:text-white"
              >
                ← Projects
              </button>

              <Button
                onClick={() => {
                  // If no file picked, load default podcast demo
                  onSampleLoad("/samples/podcast-snippet.mp4", "Viral Podcast Clip");
                  setOpenUploadModal(false);
                }}
                className="h-10 rounded-xl bg-[#2563EB] px-6 text-xs font-bold text-white shadow-md hover:bg-[#1D4ED8]"
              >
                Generate Beautiful Captions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
