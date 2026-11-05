import { useState } from "react";
import { toast } from "sonner";
import { type TranscriptWord } from "@/lib/transcription-client";
import { cn } from "@/lib/utils";

interface TranscriptEditorProps {
  words: TranscriptWord[];
  currentTime: number;
  onSeek: (time: number) => void;
  onDeleteWords: (indices: number[]) => void;
  silenceRanges: Array<{ start: number; end: number; duration: number }>;
  onCutSilence: () => void;
}

const COMMON_FILLERS = new Set(["um", "uh", "like", "you know", "hmm", "ah", "er"]);

export function TranscriptEditor({
  words,
  currentTime,
  onSeek,
  onDeleteWords,
  silenceRanges,
  onCutSilence,
}: TranscriptEditorProps) {
  const [selectedWordIndices, setSelectedWordIndices] = useState<Set<number>>(new Set());
  const [showFillerPreview, setShowFillerPreview] = useState(false);
  const [showSilencePreview, setShowSilencePreview] = useState(false);

  // Identify filler words in real transcript
  const fillerIndices = words
    .map((w, idx) => ({ word: w.word.toLowerCase().replace(/[^a-z]/g, ""), idx }))
    .filter(({ word }) => COMMON_FILLERS.has(word))
    .map(({ idx }) => idx);

  const fillerTimeSaved = fillerIndices.reduce((acc, idx) => {
    const w = words[idx];
    return acc + (w ? w.end - w.start : 0);
  }, 0);

  const totalSilenceTime = silenceRanges.reduce((acc, r) => acc + r.duration, 0);

  const toggleSelectWord = (idx: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      // Range select
      const next = new Set(selectedWordIndices);
      next.add(idx);
      setSelectedWordIndices(next);
    } else {
      onSeek(words[idx].start);
    }
  };

  const deleteSelected = () => {
    if (selectedWordIndices.size === 0) return;
    onDeleteWords(Array.from(selectedWordIndices));
    setSelectedWordIndices(new Set());
    toast.success(`Removed ${selectedWordIndices.size} words from timeline`);
  };

  const removeAllFillers = () => {
    if (fillerIndices.length === 0) {
      toast.info("No filler words found in transcript!");
      return;
    }
    onDeleteWords(fillerIndices);
    setShowFillerPreview(false);
    toast.success(`Cleaned ${fillerIndices.length} filler words! Saved ${fillerTimeSaved.toFixed(1)}s`);
  };

  return (
    <div className="flex h-full flex-col bg-[#131118] text-white">
      {/* Top Quick Actions */}
      <div className="flex items-center justify-between border-b border-[#262330] px-4 py-2.5 bg-[#0B0A0F]">
        <div className="flex items-center gap-2">
          {/* Remove Fillers Button */}
          <button
            type="button"
            onClick={() => setShowFillerPreview(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#262330] bg-[#1A1722] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:border-[#7C3AED]"
          >
            <span>✂</span>
            <span>Remove Fillers ({fillerIndices.length})</span>
          </button>

          {/* Remove Silence Button */}
          <button
            type="button"
            onClick={() => setShowSilencePreview(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#262330] bg-[#1A1722] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:border-[#7C3AED]"
          >
            <span>🔇</span>
            <span>Cut Silence ({silenceRanges.length})</span>
          </button>
        </div>

        {selectedWordIndices.size > 0 && (
          <button
            type="button"
            onClick={deleteSelected}
            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            Delete {selectedWordIndices.size} selected
          </button>
        )}
      </div>

      {/* Words Flow View */}
      <div className="flex-1 overflow-y-auto p-4 leading-loose">
        {words.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-xs text-[#A19EAA]">
            <span>Click "Auto Captions" or "Transcribe" to generate a word-level transcript</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {words.map((w, idx) => {
              const isActive = currentTime >= w.start && currentTime <= w.end;
              const isSelected = selectedWordIndices.has(idx);
              const isFiller = COMMON_FILLERS.has(w.word.toLowerCase().replace(/[^a-z]/g, ""));

              return (
                <button
                  key={`${w.word}_${idx}`}
                  type="button"
                  onClick={(e) => toggleSelectWord(idx, e)}
                  className={cn(
                    "cursor-pointer rounded-md px-1.5 py-0.5 text-xs transition-colors",
                    isActive && "bg-[#7C3AED] text-white font-bold shadow-md scale-105",
                    isSelected && "ring-2 ring-red-500 bg-red-950/60",
                    isFiller && !isActive && !isSelected && "text-[#FACC15] underline decoration-dotted",
                    !isActive && !isSelected && !isFiller && "text-[#A19EAA] hover:bg-[#1A1722] hover:text-white",
                  )}
                  title={`${w.word} (${w.start}s – ${w.end}s)`}
                >
                  {w.word}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filler Modal Preview */}
      {showFillerPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#262330] bg-[#131118] p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Remove Filler Words</h3>
            <p className="mt-1 text-xs text-[#A19EAA]">
              Detected <b className="text-white">{fillerIndices.length}</b> filler words in this recording.
              Cutting them will save approximately <b className="text-[#4ADE80]">{fillerTimeSaved.toFixed(1)} seconds</b>.
            </p>

            <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-[#262330] bg-[#1A1722] p-3 text-xs">
              {fillerIndices.map((idx) => (
                <div key={idx} className="flex justify-between py-0.5 text-[#A19EAA]">
                  <span className="font-semibold text-[#FACC15]">"{words[idx].word}"</span>
                  <span className="font-mono text-[10px]">{words[idx].start}s</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFillerPreview(false)}
                className="rounded-xl border border-[#262330] px-3.5 py-1.5 text-xs text-[#A19EAA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={removeAllFillers}
                className="rounded-xl bg-[#7C3AED] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8B5CF6]"
              >
                Apply Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silence Modal Preview */}
      {showSilencePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#262330] bg-[#131118] p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Cut Dead Air & Silences</h3>
            <p className="mt-1 text-xs text-[#A19EAA]">
              Calculated from real WebAudio RMS energy. Found <b className="text-white">{silenceRanges.length}</b> silence windows
              saving <b className="text-[#4ADE80]">{totalSilenceTime.toFixed(1)} seconds</b> total.
            </p>

            <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-[#262330] bg-[#1A1722] p-3 text-xs">
              {silenceRanges.map((r, i) => (
                <div key={i} className="flex justify-between py-0.5 text-[#A19EAA]">
                  <span>Silence #{i + 1} ({r.duration.toFixed(1)}s)</span>
                  <span className="font-mono text-[10px]">{r.start.toFixed(1)}s – {r.end.toFixed(1)}s</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSilencePreview(false)}
                className="rounded-xl border border-[#262330] px-3.5 py-1.5 text-xs text-[#A19EAA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onCutSilence();
                  setShowSilencePreview(false);
                  toast.success(`Removed ${silenceRanges.length} silence pauses!`);
                }}
                className="rounded-xl bg-[#7C3AED] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8B5CF6]"
              >
                Apply Cut
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
