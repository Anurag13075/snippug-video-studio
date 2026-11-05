export function FloralCornerDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Top Left Floral Accent */}
      <svg
        className="absolute -top-10 -left-10 w-72 h-72 md:w-96 md:h-96 opacity-40 mix-blend-screen transition-opacity duration-500"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="flowerGrad1" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1D4ED8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="petalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer ambient glow */}
        <circle cx="120" cy="120" r="140" fill="url(#flowerGrad1)" filter="blur(30px)" />

        {/* Stylized petals */}
        <g stroke="#93C5FD" strokeWidth="0.8" strokeOpacity="0.4">
          <ellipse cx="120" cy="80" rx="45" ry="75" transform="rotate(-25 120 80)" fill="url(#petalGrad1)" />
          <ellipse cx="70" cy="130" rx="75" ry="45" transform="rotate(-15 70 130)" fill="url(#petalGrad1)" />
          <ellipse cx="150" cy="150" rx="55" ry="65" transform="rotate(35 150 150)" fill="url(#petalGrad1)" />
          <ellipse cx="80" cy="70" rx="35" ry="55" transform="rotate(50 80 70)" fill="url(#petalGrad1)" />
          <ellipse cx="170" cy="100" rx="40" ry="60" transform="rotate(75 170 100)" fill="url(#petalGrad1)" />

          {/* Detailed petal veins */}
          <path d="M120 80 Q100 40 80 20" stroke="#BFDBFE" strokeWidth="0.75" />
          <path d="M70 130 Q30 110 10 90" stroke="#BFDBFE" strokeWidth="0.75" />
          <path d="M150 150 Q200 190 240 220" stroke="#BFDBFE" strokeWidth="0.75" />
          <path d="M80 70 Q40 50 15 30" stroke="#BFDBFE" strokeWidth="0.75" />
          <path d="M170 100 Q220 90 260 80" stroke="#BFDBFE" strokeWidth="0.75" />

          {/* Central pistil & stamen dots */}
          <circle cx="115" cy="115" r="16" fill="#1E40AF" stroke="#93C5FD" strokeWidth="1.2" />
          <circle cx="112" cy="112" r="3" fill="#DBEAFE" />
          <circle cx="118" cy="116" r="2.5" fill="#DBEAFE" />
          <circle cx="110" cy="118" r="2" fill="#93C5FD" />
          <circle cx="122" cy="110" r="2" fill="#93C5FD" />
        </g>
      </svg>

      {/* Bottom Right Floral Accent */}
      <svg
        className="absolute -bottom-10 -right-10 w-72 h-72 md:w-96 md:h-96 opacity-40 mix-blend-screen transition-opacity duration-500"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="flowerGrad2" cx="60%" cy="60%" r="60%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1D4ED8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="petalGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer ambient glow */}
        <circle cx="280" cy="280" r="140" fill="url(#flowerGrad2)" filter="blur(30px)" />

        {/* Stylized petals */}
        <g stroke="#93C5FD" strokeWidth="0.8" strokeOpacity="0.4">
          <ellipse cx="280" cy="320" rx="45" ry="75" transform="rotate(-25 280 320)" fill="url(#petalGrad2)" />
          <ellipse cx="330" cy="270" rx="75" ry="45" transform="rotate(-15 330 270)" fill="url(#petalGrad2)" />
          <ellipse cx="250" cy="250" rx="55" ry="65" transform="rotate(35 250 250)" fill="url(#petalGrad2)" />
          <ellipse cx="320" cy="330" rx="35" ry="55" transform="rotate(50 320 330)" fill="url(#petalGrad2)" />
          <ellipse cx="230" cy="300" rx="40" ry="60" transform="rotate(75 230 300)" fill="url(#petalGrad2)" />

          {/* Detailed petal veins */}
          <path d="M280 320 Q300 360 320 380" stroke="#BFDBFE" strokeWidth="0.75" />
          <path d="M330 270 Q370 290 390 310" stroke="#BFDBFE" strokeWidth="0.75" />
          <path d="M250 250 Q200 210 160 180" stroke="#BFDBFE" strokeWidth="0.75" />

          {/* Central pistil & stamen dots */}
          <circle cx="285" cy="285" r="16" fill="#1E40AF" stroke="#93C5FD" strokeWidth="1.2" />
          <circle cx="288" cy="288" r="3" fill="#DBEAFE" />
          <circle cx="282" cy="284" r="2.5" fill="#DBEAFE" />
          <circle cx="290" cy="282" r="2" fill="#93C5FD" />
        </g>
      </svg>
    </div>
  );
}
