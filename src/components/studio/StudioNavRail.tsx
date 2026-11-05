import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { openPolarCheckout } from "@/lib/polar";
import { useAuth } from "@/lib/auth";

interface StudioNavRailProps {
  activeTab: "home" | "projects" | "templates" | "brand" | "settings";
  onTabChange: (tab: "home" | "projects" | "templates" | "brand" | "settings") => void;
  onOpenBrandKit?: () => void;
  onRunAutoClip?: () => void;
  onTranscribe?: () => void;
}

export function StudioNavRail({
  activeTab,
  onTabChange,
  onOpenBrandKit,
  onRunAutoClip,
  onTranscribe,
}: StudioNavRailProps) {
  const { user, isPro, signOut } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: Array<{
    id: "home" | "projects" | "templates" | "brand" | "settings";
    label: string;
    action?: () => void;
    icon: (active: boolean) => React.ReactNode;
  }> = [
    {
      id: "home",
      label: "Home",
      icon: (active) => (
        <svg
          className={cn("h-4 w-4", active ? "text-[#7C3AED]" : "text-[#A19EAA]")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "projects",
      label: "My Projects",
      icon: (active) => (
        <svg
          className={cn("h-4 w-4", active ? "text-[#7C3AED]" : "text-[#A19EAA]")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "templates",
      label: "Templates",
      icon: (active) => (
        <svg
          className={cn("h-4 w-4", active ? "text-[#7C3AED]" : "text-[#A19EAA]")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      id: "brand",
      label: "Brand Kit",
      action: onOpenBrandKit,
      icon: (active) => (
        <svg
          className={cn("h-4 w-4", active ? "text-[#7C3AED]" : "text-[#A19EAA]")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (active) => (
        <svg
          className={cn("h-4 w-4", active ? "text-[#7C3AED]" : "text-[#A19EAA]")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const moreTools = [
    {
      id: "b-rolls",
      label: "AI Auto-Clip",
      action: onRunAutoClip,
      icon: (
        <svg className="h-3.5 w-3.5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      id: "ai-voice",
      label: "Transcribe",
      action: onTranscribe,
      icon: (
        <svg className="h-3.5 w-3.5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
        </svg>
      ),
    },
    {
      id: "brand-kit-tool",
      label: "Brand Kit",
      action: onOpenBrandKit,
      icon: (
        <svg className="h-3.5 w-3.5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      ),
    },
    {
      id: "remove-bg",
      label: "Remove BG",
      comingSoon: true,
      icon: (
        <svg className="h-3.5 w-3.5 text-[#6B6778]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ),
    },
    {
      id: "speed",
      label: "Fast Scrub",
      action: () => toast.info("Use J/K/L keyboard keys for high-speed scrubbing"),
      icon: (
        <svg className="h-3.5 w-3.5 text-[#A19EAA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 14 14" />
        </svg>
      ),
    },
    {
      id: "storage",
      label: "On-Device",
      action: () => toast.info("100% On-Device Browser Storage: Zero server video uploads!"),
      icon: (
        <svg className="h-3.5 w-3.5 text-[#4ADE80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Creator";

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="flex h-full w-[210px] shrink-0 flex-col justify-between border-r border-[#262330] bg-[#0B0A0F] p-3 text-xs">
      <div className="space-y-4">
        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  if (item.action) item.action();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors text-left",
                  active
                    ? "bg-[#1A1722] text-white"
                    : "text-[#A19EAA] hover:bg-[#131118] hover:text-white",
                )}
              >
                {item.icon(active)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Go Pro Card - Only displayed for Free users */}
        {!isPro && (
          <div className="relative overflow-hidden rounded-2xl border border-[#262330] bg-[#131118] p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm">👑</span>
              <span className="font-bold text-white">Go Pro</span>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-[#A19EAA]">
              Unlock 4K exports and remove watermark forever ($4)
            </p>
            <button
              type="button"
              onClick={() => openPolarCheckout(user?.email)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#7C3AED] py-2 text-center text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#8B5CF6] active:scale-[0.98]"
            >
              <span>Upgrade</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* More Tools Grid */}
        <div className="space-y-2">
          <span className="px-1 text-[11px] font-medium text-[#6B6778]">
            More Tools
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {moreTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                disabled={tool.comingSoon}
                onClick={tool.action}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#262330]/60 bg-[#131118] p-2.5 text-center transition-all",
                  tool.comingSoon
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-[#7C3AED]/50 hover:bg-[#1A1722] cursor-pointer",
                )}
              >
                {tool.icon}
                <span className="text-[10px] font-medium text-[#A19EAA]">
                  {tool.label}
                  {tool.comingSoon && <span className="block text-[8px] text-[#6B6778]">Soon</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Footer with Real Signed-in Identity */}
      <div className="relative pt-2 border-t border-[#262330]/60">
        <button
          type="button"
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="flex w-full items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-[#131118]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white">
              {userInitial}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="truncate text-xs font-semibold text-white">
                {displayName}
              </span>
              <span className="text-[10px] text-[#A19EAA]">
                {isPro ? "Pro Plan" : "Free Plan"}
              </span>
            </div>
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

        {userDropdownOpen && (
          <div className="absolute bottom-12 left-0 right-0 rounded-xl border border-[#262330] bg-[#1A1722] p-1.5 shadow-xl">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  setUserDropdownOpen(false);
                  toast.success("Signed out");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-[#262330]"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white hover:bg-[#262330]"
              >
                Sign in with Google
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
