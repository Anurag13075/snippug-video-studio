import { Puggy } from "./Puggy";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/60 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 overflow-hidden rounded-xl border-[1.5px] border-border bg-cream shadow-key">
            <Puggy mood="sleepy" className="h-full w-full translate-y-[3px] scale-125" />
          </span>
          <div className="leading-tight">
            <div className="font-bold">SnipPug</div>
            <div className="text-xs text-muted-foreground">Made with 🦴 and zero video uploads</div>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#puggy" className="hover:text-foreground">Puggy</a>
          <a href="#studio" className="hover:text-foreground">Studio</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SnipPug · Puggy retains all treats</p>
      </div>
    </footer>
  );
}
