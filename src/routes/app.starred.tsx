import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/starred")({
  component: StarredPage,
});

function StarredPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-[#262330] pb-5">
        <h1 className="text-xl font-bold text-white">Starred Projects</h1>
        <p className="text-xs text-[#A19EAA] mt-1">
          Quickly access your favorite clips and high-performing timelines.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#262330] bg-[#131118]/40 p-16 text-center">
        <span className="text-3xl mb-3">⭐</span>
        <h3 className="text-sm font-bold text-white">No starred projects yet</h3>
        <p className="mt-1 max-w-xs text-xs text-[#A19EAA]">
          Star any clip or project from your library to keep it pinned here for quick access.
        </p>
        <Link
          to="/app/projects"
          className="mt-5 rounded-xl border border-[#262330] bg-[#1A1722] px-4 py-2 text-xs font-semibold text-white hover:border-[#7C3AED]"
        >
          Browse Projects →
        </Link>
      </div>
    </div>
  );
}
