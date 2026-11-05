import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllProjects, type StoredProject, deleteMediaFile } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
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
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success("Project deleted from local storage");
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262330] pb-5">
        <div>
          <h1 className="text-xl font-bold text-white">All Projects</h1>
          <p className="text-xs text-[#A19EAA] mt-1">
            Manage your AI clip runs, caption jobs, and studio timelines.
          </p>
        </div>

        <Link
          to="/app/clips/new"
          className="rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#8B5CF6]"
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
          className="w-full rounded-xl border border-[#262330] bg-[#131118] px-3.5 py-2 text-xs text-white placeholder-[#6B6778] focus:border-[#7C3AED] focus:outline-none"
        />
      </div>

      {/* Projects Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 animate-pulse rounded-2xl border border-[#262330] bg-[#131118]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#262330] bg-[#131118]/40 p-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A1722] text-xl text-[#A19EAA]">
            📁
          </div>
          <h3 className="text-sm font-bold text-white">No projects found</h3>
          <p className="mt-1 text-xs text-[#A19EAA]">
            {search ? "No project matches your search." : "Start by uploading a video to generate clips."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/app/clips/$runId"
              params={{ runId: p.id }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#262330] bg-[#131118] transition-all hover:border-[#7C3AED]/60 hover:bg-[#1A1722]"
            >
              <div className="relative aspect-video w-full bg-black/60 flex items-center justify-center">
                <span className="text-2xl text-[#6B6778]">🎬</span>
                <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {Math.round(p.duration)}s
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="truncate text-xs font-bold text-white group-hover:text-[#8B5CF6]">
                    {p.name}
                  </h4>
                  <span className="text-[10px] text-[#A19EAA]">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(p.id, e)}
                  className="text-xs text-[#6B6778] hover:text-red-400 p-1"
                  title="Delete project"
                >
                  🗑
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
