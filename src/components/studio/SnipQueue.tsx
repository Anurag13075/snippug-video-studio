import { type SnipItem, fmt } from "./useStudioState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeycapStatic } from "@/components/snippug/Keycap";

interface SnipQueueProps {
  queue: SnipItem[];
  onRemove: (id: string) => void;
  onExportSingle: (snip: SnipItem) => void;
  onExportAll: () => void;
  onAddCurrent: () => void;
  exporting: boolean;
}

export function SnipQueue({
  queue,
  onRemove,
  onExportSingle,
  onExportAll,
  onAddCurrent,
  exporting,
}: SnipQueueProps) {
  return (
    <div className="flex items-center gap-3 border-t border-[#3a3228] bg-[#1a1612] px-4 py-2.5">
      {/* Label and Add button */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#A89F91]">
          Snip Queue ({queue.length})
        </span>
        <button
          type="button"
          onClick={onAddCurrent}
          disabled={exporting}
          className="flex h-7 items-center gap-1.5 rounded-lg border border-[#3a3228] bg-[#231E18] px-2.5 text-xs font-semibold text-[#F5E6CB] transition-all hover:border-[#E6C395] hover:bg-[#2C241B] disabled:opacity-50"
        >
          <span>+ Add In/Out</span>
          <KeycapStatic className="h-4 min-w-0 px-1 text-[9px]">S</KeycapStatic>
        </button>
      </div>

      {/* Horizontal queue strip */}
      <div className="flex flex-1 items-center gap-2.5 overflow-x-auto py-1 scrollbar-thin">
        {queue.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-[#7A7163]">
            <span>No clips queued yet. Select range and tap</span>
            <KeycapStatic className="h-4 min-w-0 px-1 text-[9px]">S</KeycapStatic>
            <span>to queue multiple clips for batch export.</span>
          </div>
        ) : (
          queue.map((snip, index) => {
            const dur = Math.max(0, snip.outPoint - snip.inPoint);
            return (
              <div
                key={snip.id}
                className="group relative flex shrink-0 items-center gap-2.5 rounded-xl border border-[#3a3228] bg-[#231E18] p-1.5 pr-2.5 transition-all hover:border-[#E6C395]"
              >
                {/* Thumbnail */}
                <div className="relative h-11 w-16 overflow-hidden rounded-lg bg-black">
                  <img
                    src={snip.thumbnail}
                    alt={`Snip ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[9px] font-mono text-[#E6C395]">
                    {fmt(dur)}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#F5E6CB]">
                      Clip #{index + 1}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-[#5E5649] px-1 py-0 text-[8px] text-[#A89F91]"
                    >
                      {snip.aspectRatio}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-[#A89F91]">
                    {fmt(snip.inPoint)} → {fmt(snip.outPoint)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pl-1">
                  <button
                    type="button"
                    title="Export this clip"
                    disabled={exporting}
                    onClick={() => onExportSingle(snip)}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-[#3a3228] bg-[#1a1612] text-xs text-[#E6C395] hover:border-[#E6C395]"
                  >
                    ⬇
                  </button>
                  <button
                    type="button"
                    title="Remove clip"
                    disabled={exporting}
                    onClick={() => onRemove(snip.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-[#3a3228] bg-[#1a1612] text-xs text-[#A89F91] hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Export All button */}
      {queue.length > 0 && (
        <Button
          size="sm"
          disabled={exporting}
          onClick={onExportAll}
          className="shrink-0 rounded-xl bg-gradient-to-r from-[#E6C395] to-[#D9B183] text-xs font-bold text-[#1a1612] shadow-key hover:brightness-105"
        >
          <span>Export All ({queue.length})</span>
          <KeycapStatic className="ml-1.5 h-4 min-w-0 bg-white/50 px-1 text-[9px] text-[#1a1612]">
            ⌘⇧E
          </KeycapStatic>
        </Button>
      )}
    </div>
  );
}
