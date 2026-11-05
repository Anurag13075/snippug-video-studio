import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { loadBrandKit, saveBrandKit, type BrandKitConfig } from "@/components/studio/BrandKitModal";
import { CAPTION_PRESET_STYLES, CAPTION_SWATCH_COLORS } from "@/components/studio/useStudioState";

export const Route = createFileRoute("/app/brand-kit")({
  component: BrandKitPage,
});

function BrandKitPage() {
  const [kit, setKit] = useState<BrandKitConfig>(loadBrandKit());

  useEffect(() => {
    setKit(loadBrandKit());
  }, []);

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
    toast.success("Brand Kit saved! Auto-applied to all future clips.");
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div className="border-b border-[#262330] pb-5">
        <h1 className="text-xl font-bold text-white">Brand Kit</h1>
        <p className="text-xs text-[#A19EAA] mt-1">
          Customize your logo, colors, and default caption style. Auto-applied to every new clip.
        </p>
      </div>

      <div className="rounded-3xl border border-[#262330] bg-[#131118] p-6 space-y-6">
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

        {/* Logo */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#A19EAA]">Watermark Logo</label>
          <div className="flex items-center gap-4">
            {kit.logoDataUrl ? (
              <img src={kit.logoDataUrl} alt="Logo" className="h-12 w-12 rounded-xl object-contain bg-black border border-[#262330]" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-[#262330] text-xs text-[#6B6778]">
                None
              </div>
            )}
            <label className="cursor-pointer rounded-xl border border-[#262330] bg-[#1A1722] px-3.5 py-2 text-xs font-semibold text-white hover:border-[#7C3AED]">
              Upload Image
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Primary Accent */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#A19EAA]">Primary Brand Accent</label>
          <div className="flex items-center gap-3">
            {CAPTION_SWATCH_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                style={{ backgroundColor: col }}
                onClick={() => setKit({ ...kit, primaryColor: col })}
                className={`h-7 w-7 rounded-full transition-transform ${kit.primaryColor === col ? "ring-2 ring-white scale-110" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Default Caption Preset */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#A19EAA]">Default Caption Preset</label>
          <div className="grid grid-cols-4 gap-2">
            {CAPTION_PRESET_STYLES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setKit({ ...kit, captionPreset: st.id })}
                className={`rounded-xl border p-2 text-xs font-semibold transition-colors ${
                  kit.captionPreset === st.id
                    ? "border-[#7C3AED] bg-[#7C3AED]/20 text-white"
                    : "border-[#262330] bg-[#1A1722] text-[#A19EAA]"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[#262330] flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-[#8B5CF6]"
          >
            Save Brand Kit
          </button>
        </div>
      </div>
    </div>
  );
}
