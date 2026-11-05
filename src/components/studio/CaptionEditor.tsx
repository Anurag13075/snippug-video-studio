import { CAPTION_COLORS, type CaptionState, type CaptionStyle, type CaptionPosition } from "./useStudioState";
import { KeycapStatic } from "@/components/snippug/Keycap";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CaptionEditorProps {
  caption: CaptionState;
  setCaption: React.Dispatch<React.SetStateAction<CaptionState>>;
}

const STYLES: Array<{
  id: CaptionStyle;
  label: string;
  desc: string;
  badge: string;
}> = [
  {
    id: "hormozi",
    label: "Hormozi Pop",
    desc: "Viral yellow highlight badge with punchy contrast",
    badge: "VIRAL",
  },
  {
    id: "minimalist",
    label: "Minimalist Editorial",
    desc: "Classic italic serif inspired by luxury fashion",
    badge: "CHIC",
  },
  {
    id: "typewriter",
    label: "Retro Typewriter",
    desc: "Monospace tech look for dev/coding logs",
    badge: "DEV",
  },
  {
    id: "neon",
    label: "Neon Glow",
    desc: "Radiant cyberpunk text with chromatic glow",
    badge: "GLOW",
  },
];

const POSITIONS: Array<{ id: CaptionPosition; label: string }> = [
  { id: "top", label: "Top" },
  { id: "center", label: "Center" },
  { id: "bottom", label: "Bottom" },
];

export function CaptionEditor({ caption, setCaption }: CaptionEditorProps) {
  return (
    <div className="space-y-6">
      {/* Text input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
            Caption Hook Text
          </label>
          <span className="text-[11px] text-[#7A7163]">Renders on preview</span>
        </div>
        <Textarea
          value={caption.text}
          onChange={(e) =>
            setCaption((prev) => ({ ...prev, text: e.target.value }))
          }
          placeholder="E.g. THIS TRICK SAVED ME 40 HOURS... 🤯"
          className="min-h-[80px] resize-none rounded-xl border-[#3a3228] bg-[#1a1612] text-sm text-[#F5E6CB] placeholder:text-[#5E5649] focus-visible:border-[#E6C395]"
        />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#A89F91]">Quick presets:</span>
          {["Wait for the drop...", "3 reasons why...", "Watch until the end"].map(
            (preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCaption((prev) => ({ ...prev, text: preset }))}
                className="rounded-md border border-[#3a3228] bg-[#231E18] px-2 py-0.5 text-[10px] font-medium text-[#E6C395] hover:border-[#E6C395]"
              >
                {preset}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Style selector cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
          Visual Style
        </label>
        <div className="grid grid-cols-1 gap-2">
          {STYLES.map((s) => {
            const active = caption.style === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCaption((prev) => ({ ...prev, style: s.id }))}
                className={cn(
                  "group flex items-start justify-between rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-[#E6C395] bg-[#2C241B] shadow-key"
                    : "border-[#3a3228] bg-[#1a1612] hover:border-[#5E5649]",
                )}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5E6CB]">
                      {s.label}
                    </span>
                    <span className="rounded bg-[#E6C395]/20 px-1.5 py-0.2 text-[9px] font-bold text-[#E6C395]">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A89F91]">{s.desc}</p>
                </div>
                {active && (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E6C395] text-[10px] text-[#1a1612]">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[#A89F91]">
            Scale / Size
          </span>
          <span className="font-mono text-[#E6C395]">{caption.fontSize}px</span>
        </div>
        <Slider
          value={[caption.fontSize]}
          min={18}
          max={64}
          step={2}
          onValueChange={([val]) =>
            val !== undefined &&
            setCaption((prev) => ({ ...prev, fontSize: val }))
          }
          className="py-1"
        />
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
          Screen Placement
        </label>
        <div className="grid grid-cols-3 gap-2">
          {POSITIONS.map((p) => {
            const active = caption.position === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setCaption((prev) => ({ ...prev, position: p.id }))
                }
                className={cn(
                  "rounded-lg border py-2 text-center text-xs font-semibold transition-all",
                  active
                    ? "border-[#E6C395] bg-[#E6C395] text-[#1a1612] shadow-key"
                    : "border-[#3a3228] bg-[#1a1612] text-[#A89F91] hover:border-[#5E5649]",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color swatches */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
          Accent Swatch
        </label>
        <div className="flex items-center gap-2">
          {CAPTION_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCaption((prev) => ({ ...prev, color: c }))}
              style={{ backgroundColor: c }}
              className={cn(
                "h-6 w-6 rounded-full border border-black/30 transition-transform hover:scale-110",
                caption.color === c && "ring-2 ring-[#E6C395] ring-offset-2 ring-offset-[#1a1612]",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
