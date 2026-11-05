import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CAPTION_PRESET_STYLES, CAPTION_SWATCH_COLORS, type CaptionStyle } from "./useStudioState";

export interface BrandKitConfig {
  name: string;
  primaryColor: string;
  fontFamily: string;
  captionPreset: CaptionStyle;
  watermarkEnabled: boolean;
  watermarkPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  logoDataUrl?: string;
}

const BRAND_KIT_KEY = "snippug_brand_kit";

export function loadBrandKit(): BrandKitConfig {
  try {
    const raw = localStorage.getItem(BRAND_KIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {
    name: "My Brand",
    primaryColor: "#7C3AED",
    fontFamily: "Inter",
    captionPreset: "bold",
    watermarkEnabled: false,
    watermarkPosition: "bottom-right",
  };
}

export function saveBrandKit(config: BrandKitConfig): void {
  try {
    localStorage.setItem(BRAND_KIT_KEY, JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (kit: BrandKitConfig) => void;
}

export function BrandKitModal({ isOpen, onClose, onApply }: BrandKitModalProps) {
  const [kit, setKit] = useState<BrandKitConfig>(loadBrandKit());

  useEffect(() => {
    if (isOpen) {
      setKit(loadBrandKit());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setKit((prev) => ({ ...prev, logoDataUrl: reader.result as string }));
      toast.success("Logo uploaded!");
    };
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    saveBrandKit(kit);
    onApply(kit);
    toast.success("Brand Kit saved and applied!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#262330] bg-[#131118] text-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#262330] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✨</span>
            <h2 className="text-base font-bold">Brand Kit Settings</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#A19EAA] hover:text-white">✕</button>
        </div>

        {/* Brand Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#A19EAA]">Brand Name</label>
          <input
            type="text"
            value={kit.name}
            onChange={(e) => setKit({ ...kit, name: e.target.value })}
            className="w-full rounded-xl border border-[#262330] bg-[#1A1722] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        {/* Brand Logo */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#A19EAA]">Brand Logo / Watermark</label>
          <div className="flex items-center gap-4">
            {kit.logoDataUrl ? (
              <img src={kit.logoDataUrl} alt="Logo" className="h-10 w-10 rounded-lg object-contain bg-black border border-[#262330]" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-[#262330] text-xs text-[#6B6778]">None</div>
            )}
            <label className="cursor-pointer rounded-xl border border-[#262330] bg-[#1A1722] px-3 py-1.5 text-xs text-white hover:border-[#7C3AED]">
              Upload Logo
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Primary Color */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#A19EAA]">Primary Brand Accent</label>
          <div className="flex items-center gap-2">
            {CAPTION_SWATCH_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                style={{ backgroundColor: col }}
                onClick={() => setKit({ ...kit, primaryColor: col })}
                className={`h-6 w-6 rounded-full transition-transform ${kit.primaryColor === col ? "ring-2 ring-white scale-110" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Default Caption Style */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#A19EAA]">Default Caption Preset</label>
          <div className="grid grid-cols-4 gap-1.5">
            {CAPTION_PRESET_STYLES.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setKit({ ...kit, captionPreset: p.id })}
                className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                  kit.captionPreset === p.id
                    ? "border-[#7C3AED] bg-[#7C3AED]/20 text-white"
                    : "border-[#262330] bg-[#1A1722] text-[#A19EAA]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[#262330]">
          <button type="button" onClick={onClose} className="rounded-xl border border-[#262330] px-4 py-2 text-xs text-[#A19EAA]">Cancel</button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-bold text-white hover:bg-[#8B5CF6]">Save Kit</button>
        </div>
      </div>
    </div>
  );
}
