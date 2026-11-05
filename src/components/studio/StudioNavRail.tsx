import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { openPolarCheckout } from "@/lib/polar";

interface StudioNavRailProps {
  activeTab: "home" | "projects" | "templates" | "brand" | "settings";
  onTabChange: (tab: "home" | "projects" | "templates" | "brand" | "settings") => void;
}

export function StudioNavRail({ activeTab, onTabChange }: StudioNavRailProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: Array<{
    id: "home" | "projects" | "templates" | "brand" | "settings";
    label: string;
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
          strokeLinecap="round"
          strokeLinejoin="round"
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
          strokeLinecap="round"
          strokeLinejoin="round"
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
          strokeLinecap="round"
          strokeLinejoin="round"
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
      icon: (active) => (
        <svg
          className={cn("h-4 w-4", active ? "text-[#7C3AED]" : "text-[#A19EAA]")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  const moreTools = [
    {
      id: "b-rolls",
      label: "AI B-Rolls",
      icon: (
        <svg className="h-3.5 w-3.5 text-[#A19EAA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      id: "ai-voice",
      label: "AI Voice",
      icon: (
        <svg className="h-3.5 w-3.5 text-[#A19EAA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
        </svg>
      ),
    },
    {
      id: "auto-zoom",
      label: "Auto Zoom",
      icon: (
        <svg className="h-3.5 w-3.5 text-[#A19EAA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
      ),
    },
    {
      id: "remove-bg",
      label: "Remove BG",
      icon: (
        <svg className="h-3.5 w-3.5 text-[#A19EAA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ),
    },
    {
      id: "speed",
      label: "Speed",
      icon: (
        <svg className="h-3.5 w-3.5 text-[#A19EAA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 14 14" />
        </svg>
      ),
    },
    {
      id: "translate",
      label: "Translate",
      icon: (
        <svg className="h-3.5 w-3.5 text-[#A19EAA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ];

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
                onClick={() => onTabChange(item.id)}
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

        {/* Go Pro Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#262330] bg-[#131118] p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm">👑</span>
            <span className="font-bold text-white">Go Pro</span>
          </div>
          <p className="mb-3 text-[11px] leading-relaxed text-[#A19EAA]">
            Unlock premium features and export in 4K
          </p>
          <button
            type="button"
            onClick={() => openPolarCheckout()}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#7C3AED] py-2 text-center text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#8B5CF6] active:scale-[0.98]"
          >
            <span>Upgrade</span>
            <span>→</span>
          </button>
        </div>

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
                onClick={() => toast.info(`Launched ${tool.label}`)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#262330]/60 bg-[#131118] p-2.5 text-center transition-all hover:border-[#7C3AED]/50 hover:bg-[#1A1722]"
              >
                {tool.icon}
                <span className="text-[10px] font-medium text-[#A19EAA]">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="relative pt-2 border-t border-[#262330]/60">
        <button
          type="button"
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="flex w-full items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-[#131118]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white">
              A
            </div>
            <span className="truncate text-xs font-semibold text-white">
              Anurag Sharma
            </span>
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
            <Link
              to="/login"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#A19EAA] hover:bg-[#262330] hover:text-white"
            >
              Switch Account
            </Link>
            <button
              type="button"
              onClick={() => {
                setUserDropdownOpen(false);
                toast.success("Signed out");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-[#262330]"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
