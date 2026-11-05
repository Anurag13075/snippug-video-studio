import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { SoundProvider, useSound } from "@/components/snippug/sound";
import { StudioLayout } from "@/components/studio/StudioLayout";
import { markAsPurchased } from "@/lib/polar";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — SnipPug Video Clipper" },
      {
        name: "description",
        content:
          "Full-screen dedicated viral video clipper. Mark in/out, reframe to 9:16 Reels, add kinetic captions and meme soundboard drops with 100% on-device speed.",
      },
    ],
  }),
  component: StudioPage,
});

function StudioContent() {
  const { play } = useSound();

  useEffect(() => {
    // Check if user just returned from successful Polar purchase
    const url = new URL(window.location.href);
    if (url.searchParams.get("purchase") === "success") {
      markAsPurchased();
      play("fanfare");
      toast.success("Welcome to SnipPug Pro! All features unlocked forever 🎉", {
        duration: 8000,
      });
      // Clean query param
      url.searchParams.delete("purchase");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [play]);

  return <StudioLayout />;
}

function StudioPage() {
  return (
    <SoundProvider>
      <StudioContent />
    </SoundProvider>
  );
}
