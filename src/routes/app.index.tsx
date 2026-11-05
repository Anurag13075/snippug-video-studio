import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllProjects, type StoredProject } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  component: AppHomePage,
});

function AppHomePage() {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getAllProjects().then((items) => {
      setProjects(items);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          What do you want to create?
        </h1>
        <p className="mt-1 text-xs text-[#A19EAA]">
          Turn long-form videos into viral clips, burn animated captions, or edit in the studio.
        </p>
      </div>

      {/* Create Row: 2 Focused Wizard Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Generate clips (Primary, Highlighted) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[#7C3AED]/70 bg-gradient-to-b from-[#1A1722] to-[#131118] p-7 shadow-xl shadow-[#7C3AED]/10 transition-all hover:border-[#7C3AED] hover:shadow-2xl">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED] text-2xl text-white shadow-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Generate Viral Clips</h2>
                <span className="rounded-full bg-[#7C3AED]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#8B5CF6]">
                  POPULAR
                </span>
              </div>
              <p className="mt-2 text-xs text-[#A19EAA] leading-relaxed">
                Upload one long video and let AI pick 3–15 viral vertical moments with kinetic captions and hooks ready for TikTok & Reels.
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Link
              to="/app/clips/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-3 text-xs font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition-all hover:bg-[#8B5CF6] active:scale-[0.98]"
            >
              <span>Create Viral Clips</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 2. Generate captions */}
        <div className="group flex flex-col justify-between rounded-3xl border border-[#262330] bg-[#131118] p-7 transition-all hover:border-[#7C3AED]/50 hover:bg-[#1A1722]/50 hover:shadow-xl">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#38BDF8]/20 text-2xl text-[#38BDF8]">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Auto Captions Wizard</h2>
                <span className="rounded-full bg-[#38BDF8]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#38BDF8]">
                  KINETIC
                </span>
              </div>
              <p className="mt-2 text-xs text-[#A19EAA] leading-relaxed">
                Burn accurate word-level animated subtitles with 8 viral styles, automatic speech detection, and direct video export.
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Link
              to="/app/captions/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#262330] bg-[#1A1722] py-3 text-xs font-bold text-white hover:border-[#7C3AED] transition-colors"
            >
              <span>Caption Any Video</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Recent Projects</h2>
          {projects.length > 0 && (
            <Link to="/app/projects" className="text-xs text-[#A19EAA] hover:text-white">
              View All ({projects.length}) →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 animate-pulse rounded-2xl border border-[#262330] bg-[#131118]" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Designed Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#262330] bg-[#131118]/40 p-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A1722] text-xl text-[#A19EAA]">
              🎬
            </div>
            <h3 className="text-sm font-bold text-white">No projects yet</h3>
            <p className="mt-1 max-w-sm text-xs text-[#A19EAA]">
              Your video projects and AI clip runs will show up here. All video files stay 100% in your browser.
            </p>
            <div className="mt-5">
              <Link
                to="/app/clips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#8B5CF6]"
              >
                <span>Generate Your First Clips</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/app/clips/$runId"
                params={{ runId: p.id }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#262330] bg-[#131118] transition-all hover:border-[#7C3AED]/60 hover:bg-[#1A1722]"
              >
                <div className="relative aspect-video w-full bg-black/60">
                  <div className="flex h-full w-full items-center justify-center text-2xl text-[#6B6778]">
                    ▶
                  </div>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {Math.round(p.duration)}s
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <h4 className="truncate text-xs font-bold text-white group-hover:text-[#8B5CF6]">
                    {p.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-[#A19EAA]">
                    <span>{p.aspect}</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
