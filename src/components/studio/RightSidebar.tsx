import { useState } from "react";
import {
  type CaptionState,
  type CaptionStyle,
  CAPTION_PRESET_STYLES,
  CAPTION_SWATCH_COLORS,
} from "./useStudioState";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RightSidebarProps {
  caption: CaptionState;
  setCaption: React.Dispatch<React.SetStateAction<CaptionState>>;
  autoCaptions: boolean;
  setAutoCaptions: (v: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  activeTab: "captions" | "style" | "effects" | "adjust";
  onTabChange: (tab: "captions" | "style" | "effects" | "adjust") => void;
}

export function RightSidebar({
  caption,
  setCaption,
  autoCaptions,
  setAutoCaptions,
  language,
  setLanguage,
  fontFamily,
  setFontFamily,
  activeTab,
  onTabChange,
}: RightSidebarProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);

  const tabs: Array<{
    id: "captions" | "style" | "effects" | "adjust";
    label: string;
  }> = [
    { id: "captions", label: "Captions" },
    { id: "style", label: "Style" },
    { id: "effects", label: "Effects" },
    { id: "adjust", label: "Adjust" },
  ];

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Spanish", flag: "🇪🇸" },
    { code: "fr", label: "French", flag: "🇫🇷" },
    { code: "de", label: "German", flag: "🇩🇪" },
    { code: "hi", label: "Hindi", flag: "🇮🇳" },
  ];

  const fonts = ["Inter", "Instrument Sans", "Cabinet Grotesk", "Geist", "Satoshi"];

  return (
    <aside className="flex h-full w-[315px] shrink-0 flex-col border-l border-[#262330] bg-[#131118]">
      {/* Top Inspector Tabs */}
      <div className="flex items-center justify-between border-b border-[#262330] px-4 pt-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative pb-2.5 text-xs font-semibold transition-colors",
                active ? "text-white" : "text-[#A19EAA] hover:text-white",
              )}
            >
              <span>{tab.label}</span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#7C3AED]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Auto Captions Switch Block */}
        <div className="flex items-center justify-between rounded-2xl border border-[#262330] bg-[#1A1722] p-3.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Auto Captions</span>
            </div>
            <p className="text-[11px] text-[#A19EAA]">
              Generate accurate captions in seconds
            </p>
          </div>
          <Switch
            checked={autoCaptions}
            onCheckedChange={(val) => {
              setAutoCaptions(val);
              toast.info(val ? "Auto captions enabled" : "Auto captions disabled");
            }}
            className="data-[state=checked]:bg-[#7C3AED]"
          />
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-[#262330] bg-[#1A1722] px-3.5 py-2.5 text-xs font-medium text-white transition-colors hover:border-[#7C3AED]/40"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇺🇸</span>
              <span>{language}</span>
            </div>
            <svg
              className="h-3.5 w-3.5 text-[#6B6778]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {langMenuOpen && (
            <div className="absolute left-0 right-0 top-11 z-20 overflow-hidden rounded-xl border border-[#262330] bg-[#1A1722] shadow-xl">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.label);
                    setLangMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-[#A19EAA] hover:bg-[#262330] hover:text-white"
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Caption Style 2x4 Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-white">Caption Style</label>
          <div className="grid grid-cols-4 gap-2">
            {CAPTION_PRESET_STYLES.map((style) => {
              const isSelected = caption.style === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setCaption((prev) => ({ ...prev, style: style.id }))}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-xl border border-[#262330] bg-[#1A1722] p-2.5 transition-all hover:border-[#7C3AED]/50",
                    isSelected &&
                      "border-[#7C3AED] ring-2 ring-[#7C3AED]/60 shadow-lg shadow-[#7C3AED]/25",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-bold",
                      style.id === "neon" && "text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]",
                      style.id === "glow" && "text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]",
                      style.id === "outline" && "text-transparent [-webkit-text-stroke:1px_white]",
                      style.id === "fade" && "text-white/40",
                      style.id === "bold" && "text-white font-extrabold",
                      style.id === "classic" && "text-white",
                      style.id === "modern" && "text-white",
                      style.id === "minimal" && "font-serif italic text-white",
                    )}
                  >
                    {style.preview}
                  </span>
                  <span className="text-[10px] font-medium text-[#A19EAA]">
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white">Font</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFontMenuOpen(!fontMenuOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-[#262330] bg-[#1A1722] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:border-[#7C3AED]/40"
            >
              <span>{fontFamily}</span>
              <svg
                className="h-3.5 w-3.5 text-[#6B6778]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {fontMenuOpen && (
              <div className="absolute left-0 right-0 top-10 z-20 overflow-hidden rounded-xl border border-[#262330] bg-[#1A1722] shadow-xl">
                {fonts.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setFontFamily(f);
                      setFontMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-xs text-[#A19EAA] hover:bg-[#262330] hover:text-white"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Size Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white">Size</label>
            <span className="font-mono text-xs text-white">
              {caption.fontSize}
            </span>
          </div>
          <Slider
            value={[caption.fontSize]}
            min={24}
            max={96}
            step={1}
            onValueChange={([val]) =>
              setCaption((prev) => ({ ...prev, fontSize: val }))
            }
            className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-[#7C3AED] [&_.relative]:bg-[#7C3AED]"
          />
        </div>

        {/* Color Swatches */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white">Color</label>
          <div className="flex items-center gap-2.5">
            {CAPTION_SWATCH_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setCaption((prev) => ({ ...prev, color: col }))}
                style={{ backgroundColor: col }}
                className={cn(
                  "h-6 w-6 rounded-full transition-transform hover:scale-110",
                  caption.color === col && "ring-2 ring-[#7C3AED] ring-offset-2 ring-offset-[#131118]",
                )}
              />
            ))}
            {/* Custom Plus Swatch */}
            <label className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-dashed border-[#6B6778] text-xs text-[#A19EAA] hover:border-white hover:text-white">
              +
              <input
                type="color"
                className="hidden"
                value={caption.color}
                onChange={(e) =>
                  setCaption((prev) => ({ ...prev, color: e.target.value }))
                }
              />
            </label>
          </div>
        </div>

        {/* Position Alignment */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white">Position</label>
          <div className="flex items-center gap-2">
            {[
              { id: "top", label: "Top" },
              { id: "center", label: "Center" },
              { id: "bottom", label: "Bottom" },
            ].map((p) => {
              const active = caption.position === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setCaption((prev) => ({
                      ...prev,
                      position: p.id as "top" | "center" | "bottom",
                    }))
                  }
                  className={cn(
                    "flex-1 rounded-xl border border-[#262330] py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                      : "bg-[#1A1722] text-[#A19EAA] hover:text-white",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
