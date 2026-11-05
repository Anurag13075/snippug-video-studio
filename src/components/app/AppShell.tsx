import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { openPolarCheckout } from "@/lib/polar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}

export function AppShell({ children }: AppShellProps) {
  const { user, isPro, signOut } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [talkModalOpen, setTalkModalOpen] = useState(false);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Creator";
  const userInitial = displayName.charAt(0).toUpperCase();

  const navSections = [
    {
      title: "Projects",
      items: [
        {
          label: "Home",
          to: "/app",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          ),
        },
        {
          label: "Starred",
          to: "/app/starred",
          badge: "0",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ),
        },
        {
          label: "Exports",
          to: "/app/exports",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Create",
      items: [
        {
          label: "Reaction Studio",
          to: "/app/clips/new",
          highlight: true,
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <circle cx="12" cy="7.5" r="1.5" />
            </svg>
          ),
        },
        {
          label: "Auto Captions",
          to: "/app/captions/new",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Learn",
      items: [
        {
          label: "Tutorials",
          to: "/app/help",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          ),
        },
        {
          label: "Changelog",
          to: "/app/help",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
              <circle cx="12" cy="12" r="2" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
              <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#0c0c0e] text-[#f4f4f5] select-none font-sans antialiased">
      {/* ── Left Sidebar (videocaptions.ai exact aesthetic) ── */}
      <aside className="flex h-full w-[240px] shrink-0 flex-col justify-between border-r border-[#1e1e24] bg-[#111114] p-3 text-xs">
        <div className="space-y-6">
          {/* Logo matching uppercase spaced style */}
          <Link
            to="/app"
            className="flex items-center gap-2 px-2.5 py-2 transition-opacity hover:opacity-90"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
            <span className="font-extrabold tracking-[0.2em] text-[13px] text-white uppercase">
              REACTION.AI
            </span>
          </Link>

          {/* Navigation Sections */}
          <nav className="space-y-5">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <span className="px-2.5 text-[11px] font-medium text-[#71717a]">
                  {sec.title}
                </span>
                <div className="space-y-0.5 pt-0.5">
                  {sec.items.map((item) => {
                    const active =
                      item.to === "/app"
                        ? currentPath === "/app"
                        : currentPath.startsWith(item.to);
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-150",
                          active
                            ? "bg-[#1c1c21] text-white shadow-sm"
                            : "text-[#8e8e93] hover:bg-[#18181c] hover:text-white",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn(active ? "text-white" : "text-[#71717a]")}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="rounded-full bg-[#1e1e24] px-1.5 py-0.2 text-[10px] font-mono text-[#71717a]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: User Card & Free Plan Box */}
        <div className="space-y-3 pt-3">
          {/* User Account Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex w-full items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-[#18181c]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F43F5E] text-xs font-bold text-white shadow-sm">
                  {userInitial}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="truncate text-xs font-semibold text-white">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[#71717a]">
                    {isPro ? "Pro" : "Free"}
                  </span>
                </div>
              </div>
              <svg
                className="h-3.5 w-3.5 text-[#71717a]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-12 left-0 right-0 z-30 rounded-2xl border border-[#27272a] bg-[#161619] p-1.5 shadow-2xl space-y-0.5">
                <Link
                  to="/app/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:bg-[#232328] hover:text-white"
                >
                  Settings
                </Link>
                <Link
                  to="/app/billing"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:bg-[#232328] hover:text-white"
                >
                  Billing & Plan
                </Link>
                <div className="my-1 h-px bg-[#27272a]" />
                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                    setUserDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-red-400 hover:bg-[#232328]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Free Plan Upgrade Card (Matching videocaptions.ai exact box) */}
          <div className="rounded-2xl border border-[#232328] bg-[#141417] p-3 text-xs space-y-2">
            <div className="font-semibold text-white text-xs">
              Free plan
            </div>
            <p className="text-[11px] text-[#8e8e93] leading-relaxed">
              Upgrade for HD exports, no watermark and more credits
            </p>
            <button
              type="button"
              onClick={() => openPolarCheckout(user?.email)}
              className="flex w-full items-center justify-center rounded-xl bg-[#2563EB] py-2 text-xs font-semibold text-white shadow-md shadow-[#2563EB]/25 hover:bg-[#1D4ED8] transition-all"
            >
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main App Content Column ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar matching videocaptions.ai */}
        <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-[#1e1e24] bg-[#0c0c0e] px-6">
          {/* Rewards Pill */}
          <button
            type="button"
            onClick={() => setTalkModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-[#232328] bg-[#141417] px-3 py-1.5 text-xs font-medium text-[#f4f4f5] hover:border-[#3f3f46] hover:bg-[#1a1a1e] transition-colors"
          >
            <span>🎁</span>
            <span>Rewards</span>
          </button>

          {/* What's New Pill */}
          <Link
            to="/app/help"
            className="flex items-center gap-1.5 rounded-full border border-[#232328] bg-[#141417] px-3 py-1.5 text-xs font-medium text-[#f4f4f5] hover:border-[#3f3f46] hover:bg-[#1a1a1e] transition-colors"
          >
            <span>📢</span>
            <span>What&apos;s New</span>
          </Link>

          {/* Credits Pill (🪙 25) */}
          <div className="flex items-center gap-1.5 rounded-full border border-[#232328] bg-[#141417] px-3 py-1.5 text-xs font-medium text-[#f4f4f5]">
            <span className="text-[#FBBF24]">🪙</span>
            <span className="font-semibold text-[#FBBF24]">25</span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8e8e93] hover:text-white hover:bg-[#18181c] transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>

          {/* Top User Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F43F5E] text-xs font-bold text-white shadow-sm">
            {userInitial}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 scrollbar-thin">
          <div className="mx-auto max-w-5xl min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* Floating "Talk to us" pill matching videocaptions.ai exact corner placement */}
      <div className="fixed bottom-5 right-6 z-40">
        <button
          type="button"
          onClick={() => setTalkModalOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[#27272a] bg-[#161619] px-3.5 py-1.5 text-xs font-medium text-white shadow-2xl hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-all"
        >
          <svg className="h-3.5 w-3.5 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Talk to us</span>
        </button>
      </div>

      {/* Talk To Us Modal */}
      {talkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#27272a] bg-[#141417] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Feedback & Support</h3>
              <button
                type="button"
                onClick={() => setTalkModalOpen(false)}
                className="text-[#71717a] hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              We&apos;d love to hear from you! Have an idea for a feature or need assistance with your reaction video?
            </p>
            <textarea
              placeholder="Tell us what you think or what you need..."
              rows={3}
              className="w-full rounded-xl border border-[#27272a] bg-[#1a1a1e] p-3 text-xs text-white placeholder-[#71717a] focus:border-[#2563EB] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                alert("Thank you for your feedback!");
                setTalkModalOpen(false);
              }}
              className="w-full rounded-xl bg-[#2563EB] py-2 text-xs font-semibold text-white shadow-md hover:bg-[#1D4ED8]"
            >
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
