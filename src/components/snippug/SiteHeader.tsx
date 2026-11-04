import { useEffect, useState } from "react";
import { Puggy } from "./Puggy";
import { useSound } from "./sound";
import { Button } from "@/components/ui/button";
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md transition-shadow",
        scrolled ? "border-border shadow-card" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 pressable">
          <span className="h-9 w-9 overflow-hidden rounded-xl border-[1.5px] border-border bg-cream shadow-key">
            <Puggy mood="snip" className="h-full w-full translate-y-[3px] scale-125" />
          </span>
          <span className="text-lg font-bold tracking-tight">SnipPug</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => play("click")}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
              "flex h-9 w-9 items-center justify-center rounded-xl border-[1.5px] border-b-[3.5px] pressable",
              enabled
                ? "border-border bg-tan text-cocoa shadow-key hover:shadow-key-active"
                : "border-border bg-card text-muted-foreground shadow-key hover:shadow-key-active",
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
          <Button
            asChild
            className="hidden rounded-xl border-b-[3px] border-cocoa/40 bg-primary px-4 font-semibold shadow-key hover:shadow-key-active active:translate-y-[2px] sm:inline-flex"
          >
            <a href="#studio" onClick={() => play("click")}>
              Open Studio
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
