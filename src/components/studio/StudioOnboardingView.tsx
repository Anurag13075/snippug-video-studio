import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SAMPLES } from "./useStudioState";
import { useSound } from "@/components/snippug/sound";
import { useAuth } from "@/lib/auth";
import { UserMenu } from "@/components/snippug/UserMenu";
import { SnipPugLogo } from "@/components/snippug/SnipPugLogo";
import { cn } from "@/lib/utils";

interface StudioOnboardingViewProps {
  onFileUpload: (file: File) => void;
  onSampleLoad: (url: string, title: string) => void;
}

export function StudioOnboardingView({
  onFileUpload,
  onSampleLoad,
}: StudioOnboardingViewProps) {
  const { play, enabled, toggle } = useSound();
  const { isPro } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "more">("hi");
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-[#0c0b0a] text-[#EDEDED] select-none scrollbar-thin">
      {/* ── Ultra-Clean Minimal Top App Bar ── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-6">
        <Link to="/" className="flex items-center gap-2">
          <SnipPugLogo size="sm" showWordmark={false} />
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#E6C395]">
            SNIPPUG.AI
          </span>
        </Link>

        {/* Real Functional Utilities Only (No fake credits or notifications) */}
        <div className="flex items-center gap-3">
          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-pressed={enabled}
            title={enabled ? "Mute sounds" : "Enable sounds"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
              enabled
                ? "border-[#E6C395] bg-[#E6C395]/10 text-[#E6C395]"
                : "border-white/10 bg-white/5 text-[#A89F91] hover:text-white",
            )}
          >
            {enabled ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
                <path d="m16 9 6 6M22 9l-6 6" />
              </svg>
            )}
          </button>

          {/* User Account Menu */}
          <UserMenu onGlass={false} />
        </div>
      </header>

      {/* ── Main Focused Workspace Card (Exact match to Reference Image 1) ── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
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
            if (f) onFileUpload(f);
          }}
          className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#141312] p-8 text-left shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-10"
        >
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Upload your media
            </h1>
            <p className="text-xs text-[#8E867A] sm:text-sm">
              Drop in your audio or video, captions and clips are generated automatically.
            </p>
          </div>

          {/* Central Dropzone Box */}
          <label
            className={cn(
              "mt-7 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
              dragOver
                ? "border-[#2563EB] bg-[#2563EB]/10"
                : "border-white/10 bg-[#0e0d0c] hover:border-white/20 hover:bg-[#121110]",
            )}
          >
            {/* Stacked File Format Badges */}
            <div className="flex items-center -space-x-2">
              <div className="flex h-11 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#1b1917] text-[10px] font-bold text-[#A89F91] shadow-sm">
                MOV
              </div>
              <div className="z-10 flex h-13 w-11 items-center justify-center rounded-lg border border-white/25 bg-[#25221e] text-xs font-bold text-white shadow-md">
                MP4
              </div>
              <div className="flex h-11 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#1b1917] text-[10px] font-bold text-[#A89F91] shadow-sm">
                WebM
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <p className="text-sm font-semibold text-white">
                Drop, paste, or <span className="text-[#3B82F6] hover:underline">browse</span>
              </p>
              <p className="text-xs text-[#8E867A]">Audio or video with speech</p>
            </div>

            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileUpload(f);
                e.currentTarget.value = "";
              }}
            />
          </label>

          {/* Language Selection Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white">Language</label>
              <span className="text-[11px] text-[#8E867A]">Voice transcription</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedLanguage("en")}
                className={cn(
                  "flex flex-col rounded-xl border p-2.5 text-left transition-all",
                  selectedLanguage === "en"
                    ? "border-[#2563EB] bg-[#2563EB]/15 text-white"
                    : "border-white/10 bg-[#0e0d0c] text-[#8E867A] hover:border-white/20",
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
                    : "border-white/10 bg-[#0e0d0c] text-[#8E867A] hover:border-white/20",
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
                <span className="text-[9px] text-[#8E867A]">Auto</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLanguage("more")}
                className={cn(
                  "flex flex-col rounded-xl border p-2.5 text-left transition-all",
                  selectedLanguage === "more"
                    ? "border-[#2563EB] bg-[#2563EB]/15 text-white"
                    : "border-white/10 bg-[#0e0d0c] text-[#8E867A] hover:border-white/20",
                )}
              >
                <span className="text-xs font-bold text-white">文A</span>
                <span className="mt-0.5 text-[11px]">More</span>
                <span className="text-[9px] text-[#8E867A]">99+ languages</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Viral Demos */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-[#8E867A]">
            <span>Try viral clip:</span>
            <div className="flex gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    play("pop");
                    onSampleLoad(s.file, s.title);
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/15"
                >
                  {s.emoji} {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="mt-7 flex items-center justify-between border-t border-white/5 pt-5">
            <Link
              to="/"
              className="text-xs font-medium text-[#8E867A] transition-colors hover:text-white"
            >
              ← Back to Home
            </Link>

            <Button
              onClick={() => {
                play("click");
                onSampleLoad("/samples/podcast-snippet.mp4", "Viral Podcast Clip");
              }}
              className="h-11 rounded-xl bg-[#2563EB] px-7 text-xs font-bold text-white shadow-md transition-all hover:bg-[#1D4ED8]"
            >
              Generate Beautiful Captions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
