import { SnipPugLogo } from "./SnipPugLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/60 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <SnipPugLogo size="sm" showWordmark={true} />
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#puggy" className="hover:text-foreground">Puggy</a>
          <a href="/app" className="hover:text-foreground">App</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SnipPug · Puggy retains all treats</p>
      </div>
    </footer>
  );
}
