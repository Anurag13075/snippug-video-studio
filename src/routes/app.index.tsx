import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getAllProjects, type StoredProject, deleteMediaFile } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: AppHomePage,
});

function AppHomePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getAllProjects().then((items) => {
      setProjects(items);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteMediaFile(id);
    await deleteMediaFile(`source_${id}`);
    await deleteMediaFile(`reaction_${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success("Project deleted");
  };

  return (
    <div className="space-y-10 pb-12">
      {/* ── CREATE SECTION (Matches videocaptions.ai exact card) ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">Create</h2>

        <div className="max-w-2xl rounded-3xl border border-[#232328] bg-[#161619] p-8 transition-all hover:border-[#2f2f36]">
          <div className="space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f1f24] text-xl text-white">
              <svg className="h-5 w-5 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <circle cx="12" cy="7.5" r="1.5" />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Create Reaction Video
              </h3>
              <p className="mt-1 text-xs text-[#8e8e93]">
                Split-screen, Picture-in-Picture & auto-captioned commentary
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/app/clips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#2563EB]/25 hover:bg-[#1D4ED8] transition-all"
              >
                <span>+ New project</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRESETS BETA SECTION (Matches videocaptions.ai) ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Presets</h2>
          <span className="rounded-md bg-[#232328] px-2 py-0.5 text-[10px] font-semibold text-[#8e8e93]">
            Beta
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Preset 1: TikTok Split */}
          <Link
            to="/app/clips/new"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#232328] bg-[#161619] transition-all hover:border-[#2563EB]/60 hover:bg-[#1c1c20]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[#1a1a24] to-[#0d0d12] p-4 flex flex-col justify-between">
              {/* Mockup visual of split screen */}
              <div className="mx-auto w-24 h-full rounded-lg border border-[#2f2f38] bg-black/50 p-1 flex flex-col gap-1 shadow-md">
                <div className="flex-1 rounded bg-[#2563EB]/30 flex items-center justify-center text-[8px] text-white font-mono">
                  VIDEO
                </div>
                <div className="flex-1 rounded bg-[#F43F5E]/30 flex items-center justify-center text-[8px] text-white font-mono">
                  YOU 🎙️
                </div>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="text-xs font-bold text-white group-hover:text-[#60A5FA]">
                TikTok Split (50/50)
              </h4>
              <p className="text-[11px] text-[#8e8e93] leading-relaxed">
                Viral video on top, your webcam reaction on bottom with synced audio.
              </p>
            </div>
          </Link>

          {/* Preset 2: Floating Bubble (PiP) */}
          <Link
            to="/app/clips/new"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#232328] bg-[#161619] transition-all hover:border-[#2563EB]/60 hover:bg-[#1c1c20]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[#1a1a24] to-[#0d0d12] p-4 flex flex-col justify-between">
              {/* Mockup visual of PiP */}
              <div className="relative mx-auto w-24 h-full rounded-lg border border-[#2f2f38] bg-black/50 p-1 shadow-md flex items-center justify-center">
                <span className="text-[8px] text-[#71717a]">FULL VIDEO</span>
                <div className="absolute bottom-2 right-2 h-7 w-7 rounded-full border-2 border-white/60 bg-[#F43F5E] flex items-center justify-center text-[8px] text-white shadow-lg">
                  🎙️
                </div>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="text-xs font-bold text-white group-hover:text-[#60A5FA]">
                Floating Bubble (PiP)
              </h4>
              <p className="text-[11px] text-[#8e8e93] leading-relaxed">
                Full-screen viral video with circular reaction bubble in the corner.
              </p>
            </div>
          </Link>

          {/* Preset 3: Side-by-Side Duel */}
          <Link
            to="/app/clips/new"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#232328] bg-[#161619] transition-all hover:border-[#2563EB]/60 hover:bg-[#1c1c20]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[#1a1a24] to-[#0d0d12] p-4 flex flex-col justify-between">
              {/* Mockup visual of Side-by-Side */}
              <div className="mx-auto w-24 h-full rounded-lg border border-[#2f2f38] bg-black/50 p-1 flex gap-1 shadow-md">
                <div className="flex-1 rounded bg-[#2563EB]/30 flex items-center justify-center text-[8px] text-white font-mono">
                  LEFT
                </div>
                <div className="flex-1 rounded bg-[#10B981]/30 flex items-center justify-center text-[8px] text-white font-mono">
                  RIGHT
                </div>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="text-xs font-bold text-white group-hover:text-[#60A5FA]">
                Side-by-Side Duel
              </h4>
              <p className="text-[11px] text-[#8e8e93] leading-relaxed">
                50/50 vertical side-by-side commentary for debates and gaming.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── RECENT PROJECTS SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Projects</h2>
          {projects.length > 0 && (
            <Link to="/app/projects" className="text-xs text-[#8e8e93] hover:text-white">
              View All ({projects.length}) →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 animate-pulse rounded-2xl border border-[#232328] bg-[#161619]" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#232328] bg-[#141417]/40 p-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1c1c20] text-lg text-[#8e8e93]">
              🎬
            </div>
            <h3 className="text-xs font-bold text-white">No projects yet</h3>
            <p className="mt-1 max-w-sm text-[11px] text-[#8e8e93]">
              Create your first reaction video with split-screen and live camera commentary.
            </p>
            <div className="mt-4">
              <Link
                to="/app/clips/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#1D4ED8]"
              >
                <span>Create Reaction Video</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => void navigate({ to: "/app/clips/$runId", params: { runId: p.id } })}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#232328] bg-[#161619] cursor-pointer transition-all hover:border-[#2563EB]/60 hover:bg-[#1c1c20]"
              >
                <div className="relative aspect-video w-full bg-black/60 flex items-center justify-center">
                  <span className="text-xl text-[#71717a]">🎬</span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {Math.round(p.duration || 30)}s
                  </span>
                  <span className="absolute top-2 left-2 rounded-md bg-[#2563EB]/80 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                    {p.layout === "pip-bottom-right" ? "PiP Bubble" : "Split Screen"}
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-bold text-white group-hover:text-[#60A5FA]">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-[#71717a]">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(p.id, e)}
                    className="text-xs text-[#71717a] hover:text-red-400 p-1"
                    title="Delete project"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
