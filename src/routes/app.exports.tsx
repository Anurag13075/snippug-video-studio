import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/exports")({
  component: ExportsPage,
});

function ExportsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-[#262330] pb-5">
        <h1 className="text-xl font-bold text-white">Exported Clips</h1>
        <p className="text-xs text-[#A19EAA] mt-1">
          Finished 9:16 vertical exports rendered with burned-in subtitles.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#262330] bg-[#131118]/40 p-16 text-center">
        <span className="text-3xl mb-3">📦</span>
        <h3 className="text-sm font-bold text-white">No exports yet</h3>
        <p className="mt-1 max-w-xs text-xs text-[#A19EAA]">
          Exported clips are rendered 100% on-device in your browser and will appear here with direct download links.
        </p>
        <Link
          to="/app/clips/new"
          className="mt-5 rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#8B5CF6]"
        >
          Generate Clips Now →
        </Link>
      </div>
    </div>
  );
}
