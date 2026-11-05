import { createFileRoute } from "@tanstack/react-router";
import { Pricing } from "@/components/snippug/Pricing";
import { SiteHeader } from "@/components/snippug/SiteHeader";
import { SiteFooter } from "@/components/snippug/SiteFooter";
import { SoundProvider } from "@/components/snippug/sound";

export const Route = createFileRoute("/pricing")({
  component: PublicPricingPage,
});

function PublicPricingPage() {
  return (
    <SoundProvider>
      <div className="min-h-screen bg-background font-sans text-foreground">
        <SiteHeader />
        <main className="py-12">
          <Pricing />
        </main>
        <SiteFooter />
      </div>
    </SoundProvider>
  );
}
