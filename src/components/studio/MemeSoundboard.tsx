import { useState } from "react";
import { MEME_SOUNDS, playMemeSound, type MemeSound } from "./studio-sounds";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MemeSoundboardProps {
  volume: number;
  setVolume: (v: number) => void;
}

export function MemeSoundboard({ volume, setVolume }: MemeSoundboardProps) {
  const [activeSound, setActiveSound] = useState<MemeSound | null>(null);

  const triggerSound = (id: MemeSound) => {
    setActiveSound(id);
    playMemeSound(id, volume);
    setTimeout(() => setActiveSound(null), 300);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#3a3228] bg-[#1a1612] p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[#A89F91]">
            Drop Volume
          </span>
          <span className="font-mono text-[#E6C395]">{Math.round(volume * 100)}%</span>
        </div>
        <Slider
          value={[volume * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([val]) => val !== undefined && setVolume(val / 100)}
          className="mt-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
            Soundboard Pads
          </label>
          <span className="text-[10px] text-[#7A7163]">Web Audio Procedural</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {MEME_SOUNDS.map((s) => {
            const isPlaying = activeSound === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => triggerSound(s.id)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-b-4 border-[#3a3228] bg-[#231E18] p-4 text-center transition-all",
                  "hover:border-[#E6C395] hover:bg-[#2C241B]",
                  isPlaying && "translate-y-1 border-b-[1.5px] border-[#E6C395] bg-[#E6C395]/20 shadow-key-active",
                )}
              >
                <span className="text-2xl transition-transform group-hover:scale-110">
                  {s.emoji}
                </span>
                <span className="text-xs font-bold text-[#F5E6CB]">
                  {s.label}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#A89F91]">
                  Tap to drop
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[#3a3228]/60 bg-[#16120e] p-3 text-xs text-[#A89F91]">
        💡 <strong className="text-[#F5E6CB]">Creator Tip:</strong> Timing sound effects with punchlines or scene cuts increases short-form retention by 38%.
      </div>
    </div>
  );
}
