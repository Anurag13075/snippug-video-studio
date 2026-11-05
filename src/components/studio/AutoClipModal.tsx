import { useState } from "react";
import { toast } from "sonner";
import { type ClipCandidate } from "@/lib/transcription-client";
import { cn } from "@/lib/utils";

interface AutoClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: ClipCandidate[];
  onApplyClips: (selectedClips: ClipCandidate[]) => void;
  onSeekTo: (start: number) => void;
  duration: number;
}

export function AutoClipModal({
  isOpen,
  onClose,
  clips: initialClips,
  onApplyClips,
  onSeekTo,
  duration,
}: AutoClipModalProps) {
  const [clips, setClips] = useState<ClipCandidate[]>(initialClips);
  const [evalMarks, setEvalMarks] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)),
    );
  };

  const updateTitle = (id: string, newTitle: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  };

  const handlePostEval = (id: string, wouldPost: boolean) => {
    setEvalMarks((prev) => ({ ...prev, [id]: wouldPost }));
  };

  const selectedCount = clips.filter((c) => c.selected).length;
  const evalCount = Object.keys(evalMarks).length;
  const wouldPostCount = Object.values(evalMarks).filter(Boolean).length;
  const postReadyRate = evalCount > 0 ? Math.round((wouldPostCount / evalCount) * 100) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-3xl border border-[#262330] bg-[#131118] text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262330] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED]/20 text-[#8B5CF6]">
              ✨
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Auto-Clip Review</h2>
              <p className="text-xs text-[#A19EAA]">
                AI-ranked moments from your source video transcript
              </p>
            </div>
          </div>

          {/* Internal Evaluation Pill */}
          {postReadyRate !== null && (
            <div className="flex items-center gap-2 rounded-xl border border-[#262330] bg-[#1A1722] px-3 py-1.5 text-xs">
              <span className="text-[#A19EAA]">Post-Ready Rate:</span>
              <span className="font-bold text-[#4ADE80]">{postReadyRate}%</span>
              <span className="text-[10px] text-[#6B6778]">({wouldPostCount}/{evalCount})</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Clips List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {clips.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <span className="text-3xl mb-2">🎬</span>
              <h3 className="text-sm font-bold text-white">No clip candidates found</h3>
              <p className="text-xs text-[#A19EAA] mt-1 max-w-xs">
                Upload a video with dialogue or narration to automatically generate viral clips.
              </p>
            </div>
          ) : (
            clips.map((clip, index) => (
              <div
                key={clip.id}
                className={cn(
                  "relative rounded-2xl border p-4.5 transition-all",
                  clip.selected
                    ? "border-[#7C3AED] bg-[#1A1722]/80 shadow-lg shadow-[#7C3AED]/10"
                    : "border-[#262330] bg-[#131118]/60 opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={clip.selected ?? false}
                      onChange={() => toggleSelect(clip.id)}
                      className="mt-1 h-4 w-4 rounded accent-[#7C3AED] cursor-pointer"
                    />

                    {/* Clip Info */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#262330] px-2 py-0.5 font-mono text-[11px] font-medium text-[#A19EAA]">
                          Clip #{index + 1}
                        </span>
                        <span className="rounded-md bg-[#7C3AED]/20 px-2 py-0.5 text-[11px] font-semibold text-[#8B5CF6]">
                          {clip.topic}
                        </span>
                        <span className="font-mono text-xs text-[#A19EAA]">
                          {clip.start}s – {clip.end}s ({clip.duration}s)
                        </span>
                      </div>

                      {/* Editable Title */}
                      <input
                        type="text"
                        value={clip.title}
                        onChange={(e) => updateTitle(clip.id, e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-[#7C3AED] py-0.5"
                      />

                      {/* Hook & Reason */}
                      <p className="text-xs text-white/90 italic">
                        "{clip.hook}"
                      </p>
                      <p className="text-[11px] text-[#A19EAA]">
                        {clip.reason}
                      </p>

                      {/* Subscores Bar */}
                      <div className="flex items-center gap-4 pt-1 text-[10px] text-[#A19EAA]">
                        <span>Hook: <b className="text-white">{clip.subscores.hook}%</b></span>
                        <span>Story: <b className="text-white">{clip.subscores.story}%</b></span>
                        <span>Payoff: <b className="text-white">{clip.subscores.payoff}%</b></span>
                        <span>Clarity: <b className="text-white">{clip.subscores.clarity}%</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Score & Preview Button */}
                  <div className="flex flex-col items-end gap-2.5">
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-3 py-1 font-bold text-white shadow-md">
                      <span className="text-xs">⚡</span>
                      <span>{clip.score}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSeekTo(clip.start)}
                      className="rounded-lg border border-[#262330] bg-[#1A1722] px-3 py-1 text-xs text-[#A19EAA] hover:border-[#7C3AED] hover:text-white"
                    >
                      Seek in Studio ▶
                    </button>

                    {/* Would Post Eval Buttons */}
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-[10px] text-[#6B6778] mr-1">Would post?</span>
                      <button
                        type="button"
                        onClick={() => handlePostEval(clip.id, true)}
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-semibold transition-colors",
                          evalMarks[clip.id] === true
                            ? "bg-[#4ADE80] text-black"
                            : "bg-[#262330] text-[#A19EAA] hover:text-white",
                        )}
                      >
                        👍 Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePostEval(clip.id, false)}
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-semibold transition-colors",
                          evalMarks[clip.id] === false
                            ? "bg-red-500 text-white"
                            : "bg-[#262330] text-[#A19EAA] hover:text-white",
                        )}
                      >
                        👎 No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#262330] px-6 py-4 bg-[#0B0A0F]">
          <div className="text-xs text-[#A19EAA]">
            Selected <b className="text-white">{selectedCount}</b> of {clips.length} clips
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#262330] px-4 py-2 text-xs font-semibold text-[#A19EAA] hover:bg-[#1A1722] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => {
                onApplyClips(clips.filter((c) => c.selected));
                toast.success(`Created ${selectedCount} clips in your Studio queue!`);
                onClose();
              }}
              className="rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-[#7C3AED]/30 hover:bg-[#8B5CF6] disabled:opacity-50"
            >
              Create {selectedCount} Clips →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
