import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-all duration-200 ease-in-out hover-glow"
    >
      {theme === "dark" ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
      {withLabel && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}