import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getAllProjects, type StoredProject, deleteMediaFile } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [search, setSearch] = useState("");
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

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e1e24] pb-5">
        <div>
          <h1 className="text-base font-bold text-white">All Projects</h1>
          <p className="text-xs text-[#8e8e93] mt-0.5">
            Manage your reaction split-screens, commentary videos, and studio exports.
          </p>
        </div>

        <Link
          to="/app/clips/new"
          className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#2563EB]/25 hover:bg-[#1D4ED8] transition-all"
        >
          + New Project
        </Link>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#232328] bg-[#141417] px-3.5 py-2 text-xs text-white placeholder-[#71717a] focus:border-[#2563EB] focus:outline-none"
        />
      </div>

      {/* Projects Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 animate-pulse rounded-2xl border border-[#232328] bg-[#161619]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#232328] bg-[#141417]/40 p-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c1c20] text-xl text-[#8e8e93]">
            📁
          </div>
          <h3 className="text-sm font-bold text-white">No projects found</h3>
          <p className="mt-1 text-xs text-[#8e8e93]">
            {search ? "No project matches your search." : "Start by creating your first reaction video."}
          </p>
          <div className="mt-4">
            <Link
              to="/app/clips/new"
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
            >
              Create Reaction Video
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => void navigate({ to: "/app/clips/$runId", params: { runId: p.id } })}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#232328] bg-[#161619] cursor-pointer transition-all hover:border-[#2563EB]/60 hover:bg-[#1c1c20]"
            >
              <div className="relative aspect-video w-full bg-black/60 flex items-center justify-center">
                <span className="text-2xl text-[#71717a]">🎬</span>
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
  );
}
