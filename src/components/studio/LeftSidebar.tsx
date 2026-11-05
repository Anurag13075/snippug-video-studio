import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type MediaItem } from "./useStudioState";
import { getStorageEstimate } from "@/lib/storage";
import { TranscriptEditor } from "./TranscriptEditor";
import { type TranscriptWord } from "@/lib/transcription-client";

interface LeftSidebarProps {
  activeTab: "media" | "text" | "elements" | "audio" | "uploads";
  onTabChange: (tab: "media" | "text" | "elements" | "audio" | "uploads") => void;
  mediaItems: MediaItem[];
  selectedMediaId: string;
  onSelectMedia: (item: MediaItem) => void;
  onFileUpload: (file: File) => void;
  words?: TranscriptWord[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  onDeleteWords?: (indices: number[]) => void;
  silenceRanges?: Array<{ start: number; end: number; duration: number }>;
  onCutSilence?: () => void;
}

export function LeftSidebar({
  activeTab,
  onTabChange,
  mediaItems,
  selectedMediaId,
  onSelectMedia,
  onFileUpload,
  words = [],
  currentTime = 0,
  onSeek = () => {},
  onDeleteWords = () => {},
  silenceRanges = [],
  onCutSilence = () => {},
}: LeftSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storageInfo, setStorageInfo] = useState<{ usageMb: number; quotaMb: number; percentUsed: number }>({
    usageMb: 0,
    quotaMb: 5000,
    percentUsed: 0,
  });

  useEffect(() => {
    void getStorageEstimate().then(setStorageInfo);
  }, [mediaItems]);

  const tabs: Array<{
    id: "media" | "text" | "elements" | "audio" | "uploads";
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "media",
      label: "Media",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      ),
    },
    {
      id: "text",
      label: "Transcript",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      ),
    },
    {
      id: "uploads",
      label: "Storage",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-full w-[295px] shrink-0 flex-col border-r border-[#262330] bg-[#131118]">
      {/* Top Tabs */}
      <div className="flex items-center justify-around border-b border-[#262330] px-2 pt-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 pb-2 text-[11px] font-medium transition-colors",
                active ? "text-[#7C3AED]" : "text-[#A19EAA] hover:text-white",
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {active && (
                <div className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-[#7C3AED]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "text" ? (
        <TranscriptEditor
          words={words}
          currentTime={currentTime}
          onSeek={onSeek}
          onDeleteWords={onDeleteWords}
          silenceRanges={silenceRanges}
          onCutSilence={onCutSilence}
        />
      ) : activeTab === "uploads" ? (
        <div className="p-4 space-y-4 text-xs">
          <div className="rounded-2xl border border-[#262330] bg-[#1A1722] p-4 space-y-2">
            <h3 className="font-bold text-white">Browser Local Storage</h3>
            <p className="text-[11px] text-[#A19EAA]">
              Video files stay on your computer via Origin Private File System (OPFS).
              Zero cloud video storage is used.
            </p>
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#A19EAA]">Used: {storageInfo.usageMb} MB</span>
                <span className="text-[#A19EAA]">Quota: {storageInfo.quotaMb} MB</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#262330]">
                <div
                  className="h-full rounded-full bg-[#7C3AED]"
                  style={{ width: `${Math.min(100, storageInfo.percentUsed)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Media Bin */
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onFileUpload(f);
            }}
            className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#262330] bg-[#1A1722]/50 p-5 text-center transition-all hover:border-[#7C3AED]/70 hover:bg-[#1A1722]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileUpload(f);
              }}
            />
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#131118] text-[#A19EAA] group-hover:text-[#7C3AED]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-white">
              Drop your video here
            </p>
            <p className="mt-0.5 text-[11px] text-[#A19EAA]">
              or <span className="text-[#8B5CF6] underline">click to browse</span>
            </p>
            <p className="mt-2 text-[10px] text-[#6B6778]">
              MP4, MOV, WEBM · Max 500MB (100% On-Device)
            </p>
          </div>

          {/* Your Media Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Your media</span>
              <span className="text-[10px] text-[#6B6778]">{mediaItems.length} items</span>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-2 gap-2">
              {mediaItems.map((item) => {
                const isSelected = selectedMediaId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectMedia(item)}
                    className={cn(
                      "group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-[#262330] bg-[#1A1722] transition-all hover:scale-[1.02]",
                      isSelected && "ring-2 ring-[#7C3AED] border-transparent shadow-lg shadow-[#7C3AED]/20",
                    )}
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-black/40 text-center p-2">
                        <span className="text-base mb-1">🎬</span>
                        <span className="truncate text-[10px] text-white/90 max-w-[80px]">
                          {item.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-medium text-white backdrop-blur-sm">
                      {item.durationStr}
                    </div>
                  </div>
                );
              })}

              {/* Plus Card "+ More" */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#262330] bg-[#1A1722]/60 text-center transition-all hover:border-[#7C3AED] hover:bg-[#1A1722]"
              >
                <span className="text-base font-light text-[#A19EAA]">+</span>
                <span className="text-[10px] font-medium text-[#A19EAA]">Add Video</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
