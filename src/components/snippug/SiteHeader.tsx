import { useEffect, useState } from "react";
import { Puggy } from "./Puggy";
import { useSound } from "./sound";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Puggy", href: "#puggy" },
  { label: "Studio", href: "#studio" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { enabled, toggle, play } = useSound();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onGlass = !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled
          ? "border-b border-border bg-background/85 shadow-card backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 pressable">
          <span
            className={cn(
              "h-9 w-9 overflow-hidden rounded-[26%] shadow-key",
              onGlass ? "border border-white/50" : "border-[1.5px] border-border",
            )}
          >
            <Puggy mood="snip" className="h-full w-full translate-y-[3px] scale-125" />
          </span>
          <span
            className={cn(
              "text-lg font-bold tracking-tight",
              onGlass && "text-white [text-shadow:0_1px_10px_rgba(10,25,10,0.5)]",
            )}
          >
            SnipPug
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => play("click")}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                onGlass
                  ? "text-white/95 [text-shadow:0_1px_8px_rgba(10,25,10,0.5)] hover:bg-white/15"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={enabled}
            title={enabled ? "Sound effects on — click to mute" : "Sound effects off — click to unmute"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
              onGlass
                ? "border-white/40 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
                : cn(
                    "border-[1.5px]",
                    enabled
                      ? "border-border bg-tan text-cocoa shadow-key"
                      : "border-border bg-card text-muted-foreground shadow-key",
                  ),
            )}
          >
            {enabled ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
                <path d="m16 9 6 6M22 9l-6 6" />
              </svg>
            )}
          </button>
          <a
            href="#studio"
            onClick={() => play("click")}
            className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-cocoa shadow-[0_6px_20px_-6px_rgba(15,30,15,0.45)] transition-all hover:-translate-y-px"
          >
            Open Studio
          </a>
        </div>
      </div>
    </header>
  );
}
