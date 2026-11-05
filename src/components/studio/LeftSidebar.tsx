import { Puggy } from "@/components/snippug/Puggy";
import { useSound } from "@/components/snippug/sound";
import { ASPECTS, SAMPLES, type Aspect, type ReframePreset, fmt } from "./useStudioState";
import { cn } from "@/lib/utils";

interface LeftSidebarProps {
  src: string | null;
  fileName: string;
  duration: number;
  aspect: Aspect;
  setAspect: (a: Aspect) => void;
  reframe: ReframePreset;
  setReframe: (r: ReframePreset) => void;
  onFileUpload: (file: File) => void;
  onSampleLoad: (fileUrl: string, title: string) => void;
}

export function LeftSidebar({
  src,
  fileName,
  duration,
  aspect,
  setAspect,
  reframe,
  setReframe,
  onFileUpload,
  onSampleLoad,
}: LeftSidebarProps) {
  const { play } = useSound();

  return (
    <aside className="flex h-full w-[290px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-[#3a3228] bg-[#1d1813] p-4 scrollbar-thin">
      {/* Media Bin */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
            Media Bin
          </label>
          <span className="text-[11px] text-[#7A7163]">100% on-device</span>
        </div>

        {src ? (
          <div className="relative overflow-hidden rounded-xl border border-[#3a3228] bg-[#231E18] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/40 text-lg">
                🎬
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="truncate text-xs font-bold text-[#F5E6CB]">
                  {fileName}
                </div>
                <div className="text-[10px] text-[#A89F91]">
                  Duration: {fmt(duration)}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Upload Button */}
        <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#5E5649] bg-[#231E18]/60 px-4 text-xs font-bold text-[#F5E6CB] transition-all hover:border-[#E6C395] hover:bg-[#2C241B]">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span>Choose / Drop Video</span>
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

        {/* Quick sample clips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-[#7A7163]">
            Or load viral demo:
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  play("pop");
                  onSampleLoad(s.file, s.title);
                }}
                className="flex items-center gap-2 rounded-lg border border-[#3a3228] bg-[#231E18] px-2.5 py-1.5 text-left text-xs font-medium text-[#F5E6CB] transition-all hover:border-[#E6C395] hover:bg-[#2C241B]"
              >
                <span>{s.emoji}</span>
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-[#3a3228]" />

      {/* Aspect Ratio Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
          Target Aspect Ratio
        </label>
        <div className="grid grid-cols-1 gap-2">
          {ASPECTS.map((a) => {
            const active = aspect === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  play("click");
                  setAspect(a.id);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-2.5 text-left transition-all",
                  active
                    ? "border-[#E6C395] bg-[#2C241B] shadow-key"
                    : "border-[#3a3228] bg-[#231E18] hover:border-[#5E5649]",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">
                    {a.id === "9:16" ? "📱" : a.id === "1:1" ? "🔲" : "🖥️"}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#F5E6CB]">
                      {a.label}
                    </div>
                    <div className="text-[10px] text-[#A89F91]">{a.hint}</div>
                  </div>
                </div>
                {active && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E6C395] text-[10px] text-[#1a1612]">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#3a3228]" />

      {/* Re-frame Presets */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
          Re-frame Staging
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "blurred" as const, label: "Blurred", icon: "🌫️" },
            { id: "center" as const, label: "Center", icon: "🎯" },
            { id: "split" as const, label: "Split", icon: "📑" },
          ].map((r) => {
            const active = reframe === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  play("click");
                  setReframe(r.id);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all",
                  active
                    ? "border-[#E6C395] bg-[#2C241B] text-[#E6C395] shadow-key"
                    : "border-[#3a3228] bg-[#231E18] text-[#A89F91] hover:border-[#5E5649]",
                )}
              >
                <span className="text-sm">{r.icon}</span>
                <span className="text-[10px] font-bold">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Puggy Assistant Card */}
      <div className="mt-auto rounded-2xl border border-[#3a3228] bg-gradient-to-b from-[#231E18] to-[#16120e] p-3 text-center">
        <div className="mx-auto h-16 w-16">
          <Puggy mood="listening" className="h-full w-full" />
        </div>
        <p className="mt-1 text-xs font-semibold text-[#F5E6CB]">
          Puggy is listening
        </p>
        <p className="mt-0.5 text-[10px] text-[#A89F91]">
          Tap I & O to select your viral hook.
        </p>
      </div>
    </aside>
  );
}
