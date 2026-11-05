import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { StudioLayout } from "@/components/studio/StudioLayout";
import { SoundProvider } from "@/components/snippug/sound";

export const Route = createFileRoute("/app/studio/$projectId")({
  component: StudioProjectPage,
});

function StudioProjectPage() {
  const { projectId } = useParams({ from: "/app/studio/$projectId" });

  return (
    <SoundProvider>
      <div className="relative flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#0B0A0F]">
        {/* Top Back Nav Bar */}
        <div className="flex h-10 w-full items-center justify-between border-b border-[#262330] bg-[#0F0E14] px-4 text-xs">
          <Link
            to="/app"
            className="flex items-center gap-1.5 font-semibold text-[#A19EAA] hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          <span className="font-mono text-[10px] text-[#6B6778]">
            Project: {projectId}
          </span>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 overflow-hidden">
          <StudioLayout />
        </div>
      </div>
    </SoundProvider>
  );
}
