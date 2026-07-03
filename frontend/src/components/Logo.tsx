import { Zap } from "lucide-react";

export function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary shadow-[0_0_18px_-4px_var(--color-primary)]">
        <Zap className="h-5 w-5 fill-primary" />
      </span>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Research<span className="text-primary">AI</span>
        </span>
      )}
    </div>
  );
}