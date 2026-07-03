import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Chat" },
  { to: "/metrics", label: "Metrics" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="transition-all duration-200 ease-in-out hover:opacity-80">
          <Logo />
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-1.5 py-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="relative rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 ease-in-out hover:text-foreground data-[status=active]:text-primary data-[status=active]:[text-shadow:0_0_12px_var(--color-primary)]"
              activeProps={{ className: "after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-primary after:shadow-[0_0_8px_var(--color-primary)]" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-all duration-200 ease-in-out hover-glow"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </nav>
    </header>
  );
}