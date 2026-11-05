import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { openPolarCheckout } from "@/lib/polar";
import { PLAN_LIMITS } from "@/lib/plans";
import { saveMediaFile, computeFileHash } from "@/lib/storage";
import { CAPTION_PRESET_STYLES, type CaptionStyle } from "@/components/studio/useStudioState";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/clips/new")({
  component: GenerateClipsWizard,
});

function GenerateClipsWizard() {
  const navigate = useNavigate();
  const { user, isPro } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Upload state
  const [file, setFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number>(0);
  const [fileThumb, setFileThumb] = useState<string>("");
  const [ownedConsent, setOwnedConsent] = useState(false);

  // Step 2: Language state
  const [language, setLanguage] = useState<string>("English");

  // Step 3: Settings state
  const [clipLength, setClipLength] = useState<"15-30s" | "30-60s" | "60-90s" | "custom">("30-60s");
  const [clipCount, setClipCount] = useState<"auto" | "3" | "5" | "10">("auto");
  const [aspect, setAspect] = useState<"9:16" | "1:1" | "4:5">("9:16");
  const [captionPreset, setCaptionPreset] = useState<CaptionStyle>("bold");
  const [hookOverlay, setHookOverlay] = useState(true);
  const [instructions, setInstructions] = useState("");

  const planLimit = isPro ? PLAN_LIMITS.pro : PLAN_LIMITS.free;
  const isTooLong = fileDuration > planLimit.maxVideoDurationSec;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    if (chosen.size > 500 * 1024 * 1024) {
      toast.error("File exceeds maximum allowed size of 500MB");
      return;
    }
    setFile(chosen);

    // Extract video duration and real thumbnail frame in browser
    const url = URL.createObjectURL(chosen);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.onloadedmetadata = () => {
      setFileDuration(video.duration);
      video.currentTime = Math.min(1, video.duration / 2);
    };
    video.onseeked = () => {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 180;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, 320, 180);
        setFileThumb(c.toDataURL("image/jpeg", 0.7));
      }
      URL.revokeObjectURL(url);
    };
  };

  const handleGenerate = async () => {
    if (!file) return;
    const runId = `run-${Date.now()}`;
    await saveMediaFile(runId, file);
    toast.success("Clip project created! Starting processing...");
    void navigate({ to: "/app/clips/$runId", params: { runId } });
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-[#262330] bg-[#131118] p-8 shadow-2xl">
        {/* Progress Tracker */}
        <div className="mb-8 flex items-center justify-between border-b border-[#262330] pb-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                  step === s
                    ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30"
                    : step > s
                      ? "bg-[#262330] text-[#4ADE80]"
                      : "bg-[#1A1722] text-[#6B6778]",
                )}
              >
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-[#A19EAA]">
            Step {step} of 4: {step === 1 ? "Upload" : step === 2 ? "Language" : step === 3 ? "Clip Settings" : "Generate"}
          </span>
        </div>

        {/* ── STEP 1: UPLOAD ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Upload your video</h2>
              <p className="mt-1 text-xs text-[#A19EAA]">
                Podcasts, interviews, talks, tutorials, or streams. Up to 500MB.
              </p>
            </div>

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFileChange({ target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#262330] bg-[#1A1722]/50 p-10 text-center transition-all hover:border-[#7C3AED] hover:bg-[#1A1722]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#131118] text-2xl text-[#7C3AED]">
                  ☁
                </div>
                <p className="text-sm font-semibold text-white">Drop, paste, or browse</p>
                <p className="mt-1 text-xs text-[#A19EAA]">MP4, MOV, WEBM · 100% On-Device</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-[#262330] bg-[#1A1722] p-4">
                  {fileThumb ? (
                    <img src={fileThumb} alt="thumbnail" className="h-16 w-28 rounded-xl object-cover bg-black" />
                  ) : (
                    <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-black/60 text-lg">🎬</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">{file.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#A19EAA] mt-0.5">
                      <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                      <span>·</span>
                      <span>{Math.round(fileDuration)} seconds</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); setFileThumb(""); }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Replace
                  </button>
                </div>

                {/* Duration Limit Warning Card */}
                {isTooLong && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                      <span>🔒</span>
                      <span>Video too long for current plan</span>
                    </div>
                    <p className="text-xs text-[#A19EAA]">
                      Your free plan supports videos up to {Math.round(planLimit.maxVideoDurationSec / 60)} minutes.
                      Your video is {(fileDuration / 60).toFixed(1)} minutes.
                    </p>
                    <button
                      type="button"
                      onClick={() => openPolarCheckout(user?.email)}
                      className="rounded-xl bg-[#7C3AED] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#8B5CF6]"
                    >
                      Upgrade for Longer Videos →
                    </button>
                  </div>
                )}

                {/* Ownership Consent Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={ownedConsent}
                    onChange={(e) => setOwnedConsent(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#7C3AED]"
                  />
                  <span className="text-xs text-[#A19EAA]">
                    I own this content or have permission to use it
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: LANGUAGE ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">What language is spoken?</h2>
              <p className="mt-1 text-xs text-[#A19EAA]">Used by Groq Whisper for accurate word timestamps.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "English", flag: "🇺🇸", lastUsed: true },
                { label: "Hindi / Hinglish", flag: "🇮🇳" },
                { label: "Spanish", flag: "🇪🇸" },
                { label: "French", flag: "🇫🇷" },
              ].map((lang) => (
                <button
                  key={lang.label}
                  type="button"
                  onClick={() => setLanguage(lang.label)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border p-4 text-left transition-all",
                    language === lang.label
                      ? "border-[#7C3AED] bg-[#7C3AED]/15 shadow-md shadow-[#7C3AED]/10"
                      : "border-[#262330] bg-[#1A1722] hover:border-[#7C3AED]/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-xs font-bold text-white">{lang.label}</span>
                  </div>
                  {lang.lastUsed && (
                    <span className="rounded-full bg-[#262330] px-2 py-0.5 text-[9px] font-semibold text-[#8B5CF6]">
                      Last used
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: SETTINGS ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Clip Output Settings</h2>
              <p className="mt-1 text-xs text-[#A19EAA]">Target length, count, and animated captions.</p>
            </div>

            {/* Length Segmented */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A19EAA]">Clip Length</label>
              <div className="grid grid-cols-4 gap-2">
                {(["15-30s", "30-60s", "60-90s", "custom"] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setClipLength(len)}
                    className={cn(
                      "rounded-xl border py-2 text-xs font-semibold transition-all",
                      clipLength === len
                        ? "border-[#7C3AED] bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30"
                        : "border-[#262330] bg-[#1A1722] text-[#A19EAA] hover:text-white",
                    )}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Preset Chooser */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A19EAA]">Caption Preset</label>
              <div className="grid grid-cols-4 gap-2">
                {CAPTION_PRESET_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setCaptionPreset(st.id)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all",
                      captionPreset === st.id
                        ? "border-[#7C3AED] bg-[#7C3AED]/20 text-white"
                        : "border-[#262330] bg-[#1A1722] text-[#A19EAA] hover:text-white",
                    )}
                  >
                    <span className="font-bold text-sm">{st.preview}</span>
                    <span className="text-[10px]">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A19EAA]">Special Instructions (Optional)</label>
              <input
                type="text"
                placeholder='E.g. "Focus on funny moments", "Only practical advice"'
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full rounded-xl border border-[#262330] bg-[#1A1722] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: GENERATE SUMMARY ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Ready to Generate Clips</h2>
              <p className="mt-1 text-xs text-[#A19EAA]">Review your run configuration.</p>
            </div>

            <div className="rounded-2xl border border-[#262330] bg-[#1A1722] p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#262330]">
                <span className="text-[#A19EAA]">Video:</span>
                <span className="font-bold text-white truncate max-w-xs">{file?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#262330]">
                <span className="text-[#A19EAA]">Spoken Language:</span>
                <span className="font-bold text-white">{language}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#262330]">
                <span className="text-[#A19EAA]">Target Clip Length:</span>
                <span className="font-bold text-white">{clipLength}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#A19EAA]">Caption Preset:</span>
                <span className="font-bold text-white capitalize">{captionPreset}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 flex items-center justify-between border-t border-[#262330] pt-5">
          <Link to="/app" className="text-xs text-[#A19EAA] hover:text-white">
            ← Cancel & Back to Projects
          </Link>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                className="rounded-xl border border-[#262330] px-4 py-2 text-xs font-semibold text-[#A19EAA] hover:text-white"
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                disabled={step === 1 && (!file || isTooLong || !ownedConsent)}
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                className="rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#7C3AED]/30 hover:bg-[#8B5CF6] disabled:opacity-50"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-xl bg-[#7C3AED] px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-[#7C3AED]/40 hover:bg-[#8B5CF6]"
              >
                Generate Clips Now 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
