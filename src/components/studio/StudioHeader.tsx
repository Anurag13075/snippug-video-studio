import { Link } from "@tanstack/react-router";
import { Puggy } from "@/components/snippug/Puggy";
import { UserMenu } from "@/components/snippug/UserMenu";
import { useSound } from "@/components/snippug/sound";
import { Button } from "@/components/ui/button";
import { KeycapStatic } from "@/components/snippug/Keycap";
import { fmt } from "./useStudioState";
import { cn } from "@/lib/utils";

interface StudioHeaderProps {
  fileName: string;
  duration: number;
  onExport: () => void;
  exporting: boolean;
  snipCount: number;
}

export function StudioHeader({
  fileName,
  duration,
  onExport,
  exporting,
  snipCount,
}: StudioHeaderProps) {
  const { enabled, toggle, play } = useSound();

  return (
    <header className="flex h-13 shrink-0 items-center justify-between border-b border-[#3a3228] bg-[#1a1612] px-4">
      {/* Brand & Puggy */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-bold text-[#F5E6CB] transition-opacity hover:opacity-80"
        >
          <div className="h-7 w-7 overflow-hidden rounded-lg border border-[#3a3228] bg-[#231E18]">
            <Puggy mood="snip" className="h-full w-full scale-125" />
          </div>
          <span className="tracking-tight">SnipPug</span>
        </Link>
        <span className="text-[#5E5649]">/</span>
        <div className="flex items-center gap-1.5 rounded-full border border-[#3a3228] bg-[#231E18] px-2.5 py-0.5 text-xs text-[#E6C395]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">Studio</span>
        </div>
      </div>

      {/* File info */}
      <div className="hidden items-center gap-2 rounded-lg border border-[#3a3228]/60 bg-[#16120e] px-3 py-1 md:flex">
        <span className="max-w-[200px] truncate text-xs font-medium text-[#F5E6CB]">
          {fileName}
        </span>
        {duration > 0 && (
          <>
            <span className="text-[#5E5649]">·</span>
            <span className="font-mono text-xs text-[#A89F91]">
              {fmt(duration)}
            </span>
          </>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {/* Sound FX mute toggle */}
        <button
          type="button"
          onClick={toggle}
          aria-pressed={enabled}
          title={enabled ? "Mute studio sounds" : "Enable studio sounds"}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
            enabled
              ? "border-[#E6C395] bg-[#E6C395]/20 text-[#E6C395]"
              : "border-[#3a3228] bg-[#231E18] text-[#7A7163] hover:text-[#A89F91]",
          )}
        >
          {enabled ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
              <path d="m16 9 6 6M22 9l-6 6" />
            </svg>
          )}
        </button>

        {/* Quick Export Button */}
        <Button
          size="sm"
          disabled={exporting || duration <= 0}
          onClick={() => {
            play("click");
            onExport();
          }}
          className="h-8 rounded-lg bg-gradient-to-r from-[#E6C395] to-[#D9B183] px-3 text-xs font-bold text-[#1a1612] shadow-key hover:brightness-105"
        >
          <span>Export</span>
          <KeycapStatic className="ml-1.5 h-4 min-w-0 bg-white/40 px-1 text-[9px] text-[#1a1612]">
            ⌘E
          </KeycapStatic>
        </Button>

        {/* User Menu */}
        <UserMenu onGlass={false} />
      </div>
    </header>
  );
}
