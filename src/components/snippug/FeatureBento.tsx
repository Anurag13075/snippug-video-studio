import { KeycapStatic } from "./Keycap";
import { useSound } from "./sound";
import { cn } from "@/lib/utils";

function Tile({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "tactile group relative overflow-hidden rounded-3xl p-6 text-left",
        onClick && "pressable cursor-pointer",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function FeatureBento() {
  const { play } = useSound();

  return (
    <section id="features" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Features
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Small tool. <span className="serif-accent text-cocoa">Thoughtful details.</span>
        </h2>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile className="lg:col-span-2" onClick={() => play("snip")}>
            <div className="flex flex-wrap gap-2">
              <KeycapStatic>I</KeycapStatic>
              <KeycapStatic>O</KeycapStatic>
              <KeycapStatic>Space</KeycapStatic>
              <KeycapStatic>J</KeycapStatic>
              <KeycapStatic>L</KeycapStatic>
              <KeycapStatic>⌘ + S</KeycapStatic>
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight">Cut at keyboard speed</h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              Every edit is one key away. Mark in, mark out, roll a second back and forth, export —
              without the mouse ever waking up.
            </p>
          </Tile>

          <Tile className="bg-secondary">
            <div className="text-3xl">🔒</div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">100% on-device</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Zero video uploads. Your footage is opened, cut and saved by your own browser.
            </p>
          </Tile>

          <Tile className="bg-secondary">
            <div className="text-3xl">⚡</div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">No AI, no queue</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              No render servers, no credits, no waiting room. You press export, it exports.
            </p>
          </Tile>

          <Tile>
            <div className="text-3xl">📱</div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">Creator presets</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              9:16 with a blurred backdrop and phone frame, 1:1 feed posts, 16:9 widescreen — one
              click each.
            </p>
          </Tile>

          <Tile>
            <div className="text-3xl">🎧</div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">Sound stays too</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              The clip's audio is captured straight off the video element. What you hear is what
              you get.
            </p>
          </Tile>

          <Tile className="bg-tan/40" onClick={() => play("boop")}>
            <div className="text-3xl">🦴</div>
            <h3 className="mt-3 text-lg font-bold tracking-tight">Free, honestly</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              The whole clipper is free. Pro just removes the little tag and adds bigger exports.
            </p>
          </Tile>
        </div>
      </div>
    </section>
  );
}
