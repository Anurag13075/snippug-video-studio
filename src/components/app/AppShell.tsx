import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { openPolarCheckout } from "@/lib/polar";
import { SnipPugLogo } from "@/components/snippug/SnipPugLogo";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}

export function AppShell({ children, title, breadcrumbs }: AppShellProps) {
  const { user, isPro, signOut } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [helpSheetOpen, setHelpSheetOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Creator";
  const userInitial = displayName.charAt(0).toUpperCase();

  const navSections = [
    {
      title: "Create",
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
          label: "Generate Clips",
          to: "/app/clips/new",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Library",
      items: [
        {
          label: "Projects",
          to: "/app/projects",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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
      title: "Customize",
      items: [
        {
          label: "Brand Kit",
          to: "/app/brand-kit",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Learn",
      items: [
        {
          label: "Help & FAQ",
          to: "/app/help",
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#0B0A0F] text-[#FFFFFF] select-none font-sans">
      {/* ── Left Sidebar (App Shell) ── */}
      <aside className="flex h-full w-[240px] shrink-0 flex-col justify-between border-r border-[#262330] bg-[#0F0E14] p-3 text-xs">
        <div className="space-y-5">
          {/* Brand Logo (Rendered Once) */}
          <Link to="/app" className="flex items-center gap-2.5 px-2 py-1 transition-opacity hover:opacity-90">
            <SnipPugLogo size="sm" withStudioBadge={false} />
            <div className="flex items-center text-sm font-bold tracking-tight">
              <span className="text-white">Snip</span>
              <span className="text-[#F59E0B]">Pug</span>
            </div>
          </Link>

          {/* Nav Sections */}
          <nav className="space-y-4">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B6778]">
                  {sec.title}
                </span>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const active = currentPath === item.to || (item.to !== "/app" && currentPath.startsWith(item.to));
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                          active
                            ? "bg-[#1A1722] text-white shadow-sm"
                            : "text-[#A19EAA] hover:bg-[#131118] hover:text-white",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn(active ? "text-[#7C3AED]" : "text-[#A19EAA]")}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="rounded-full bg-[#262330] px-1.5 py-0.2 text-[10px] font-mono text-[#6B6778]">
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

        {/* Bottom Section: Plan Upgrade & User Card */}
        <div className="space-y-3 pt-3 border-t border-[#262330]/60">
          {/* Plan Card for Free Users */}
          {!isPro && (
            <div className="rounded-2xl border border-[#262330] bg-[#131118] p-3 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>👑</span>
                <span>Free Plan</span>
              </div>
              <p className="text-[10px] text-[#A19EAA] leading-relaxed">
                Upgrade for 4K exports, no watermark, and longer video limits.
              </p>
              <button
                type="button"
                onClick={() => openPolarCheckout(user?.email)}
                className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#7C3AED] py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#8B5CF6] transition-all"
              >
                <span>Upgrade ($4)</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* User Account Card */}
          <div className="relative">
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
                    {isPro ? "Pro Member" : "Free Creator"}
                  </span>
                </div>
              </div>
              <svg className="h-3.5 w-3.5 text-[#6B6778]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-12 left-0 right-0 z-30 rounded-xl border border-[#262330] bg-[#1A1722] p-1.5 shadow-xl space-y-0.5">
                <Link
                  to="/app/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#A19EAA] hover:bg-[#262330] hover:text-white"
                >
                  Settings
                </Link>
                <Link
                  to="/app/billing"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#A19EAA] hover:bg-[#262330] hover:text-white"
                >
                  Billing & Plan
                </Link>
                <div className="my-1 h-px bg-[#262330]" />
                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                    setUserDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-[#262330]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main App Content Column ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#262330] bg-[#0B0A0F] px-6">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-xs">
            {breadcrumbs ? (
              <div className="flex items-center gap-2 text-[#A19EAA]">
                {breadcrumbs.map((b, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {b.to ? (
                      <Link to={b.to} className="hover:text-white">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-white font-semibold">{b.label}</span>
                    )}
                    {i < breadcrumbs.length - 1 && <span className="text-[#6B6778]">/</span>}
                  </span>
                ))}
              </div>
            ) : (
              <h1 className="text-sm font-bold text-white">{title || "Dashboard"}</h1>
            )}
          </div>

          {/* Right Controls: Usage Chip & Notifications */}
          <div className="flex items-center gap-3">
            {/* Real Usage Chip */}
            <Link
              to="/app/billing"
              className="flex items-center gap-2 rounded-xl border border-[#262330] bg-[#131118] px-3 py-1.5 text-xs transition-colors hover:border-[#7C3AED]/50"
            >
              <span className="h-2 w-2 rounded-full bg-[#4ADE80]" />
              <span className="font-mono text-white font-medium">45 min left</span>
            </Link>

            {/* Notification Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#262330] bg-[#131118] text-[#A19EAA] hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
          </div>
        </header>

        {/* Internal Scroll Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin">
          <div className="mx-auto max-w-6xl min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* ── Floating Need Help Bubble ── */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setHelpSheetOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[#262330] bg-[#1A1722] px-3.5 py-2 text-xs font-semibold text-white shadow-xl transition-all hover:border-[#7C3AED] hover:scale-105"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] text-white">
            ?
          </span>
          <span>Need help?</span>
        </button>
      </div>

      {/* ── Help Slide-over Sheet ── */}
      {helpSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="h-full w-full max-w-md border-l border-[#262330] bg-[#131118] p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#262330] pb-4">
                <h2 className="text-base font-bold text-white">SnipPug Help & FAQ</h2>
                <button type="button" onClick={() => setHelpSheetOpen(false)} className="text-[#A19EAA] hover:text-white">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-[#262330] bg-[#1A1722] p-3.5 space-y-1">
                  <h3 className="font-bold text-white">How does Auto-Clipping work?</h3>
                  <p className="text-[#A19EAA] leading-relaxed">
                    SnipPug extracts audio directly in your browser, transcribes dialogue with word timestamps, and uses AI to identify the highest-energy hooks.
                  </p>
                </div>

                <div className="rounded-xl border border-[#262330] bg-[#1A1722] p-3.5 space-y-1">
                  <h3 className="font-bold text-white">Are my source videos private?</h3>
                  <p className="text-[#A19EAA] leading-relaxed">
                    Yes! Video files stay 100% on your device using the browser Origin Private File System (OPFS). Video bytes never upload to cloud storage.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#262330]">
              <Link
                to="/app/help"
                onClick={() => setHelpSheetOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-[#1A1722] py-2 text-xs font-semibold text-white hover:bg-[#262330]"
              >
                View Full Documentation →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
