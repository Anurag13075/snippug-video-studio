import { useEffect } from "react";
import type { StudioState } from "./useStudioState";

interface UseKeyboardShortcutsProps {
  state: StudioState;
  onExport: () => void;
  onExportAll: () => void;
}

export function useKeyboardShortcuts({
  state,
  onExport,
  onExportAll,
}: UseKeyboardShortcutsProps) {
  const {
    togglePlay,
    markIn,
    markOut,
    nudge,
    addSnip,
    zoomIn,
    zoomOut,
    exporting,
  } = state;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (exporting) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      const k = e.key.toLowerCase();

      // Cmd/Ctrl + Shift + E -> Export All
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && k === "e") {
        e.preventDefault();
        onExportAll();
        return;
      }

      // Cmd/Ctrl + E -> Export current
      if ((e.metaKey || e.ctrlKey) && k === "e") {
        e.preventDefault();
        onExport();
        return;
      }

      // Cmd/Ctrl + S -> Save/Export current
      if ((e.metaKey || e.ctrlKey) && k === "s") {
        e.preventDefault();
        onExport();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (k === " ") {
        e.preventDefault();
        togglePlay();
      } else if (k === "i") {
        e.preventDefault();
        markIn();
      } else if (k === "o") {
        e.preventDefault();
        markOut();
      } else if (k === "s") {
        e.preventDefault();
        addSnip();
      } else if (k === "j") {
        e.preventDefault();
        nudge(-1);
      } else if (k === "l") {
        e.preventDefault();
        nudge(1);
      } else if (k === "[") {
        e.preventDefault();
        zoomIn();
      } else if (k === "]") {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    exporting,
    togglePlay,
    markIn,
    markOut,
    nudge,
    addSnip,
    zoomIn,
    zoomOut,
    onExport,
    onExportAll,
  ]);
}
