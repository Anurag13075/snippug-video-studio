import { createFileRoute } from "@tanstack/react-router";
import { SoundProvider } from "@/components/snippug/sound";
import { SiteHeader } from "@/components/snippug/SiteHeader";
import { Hero } from "@/components/snippug/Hero";
import { HowItWorks } from "@/components/snippug/HowItWorks";
import { MoodStage } from "@/components/snippug/MoodStage";
import { ClipperStudio } from "@/components/snippug/ClipperStudio";
import { FeatureBento } from "@/components/snippug/FeatureBento";
import { Pricing } from "@/components/snippug/Pricing";
import { FAQ } from "@/components/snippug/FAQ";
import { WallOfLove, FinalCta } from "@/components/snippug/WallOfLove";
import { SiteFooter } from "@/components/snippug/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SnipPug — Slice long videos. Export viral clips." },
      {
        name: "description",
        content:
          "A cute, zero-AI video clipper that runs entirely in your browser. Drop a video, tap I and O to mark the good part, export a 9:16 Reel — no uploads, no accounts, no waiting.",
      },
      {
        property: "og:title",
        content: "SnipPug — Slice long videos. Export viral clips.",
      },
      {
        property: "og:description",
        content:
          "Meet Puggy: he never loses a frame. A tactile in-browser clipper with I/O keys, creator presets and 100% on-device privacy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "SnipPug — Slice long videos. Export viral clips.",
      },
      {
        name: "twitter:description",
        content:
          "Meet Puggy: he never loses a frame. A tactile in-browser clipper with I/O keys and 100% on-device privacy.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <SoundProvider>
      <div className="min-h-screen bg-background font-sans text-foreground">
        <SiteHeader />
        <main>
          <Hero />
          <HowItWorks />
          <MoodStage />
          <ClipperStudio />
          <FeatureBento />
          <Pricing />
          <FAQ />
          <WallOfLove />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
    </SoundProvider>
  );
}
