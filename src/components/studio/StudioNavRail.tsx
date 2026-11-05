import { Link } from "@tanstack/react-router";
import { SnipPugLogo } from "@/components/snippug/SnipPugLogo";
import { useAuth } from "@/lib/auth";
import { createCheckoutUrl } from "@/lib/polar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface StudioNavRailProps {
  currentTab: "home" | "exports" | "tutorials" | "changelog";
  setCurrentTab: (tab: "home" | "exports" | "tutorials" | "changelog") => void;
  exportCount: number;
}

export function StudioNavRail({
  currentTab,
  setCurrentTab,
  exportCount,
}: StudioNavRailProps) {
  const { user, isPro, signOut } = useAuth();

  const displayName =
    user?.user_metadata.full_name ||
    user?.user_metadata.name ||
    (user?.email ? user.email.split("@")[0] : "Creator");

  const avatarUrl =
    user?.user_metadata.avatar_url || user?.user_metadata.picture;

  const initial = displayName ? displayName[0]?.toUpperCase() : "C";

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col justify-between border-r border-white/5 bg-[#0f0e0d] p-3 text-sm select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 pt-1">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
            <SnipPugLogo size="sm" showWordmark={false} />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#E6C395]">
              SNIPPUG.AI
            </span>
          </Link>
        </div>

        {/* Projects Navigation */}
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6A6255]">
            Projects
          </p>

          <button
            type="button"
            onClick={() => setCurrentTab("home")}
            className={cn(
              "flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-xs font-medium transition-colors",
              currentTab === "home"
                ? "bg-[#1f1b16] font-semibold text-white shadow-sm"
                : "text-[#A89F91] hover:bg-white/5 hover:text-white",
            )}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("exports")}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-xl px-2.5 text-xs font-medium transition-colors",
              currentTab === "exports"
                ? "bg-[#1f1b16] font-semibold text-white shadow-sm"
                : "text-[#A89F91] hover:bg-white/5 hover:text-white",
            )}
          >
            <div className="flex items-center gap-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Exports Queue</span>
            </div>
            {exportCount > 0 && (
              <Badge className="h-4 bg-[#E6C395] px-1.5 text-[9px] font-bold text-[#1a1612]">
                {exportCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Resources Section */}
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6A6255]">
            Resources
          </p>

          <button
            type="button"
            onClick={() => setCurrentTab("tutorials")}
            className={cn(
              "flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-xs font-medium transition-colors",
              currentTab === "tutorials"
                ? "bg-[#1f1b16] font-semibold text-white"
                : "text-[#A89F91] hover:bg-white/5 hover:text-white",
            )}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
            <span>Tutorials</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("changelog")}
            className={cn(
              "flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-xs font-medium transition-colors",
              currentTab === "changelog"
                ? "bg-[#1f1b16] font-semibold text-white"
                : "text-[#A89F91] hover:bg-white/5 hover:text-white",
            )}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
              <circle cx="12" cy="12" r="2" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
            </svg>
            <span>Changelog</span>
          </button>
        </div>
      </div>

      {/* Bottom Profile & Pro Upgrade Card */}
      <div className="space-y-3 pt-4">
        {!isPro ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#161412] p-3 text-left">
            <div className="text-xs font-bold text-white">Free plan</div>
            <p className="mt-0.5 text-[10px] leading-tight text-[#A89F91]">
              Upgrade for 1080p exports, no watermark & batch queue.
            </p>
            <Button
              size="sm"
              onClick={() => {
                const url = createCheckoutUrl(user?.email);
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              className="mt-2.5 h-8 w-full rounded-xl bg-[#2563EB] text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
            >
              Upgrade · $4
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-center">
            <span className="text-[11px] font-bold text-amber-300">
              👑 PRO LIFETIME UNLOCKED
            </span>
          </div>
        )}

        {/* User Account Bar */}
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#141210] p-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className="h-7 w-7 border border-white/20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-[#E6C395] text-[10px] font-bold text-[#1a1612]">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="truncate text-left leading-none">
              <div className="truncate text-xs font-semibold text-white">
                {displayName}
              </div>
              <div className="mt-0.5 text-[9px] text-[#A89F91]">
                {isPro ? "Pro Member" : "Free"}
              </div>
            </div>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              title="Sign out"
              className="text-[#6A6255] hover:text-[#A89F91]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          ) : (
            <Link to="/login" className="text-[10px] font-semibold text-[#E6C395] hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
