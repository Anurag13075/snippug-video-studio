import { cn } from "@/lib/utils";

export function Keycap({
  children,
  className,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn("keycap cursor-default", active && "keycap-active", className)}
    >
      {children}
    </button>
  );
}

/** Non-interactive keycap for display inside copy. */
export function KeycapStatic({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-[1.9rem] items-center justify-center rounded-[0.55rem] border-[1.5px] border-b-[3.5px] border-border bg-cream px-2 text-[0.78rem] font-semibold leading-none shadow-key",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
