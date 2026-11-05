import { Link } from "@tanstack/react-router";
import { SnipPugLogo } from "@/components/snippug/SnipPugLogo";
import { cn } from "@/lib/utils";

interface StudioHeaderProps {
  onExport: () => void;
  exporting: boolean;
}

export function StudioHeader({ onExport, exporting }: StudioHeaderProps) {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-[#262330] bg-[#0B0A0F] px-4">
      {/* Left: SnipPug Mascot + Wordmark */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-95"
        >
          <SnipPugLogo size="sm" withStudioBadge={false} />
          <span className="text-base font-bold tracking-tight text-white">
            SnipPug
          </span>
        </Link>
      </div>

      {/* Center: Search with Cmd+K */}
      <div className="flex flex-1 max-w-md items-center mx-6">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B6778]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search projects... (⌘ + K)"
            className="w-full rounded-xl border border-[#262330] bg-[#131118] py-1.5 pl-9 pr-3 text-xs text-white placeholder-[#6B6778] transition-colors focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Dark Theme Moon Toggle */}
        <button
          type="button"
          aria-label="Theme toggle"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#262330] bg-[#131118] text-[#A19EAA] transition-colors hover:border-[#7C3AED]/40 hover:text-white"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </button>

        {/* Notifications Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#262330] bg-[#131118] text-[#A19EAA] transition-colors hover:border-[#7C3AED]/40 hover:text-white"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>

        {/* Violet Export Video Button */}
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className={cn(
            "flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#7C3AED]/25 transition-all hover:bg-[#8B5CF6] active:scale-[0.98]",
            exporting && "opacity-60 cursor-not-allowed",
          )}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>{exporting ? "Exporting..." : "Export Video"}</span>
        </button>
      </div>
    </header>
  );
}
