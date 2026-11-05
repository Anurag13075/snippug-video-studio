import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FloralCornerDecoration } from "@/components/app/FloralDecoration";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reaction.AI — The Reaction & Commentary Video Studio" },
      {
        name: "description",
        content:
          "Create viral split-screen, Picture-in-Picture, and commentary videos for TikTok, Reels, and YouTube Shorts in seconds. Record your webcam live or drop clips — 100% in your browser.",
      },
      {
        property: "og:title",
        content: "Reaction.AI — The Reaction & Commentary Video Studio",
      },
      {
        property: "og:description",
        content:
          "Split-screen, Picture-in-Picture, and auto-captioned commentary videos for TikTok, Reels & Shorts. Zero CapCut headache.",
      },
    ],
  }),
  component: ReactionLandingPage,
});

function ReactionLandingPage() {
  const [activePreset, setActivePreset] = useState<"split" | "pip" | "side">("split");
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceRef = useRef<HTMLVideoElement>(null);
  const reactionRef = useRef<HTMLVideoElement>(null);

  const toggleDemoPlay = () => {
    const s = sourceRef.current;
    const r = reactionRef.current;
    if (!s || !r) return;

    if (isPlaying) {
      s.pause();
      r.pause();
      setIsPlaying(false);
    } else {
      r.currentTime = s.currentTime;
      void s.play();
      void r.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#f4f4f5] font-sans antialiased selection:bg-[#2563EB] selection:text-white">
      {/* ── 1. GLOBAL NAVBAR (Matching videocaptions.ai exact clean style) ── */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e24] bg-[#0c0c0e]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
            <span className="font-extrabold tracking-[0.22em] text-sm text-white uppercase">
              REACTION.AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#8e8e93]">
            <a href="#demo" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#presets" className="hover:text-white transition-colors">
              Presets
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-block text-xs font-medium text-[#8e8e93] hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/app"
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#2563EB]/25 hover:bg-[#1D4ED8] transition-all"
            >
              Start Free →
            </Link>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {/* Subtle Ambient Background Corner Flowers */}
        <FloralCornerDecoration />

        {/* ── 2. HERO SECTION ── */}
        <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 text-center space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#141417] px-4 py-1.5 text-xs font-medium text-[#8e8e93]">
            <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-white font-semibold">The Reaction & Commentary Studio</span>
            <span className="text-[#71717a]">·</span>
            <span>Zero CapCut Headache</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Create Viral Reaction Videos{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#2563EB] bg-clip-text text-transparent">
              in 60 Seconds.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#8e8e93] leading-relaxed">
            Split-screen, Picture-in-Picture, and auto-captioned commentary videos for TikTok, Reels & Shorts.
            Record your webcam live or drop clips with auto-ducked audio — 100% in your browser.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              to="/app/clips/new"
              className="rounded-xl bg-[#2563EB] px-7 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-[#2563EB]/30 hover:bg-[#1D4ED8] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Start Making Reactions Free →
            </Link>
            <a
              href="#demo"
              className="rounded-xl border border-[#27272a] bg-[#141417] px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:border-[#3f3f46] hover:bg-[#18181c] transition-all"
            >
              Watch 9:16 Demo 🎬
            </a>
          </div>

          {/* Social Proof Metric Chips */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-[#71717a]">
            <div className="flex items-center gap-2">
              <span className="text-[#4ADE80]">✓</span>
              <span>100% On-Device Privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4ADE80]">✓</span>
              <span>Built-in Camera & Mic Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4ADE80]">✓</span>
              <span>Auto-Duck Voice Audio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4ADE80]">✓</span>
              <span>Direct 9:16 MP4 Export</span>
            </div>
          </div>
        </section>

        {/* ── 3. LIVE INTERACTIVE 9:16 DEMO PREVIEW (Anchor #demo) ── */}
        <section id="demo" className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-3xl border border-[#232328] bg-[#141417] p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232328] pb-5">
              <div>
                <h3 className="text-base font-bold text-white">Interactive Studio Preview</h3>
                <p className="text-xs text-[#8e8e93]">
                  Try switching between the 3 viral reaction formats right here.
                </p>
              </div>

              {/* Format Toggle Buttons */}
              <div className="flex items-center rounded-xl border border-[#27272a] bg-[#18181c] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActivePreset("split")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-semibold transition-all",
                    activePreset === "split"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#8e8e93] hover:text-white",
                  )}
                >
                  ↕️ TikTok Split
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreset("pip")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-semibold transition-all",
                    activePreset === "pip"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#8e8e93] hover:text-white",
                  )}
                >
                  🔘 PiP Bubble
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreset("side")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-semibold transition-all",
                    activePreset === "side"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#8e8e93] hover:text-white",
                  )}
                >
                  ↔️ Side-by-Side
                </button>
              </div>
            </div>

            {/* 9:16 Showcase Display */}
            <div className="flex flex-col items-center">
              <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-3xl border border-[#27272a] bg-black shadow-2xl select-none">
                {activePreset === "split" && (
                  <div className="flex h-full w-full flex-col">
                    <div className="relative h-1/2 w-full overflow-hidden bg-black">
                      <video
                        ref={sourceRef}
                        src="/samples/tech-review.mp4"
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-2 left-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[9px] text-[#93C5FD]">
                        SOURCE VIDEO
                      </span>
                    </div>
                    <div className="h-1 w-full bg-[#2563EB]" />
                    <div className="relative h-1/2 w-full overflow-hidden bg-black">
                      <video
                        ref={reactionRef}
                        src="/samples/podcast-snippet.mp4"
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover -scale-x-100"
                      />
                      <span className="absolute top-2 left-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[9px] text-[#F43F5E]">
                        YOU (REACTION 🎙️)
                      </span>
                    </div>
                  </div>
                )}

                {activePreset === "pip" && (
                  <div className="relative h-full w-full overflow-hidden bg-black">
                    <video
                      ref={sourceRef}
                      src="/samples/tech-review.mp4"
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-12 right-4 h-24 w-24 overflow-hidden rounded-full border-2 border-[#2563EB] shadow-2xl bg-black">
                      <video
                        ref={reactionRef}
                        src="/samples/podcast-snippet.mp4"
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover -scale-x-100"
                      />
                    </div>
                  </div>
                )}

                {activePreset === "side" && (
                  <div className="flex h-full w-full">
                    <div className="relative h-full w-1/2 overflow-hidden bg-black">
                      <video
                        ref={sourceRef}
                        src="/samples/tech-review.mp4"
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="w-1 h-full bg-[#2563EB]" />
                    <div className="relative h-full w-1/2 overflow-hidden bg-black">
                      <video
                        ref={reactionRef}
                        src="/samples/podcast-snippet.mp4"
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover -scale-x-100"
                      />
                    </div>
                  </div>
                )}

                {/* Kinetic Subtitles Mockup */}
                <div className="absolute inset-x-3 bottom-6 flex justify-center pointer-events-none">
                  <span className="rounded-xl bg-black/80 px-3 py-1.5 text-center text-xs font-bold text-white shadow-lg backdrop-blur-xs">
                    Wait... did you see that?! 🤯
                  </span>
                </div>

                {/* Play/Pause Button */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={toggleDemoPlay}
                    className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-transform hover:scale-110 border border-white/20 shadow-2xl"
                  >
                    <span className="text-xl ml-0.5">▶</span>
                  </button>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={toggleDemoPlay}
                  className="rounded-xl border border-[#27272a] bg-[#18181c] px-4 py-2 text-xs font-semibold text-white hover:border-[#2563EB] transition-colors"
                >
                  {isPlaying ? "❚❚ Pause Sync Demo" : "▶ Play Dual Video Sync"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. HOW IT WORKS (3 SIMPLE STEPS) ── */}
        <section className="mx-auto max-w-5xl px-6 py-16 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Three steps. One viral reaction video.
            </h2>
            <p className="text-xs sm:text-sm text-[#8e8e93]">
              No timeline cutting, no keyframing, no manual audio alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-[#232328] bg-[#141417] p-7 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/15 text-lg font-bold text-[#60A5FA]">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Pick Video to React To</h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Drop in any video file or choose from our 1-click trending clips (gaming clutches, tech reveals, podcast debates).
              </p>
            </div>

            <div className="rounded-3xl border border-[#232328] bg-[#141417] p-7 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/15 text-lg font-bold text-[#60A5FA]">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Record Webcam & Voice</h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Record your face and microphone directly in your browser with a 3-2-1 countdown, or upload your selfie video.
              </p>
            </div>

            <div className="rounded-3xl border border-[#232328] bg-[#141417] p-7 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/15 text-lg font-bold text-[#60A5FA]">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Auto-Duck & Export 9:16</h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Choose Split or PiP, hit &quot;Auto-Duck&quot; to keep your voice loud and clear, and download your 9:16 video instantly.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. CORE FEATURES BENTO GRID (Anchor #features) ── */}
        <section id="features" className="mx-auto max-w-5xl px-6 py-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built specifically for reaction creators.
            </h2>
            <p className="text-xs sm:text-sm text-[#8e8e93]">
              Every tool you need to turn someone else&apos;s video into your viral short.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-[#232328] bg-[#141417] p-8 space-y-4">
              <div className="text-2xl">🎙️</div>
              <h3 className="text-base font-bold text-white">Smart Audio Ducking</h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Nothing ruins a reaction like the background video drowning out your commentary.
                Our audio engine automatically lowers the source clip to 20% so your voice is always punchy and clear.
              </p>
            </div>

            <div className="rounded-3xl border border-[#232328] bg-[#141417] p-8 space-y-4">
              <div className="text-2xl">💬</div>
              <h3 className="text-base font-bold text-white">Kinetic Reaction Captions</h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                85% of TikTok and Reels users watch videos with sound off.
                Burn animated, high-contrast captions on your facecam to lock in silent viewers.
              </p>
            </div>

            <div className="rounded-3xl border border-[#232328] bg-[#141417] p-8 space-y-4">
              <div className="text-2xl">⚡</div>
              <h3 className="text-base font-bold text-white">100% In-Browser Privacy</h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Powered by Origin Private File System (OPFS).
                Your video files never upload to a cloud server or wait in long render queues.
              </p>
            </div>

            <div className="rounded-3xl border border-[#232328] bg-[#141417] p-8 space-y-4">
              <div className="text-2xl">📱</div>
              <h3 className="text-base font-bold text-white">Direct 9:16 Short Exports</h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Export high-bitrate MP4 and WebM videos pre-formatted with vertical aspect ratios ready to upload to TikTok, Instagram Reels, and YouTube Shorts.
              </p>
            </div>
          </div>
        </section>

        {/* ── 6. PRICING SECTION (Anchor #pricing) ── */}
        <section id="pricing" className="mx-auto max-w-4xl px-6 py-16 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Simple, transparent pricing.
            </h2>
            <p className="text-xs sm:text-sm text-[#8e8e93]">
              Start for free today. Upgrade when you need high-volume 4K exports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Free Tier */}
            <div className="rounded-3xl border border-[#232328] bg-[#141417] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
                  Free Forever
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-[#71717a]">/ month</span>
                </div>
                <p className="text-xs text-[#8e8e93]">
                  Everything you need to create and export split-screen reaction videos.
                </p>
                <div className="space-y-2.5 pt-2 text-xs text-[#f4f4f5]">
                  <div className="flex items-center gap-2">✓ 1080p Split-Screen Exports</div>
                  <div className="flex items-center gap-2">✓ Live Webcam & Mic Recording</div>
                  <div className="flex items-center gap-2">✓ Audio Ducking & Mixing</div>
                  <div className="flex items-center gap-2">✓ 5 Reaction Runs per Month</div>
                </div>
              </div>

              <Link
                to="/app/clips/new"
                className="w-full rounded-xl border border-[#27272a] bg-[#18181c] py-2.5 text-center text-xs font-semibold text-white hover:border-[#3f3f46] hover:bg-[#202025] transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="relative rounded-3xl border border-[#2563EB] bg-[#141417] p-8 flex flex-col justify-between space-y-6 shadow-2xl shadow-[#2563EB]/15">
              <div className="absolute -top-3 right-6 rounded-full bg-[#2563EB] px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                Popular
              </div>

              <div className="space-y-4">
                <div className="text-xs font-semibold text-[#60A5FA] uppercase tracking-wider">
                  Pro Creator
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$4</span>
                  <span className="text-xs text-[#71717a]">/ month</span>
                </div>
                <p className="text-xs text-[#8e8e93]">
                  For daily creators, streamers, and commentary channels.
                </p>
                <div className="space-y-2.5 pt-2 text-xs text-white">
                  <div className="flex items-center gap-2">✓ 4K Ultra-HD Video Exports</div>
                  <div className="flex items-center gap-2">✓ No Watermarks</div>
                  <div className="flex items-center gap-2">✓ Unlimited Reaction Projects</div>
                  <div className="flex items-center gap-2">✓ Priority In-Browser Rendering</div>
                </div>
              </div>

              <Link
                to="/app"
                className="w-full rounded-xl bg-[#2563EB] py-2.5 text-center text-xs font-semibold text-white shadow-md shadow-[#2563EB]/30 hover:bg-[#1D4ED8] transition-all"
              >
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 7. FAQ (Anchor #faq) ── */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#8e8e93]">
              Everything you need to know about Reaction.AI
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#232328] bg-[#141417] p-5 space-y-2">
              <h4 className="text-sm font-bold text-white">
                How is Reaction.AI different from Opus Clip or CapCut?
              </h4>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Opus Clip is built for cutting long podcasts into monologue clips. CapCut requires manual multi-track editing, dragging layers, and aligning keyframes.
                Reaction.AI is built 100% for reaction & commentary videos: drop a clip, record your webcam, pick your split layout, and export in 60 seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-[#232328] bg-[#141417] p-5 space-y-2">
              <h4 className="text-sm font-bold text-white">
                Can I record directly with my webcam and microphone?
              </h4>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Yes! Our in-browser recorder gives you a live camera preview, countdown, and synchronized microphone capture. Or if you already recorded a facecam clip, you can upload it directly.
              </p>
            </div>

            <div className="rounded-2xl border border-[#232328] bg-[#141417] p-5 space-y-2">
              <h4 className="text-sm font-bold text-white">
                Do my video files get uploaded to your servers?
              </h4>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                No. All compositing, canvas splitting, and video rendering happens 100% inside your browser using the HTML5 Canvas and MediaRecorder APIs. Your private media stays on your computer.
              </p>
            </div>
          </div>
        </section>

        {/* ── 8. FINAL CALL TO ACTION ── */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="rounded-3xl border border-[#2563EB]/40 bg-gradient-to-b from-[#161622] to-[#111118] p-10 sm:p-14 space-y-6 shadow-2xl shadow-[#2563EB]/15">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to create viral reaction videos?
            </h2>
            <p className="mx-auto max-w-lg text-xs sm:text-sm text-[#8e8e93]">
              Join thousands of creators making TikToks, Reels, and Shorts without opening a complex video editor.
            </p>
            <div className="pt-2">
              <Link
                to="/app/clips/new"
                className="inline-flex rounded-xl bg-[#2563EB] px-8 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-[#2563EB]/30 hover:bg-[#1D4ED8] transition-all"
              >
                Start Reaction Studio Free →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── 9. FOOTER ── */}
      <footer className="border-t border-[#1e1e24] bg-[#0c0c0e] py-10 px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-[#71717a]">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-white uppercase">REACTION.AI</span>
            <span>·</span>
            <span>The Reaction & Commentary Video Studio</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/app" className="hover:text-white transition-colors">
              Studio
            </Link>
            <Link to="/app/help" className="hover:text-white transition-colors">
              Help & FAQ
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
