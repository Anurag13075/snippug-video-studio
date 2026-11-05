import { useEffect } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/app/studio/$projectId")({
  component: StudioRedirectPage,
});

function StudioRedirectPage() {
  const { projectId } = useParams({ from: "/app/studio/$projectId" });
  const navigate = useNavigate();

  useEffect(() => {
    // Gracefully redirect to the clean clips workflow
    if (projectId && projectId.startsWith("caption-")) {
      void navigate({ to: "/app/captions/new" });
    } else if (projectId && projectId !== "new") {
      void navigate({ to: "/app/clips/$runId", params: { runId: projectId } });
    } else {
      void navigate({ to: "/app/clips/new" });
    }
  }, [projectId, navigate]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED]/20 text-2xl text-[#8B5CF6] animate-spin">
        ⚡
      </div>
      <p className="mt-3 text-xs text-[#A19EAA]">Loading workspace...</p>
    </div>
  );
}
