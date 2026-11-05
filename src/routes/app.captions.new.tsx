import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { saveMediaFile } from "@/lib/storage";

export const Route = createFileRoute("/app/captions/new")({
  component: GenerateCaptionsWizard,
});

function GenerateCaptionsWizard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const mediaId = `caption-${Date.now()}`;
    await saveMediaFile(mediaId, f);
    toast.success("Loaded video! Opening Studio with word captions...");
    void navigate({ to: "/app/studio/$projectId", params: { projectId: mediaId } });
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-[#262330] bg-[#131118] p-8 text-center space-y-5 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C3AED]/20 text-2xl text-[#8B5CF6]">
          T
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">Generate Captions</h1>
          <p className="mt-1 text-xs text-[#A19EAA]">
            Upload an audio or video file. Word timestamps and animated presets will be generated automatically.
          </p>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#262330] bg-[#1A1722]/50 p-8 hover:border-[#7C3AED]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*"
            onChange={handleUpload}
            className="hidden"
          />
          <span className="text-3xl mb-2">☁</span>
          <p className="text-xs font-semibold text-white">Drop or browse video or audio</p>
          <p className="text-[10px] text-[#A19EAA] mt-0.5">MP4, MOV, WEBM, MP3, WAV · Max 500MB</p>
        </div>

        <div className="pt-2">
          <Link to="/app" className="text-xs text-[#A19EAA] hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
