import { useEffect, useState } from "react";

const BASE = 48213;

/** Live-feeling snip counter: real local exports + a gentle ambient drift. */
export function useSnipCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let local = 0;
    try {
      local = Number(window.localStorage.getItem("snippug-count") ?? 0) || 0;
    } catch {
      /* ignore */
    }
    const minutes = Math.floor(Date.now() / 60000);
    const drift = minutes % 1440; // slow daily-cycle drift, no random at module scope
    setCount(BASE + drift + local);

    const id = window.setInterval(() => setCount((c) => (c === null ? c : c + 1)), 7000);
    const onExport = () => {
      try {
        const next = (Number(window.localStorage.getItem("snippug-count") ?? 0) || 0) + 1;
        window.localStorage.setItem("snippug-count", String(next));
      } catch {
        /* ignore */
      }
      setCount((c) => (c === null ? c : c + 1));
    };
    window.addEventListener("snippug:exported", onExport);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("snippug:exported", onExport);
    };
  }, []);

  return count;
}
