import { useState } from "react";
import { cn } from "@/lib/utils";

interface SnipPugLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  onGlass?: boolean;
  className?: string;
  withStudioBadge?: boolean;
}

/**
 * Handcrafted squircle mascot logo for SnipPug.
 * Features Puggy with big twinkling eyes, floppy cocoa ears,
 * cute pink tongue, peach blush cheeks, and studio headphones.
 */
export function SnipPugLogo({
  size = "md",
  showWordmark = true,
  onGlass = false,
  className,
  withStudioBadge = false,
}: SnipPugLogoProps) {
  const [hovered, setHovered] = useState(false);

  // Dimension mapping
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-9.5 w-9.5",
    lg: "h-14 w-14",
    xl: "h-24 w-24 sm:h-28 sm:w-28",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("group flex items-center gap-2.5 transition-transform duration-150", className)}
    >
      {/* ── Squircle App Icon ── */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[26%] transition-all duration-200 select-none",
          iconSizes[size],
          onGlass
            ? "border border-white/50 bg-[#FDF9F3] shadow-[0_8px_20px_-4px_rgba(0,0,0,0.35)]"
            : "border-[1.5px] border-[#3a2a1c]/20 bg-gradient-to-b from-[#FFFDF9] to-[#F5E6CB] shadow-key",
          hovered && "scale-105 -rotate-2",
        )}
      >
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background Radial Glow */}
            <radialGradient
              id="pugBgGlow"
              cx="50%"
              cy="40%"
              r="60%"
              fx="50%"
              fy="35%"
            >
              <stop offset="0%" stopColor="#FFFDF7" />
              <stop offset="65%" stopColor="#F5E4C9" />
              <stop offset="100%" stopColor="#E6CFAD" />
            </radialGradient>

            {/* Pug Fawn Gradient */}
            <linearGradient id="fawnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E8C59A" />
              <stop offset="100%" stopColor="#D4A775" />
            </linearGradient>

            {/* Ear Gradient */}
            <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#553A26" />
              <stop offset="100%" stopColor="#3A2518" />
            </linearGradient>

            {/* Headphone Band Gradient */}
            <linearGradient id="hpBandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A3120" />
              <stop offset="50%" stopColor="#D9A668" />
              <stop offset="100%" stopColor="#4A3120" />
            </linearGradient>

            {/* Gloss / Shine Highlight */}
            <linearGradient id="glassShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Icon Base Background */}
          <rect width="120" height="120" rx="30" fill="url(#pugBgGlow)" />

          {/* Cute subtle background sparkles */}
          <g opacity="0.35">
            <path
              d="M22 28 Q 22 24 20 24 Q 22 24 22 20 Q 22 24 24 24 Q 22 24 22 28 Z"
              fill="#D4A775"
            />
            <path
              d="M100 24 Q 100 20 98 20 Q 100 20 100 16 Q 100 20 102 20 Q 100 20 100 24 Z"
              fill="#D4A775"
            />
          </g>

          {/* Mascot Group */}
          <g
            className={cn(
              "transition-transform duration-300 origin-bottom",
              hovered && "scale-[1.04] -translate-y-0.5",
            )}
          >
            {/* Floppy Left Ear */}
            <path
              d="M28 32 C 14 26, 10 56, 20 68 C 28 76, 38 70, 37 54 C 36 44, 33 36, 28 32 Z"
              fill="url(#earGrad)"
              stroke="#2C1A10"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Floppy Right Ear */}
            <path
              d="M92 32 C 106 26, 110 56, 100 68 C 92 76, 82 70, 83 54 C 84 44, 87 36, 92 32 Z"
              fill="url(#earGrad)"
              stroke="#2C1A10"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Pug Head Squircle/Oval */}
            <ellipse
              cx="60"
              cy="62"
              rx="40"
              ry="36"
              fill="url(#fawnGrad)"
              stroke="#2C1A10"
              strokeWidth="2.6"
            />

            {/* Cute Forehead Wrinkles */}
            <path
              d="M52 38 Q 60 34 68 38"
              stroke="#B38654"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M50 44 Q 60 39 70 44"
              stroke="#B38654"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Cute Studio Headphones Over Head */}
            <path
              d="M26 50 C 26 22, 94 22, 94 50"
              stroke="url(#hpBandGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left Earphone Cushion */}
            <rect
              x="18"
              y="46"
              width="12"
              height="20"
              rx="5"
              fill="#3A2518"
              stroke="#2C1A10"
              strokeWidth="1.8"
            />
            {/* Right Earphone Cushion */}
            <rect
              x="90"
              y="46"
              width="12"
              height="20"
              rx="5"
              fill="#3A2518"
              stroke="#2C1A10"
              strokeWidth="1.8"
            />

            {/* Cream Muzzle Patch */}
            <ellipse
              cx="60"
              cy="74"
              rx="24"
              ry="18"
              fill="#F9EEDD"
              stroke="#D4A775"
              strokeWidth="1.8"
            />

            {/* Big Expressive Sparkling Boba Eyes */}
            {/* Left Eye */}
            <g className="transition-transform duration-150">
              <circle cx="44" cy="56" r="8" fill="#2C1A10" />
              {/* Eye twinkle highlights */}
              <circle cx="42" cy="53.5" r="3" fill="#FFFFFF" />
              <circle cx="46.5" cy="58" r="1.3" fill="#FFFFFF" />
            </g>

            {/* Right Eye */}
            <g className="transition-transform duration-150">
              <circle cx="76" cy="56" r="8" fill="#2C1A10" />
              {/* Eye twinkle highlights */}
              <circle cx="74" cy="53.5" r="3" fill="#FFFFFF" />
              <circle cx="78.5" cy="58" r="1.3" fill="#FFFFFF" />
            </g>

            {/* Cheerful Peach Blush */}
            <ellipse cx="32" cy="68" rx="6.5" ry="4" fill="#FFA5B5" opacity="0.65" />
            <ellipse cx="88" cy="68" rx="6.5" ry="4" fill="#FFA5B5" opacity="0.65" />

            {/* Little Button Nose */}
            <path
              d="M55 64 H65 C68 64 68 67 65 71 C62 74 58 74 55 71 C52 67 52 64 55 64 Z"
              fill="#2C1A10"
            />

            {/* Smiling Mouth with Cute Pink Tongue */}
            <path
              d="M53 74 Q 60 78 67 74"
              stroke="#2C1A10"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Happy Little Tongue */}
            <path
              d="M56 75 C 56 82, 64 82, 64 75 Z"
              fill="#EF8896"
              stroke="#2C1A10"
              strokeWidth="1.6"
            />
          </g>

          {/* Top Glass Bevel Highlight */}
          <rect width="120" height="60" rx="30" fill="url(#glassShine)" />

          {/* Delicate border outline */}
          <rect
            x="0.75"
            y="0.75"
            width="118.5"
            height="118.5"
            rx="29.25"
            stroke="#2C1A10"
            strokeOpacity="0.12"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      {/* ── Brand Wordmark ── */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-bold tracking-tight transition-colors",
                textSizes[size],
                onGlass
                  ? "text-white [text-shadow:0_1px_10px_rgba(10,25,10,0.5)]"
                  : "text-foreground",
              )}
            >
              Snip<span className="text-[#D4A775] [text-shadow:none]">Pug</span>
            </span>

            {withStudioBadge && (
              <span className="rounded-full border border-[#D4A775]/50 bg-[#D4A775]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D4A775]">
                STUDIO
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
