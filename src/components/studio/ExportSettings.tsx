import { useAuth } from "@/lib/auth";
import { createCheckoutUrl } from "@/lib/polar";
import type { ExportConfig } from "./useStudioState";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportSettingsProps {
  config: ExportConfig;
  setConfig: React.Dispatch<React.SetStateAction<ExportConfig>>;
}

export function ExportSettings({ config, setConfig }: ExportSettingsProps) {
  const { isPro, user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Format */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
          Container Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["webm", "mp4"] as const).map((fmt) => {
            const active = config.format === fmt;
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, format: fmt }))}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-[#E6C395] bg-[#2C241B] shadow-key"
                    : "border-[#3a3228] bg-[#1a1612] hover:border-[#5E5649]",
                )}
              >
                <div>
                  <div className="text-xs font-bold uppercase text-[#F5E6CB]">
                    .{fmt}
                  </div>
                  <div className="text-[10px] text-[#A89F91]">
                    {fmt === "webm" ? "High compatibility" : "H.264 standard"}
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

      {/* Resolution */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
            Render Quality & Resolution
          </label>
          {!isPro && (
            <Badge className="border-amber-400/40 bg-amber-400/10 text-[9px] font-bold text-amber-300">
              PRO UNLOCKS 1080P
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["720p", "1080p"] as const).map((res) => {
            const active = config.resolution === res;
            const locked = res === "1080p" && !isPro;
            return (
              <button
                key={res}
                type="button"
                disabled={locked}
                onClick={() => setConfig((prev) => ({ ...prev, resolution: res }))}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-[#E6C395] bg-[#2C241B] shadow-key"
                    : "border-[#3a3228] bg-[#1a1612] hover:border-[#5E5649]",
                  locked && "cursor-not-allowed opacity-50",
                )}
              >
                <div>
                  <div className="text-xs font-bold text-[#F5E6CB]">
                    {res === "720p" ? "720p HD" : "1080p FHD"}
                  </div>
                  <div className="text-[10px] text-[#A89F91]">
                    {res === "720p" ? "Instant (Free)" : "Crisp Master"}
                  </div>
                </div>
                {locked ? (
                  <span className="text-xs">🔒</span>
                ) : active ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E6C395] text-[10px] text-[#1a1612]">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[#A89F91]">
            Target Bitrate Quality
          </span>
          <span className="font-mono text-[#E6C395]">{config.quality}%</span>
        </div>
        <Slider
          value={[config.quality]}
          min={50}
          max={100}
          step={5}
          onValueChange={([val]) =>
            val !== undefined && setConfig((prev) => ({ ...prev, quality: val }))
          }
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3 rounded-xl border border-[#3a3228] bg-[#1a1612] p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-[#F5E6CB]">Include Audio</div>
            <div className="text-[10px] text-[#A89F91]">
              Capture microphone & stream tracks
            </div>
          </div>
          <Switch
            checked={config.includeAudio}
            onCheckedChange={(checked) =>
              setConfig((prev) => ({ ...prev, includeAudio: checked }))
            }
          />
        </div>

        <div className="h-px bg-[#3a3228]" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5E6CB]">
                SnipPug Watermark
              </span>
              {!isPro && (
                <span className="text-[9px] font-bold text-amber-400">PRO</span>
              )}
            </div>
            <div className="text-[10px] text-[#A89F91]">
              {isPro
                ? "Toggle watermark on/off freely"
                : "Watermark required on free plan"}
            </div>
          </div>
          <Switch
            checked={isPro ? config.watermark : true}
            disabled={!isPro}
            onCheckedChange={(checked) =>
              isPro && setConfig((prev) => ({ ...prev, watermark: checked }))
            }
          />
        </div>
      </div>

      {/* Upgrade CTA if not pro */}
      {!isPro && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 text-center">
          <div className="text-sm font-bold text-[#F5E6CB]">
            Unlock SnipPug Pro Forever
          </div>
          <p className="mt-1 text-xs text-[#A89F91]">
            1080p exports, remove watermark, unlimited queue, and lifetime updates.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                const url = createCheckoutUrl(user?.email);
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-5 text-xs font-bold text-[#1a1612] shadow-key hover:brightness-110"
            >
              Get Lifetime Access · Only $4
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
