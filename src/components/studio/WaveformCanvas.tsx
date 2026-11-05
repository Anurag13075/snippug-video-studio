import { useEffect, useRef } from "react";

interface WaveformCanvasProps {
  duration: number;
  time: number;
  inPt: number;
  outPt: number;
  zoom: number;
  className?: string;
}

export function WaveformCanvas({
  duration,
  time,
  inPt,
  outPt,
  zoom,
  className,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (duration <= 0) {
      // Empty placeholder wave
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      const barCount = Math.floor(width / 4);
      for (let i = 0; i < barCount; i++) {
        const h = 4 + Math.sin(i * 0.2) * 2;
        ctx.fillRect(i * 4, (height - h) / 2, 2, h);
      }
      return;
    }

    const totalBars = Math.floor((width * zoom) / 3);
    const inPct = inPt / duration;
    const outPct = outPt / duration;
    const timePct = time / duration;

    // Pseudo-random deterministic audio peaks generator
    for (let i = 0; i < totalBars; i++) {
      const pct = i / totalBars;
      const x = i * 3;

      // Compound sine wave pattern resembling voice speech spikes
      const v1 = Math.sin(pct * 40 * Math.PI) * 0.3;
      const v2 = Math.cos(pct * 120 * Math.PI) * 0.25;
      const v3 = Math.sin(pct * 300 * Math.PI) * 0.2;
      const v4 = Math.abs(Math.sin(pct * 15 * Math.PI));
      const amp = Math.min(1, Math.max(0.1, (Math.abs(v1 + v2 + v3) * 1.4) * (0.3 + 0.7 * v4)));

      const barH = Math.max(3, amp * (height * 0.82));
      const y = (height - barH) / 2;

      // Color scheme based on selection & playhead
      if (pct >= inPct && pct <= outPct) {
        if (pct <= timePct) {
          ctx.fillStyle = "#FFFC00"; // Played in selection: yellow
        } else {
          ctx.fillStyle = "#E6C395"; // In selection: tan/warm
        }
      } else {
        if (pct <= timePct) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        }
      }

      ctx.fillRect(x, y, 2, barH);
    }
  }, [duration, time, inPt, outPt, zoom]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={48}
      className={className ?? "h-full w-full"}
    />
  );
}
