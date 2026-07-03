import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export function StatCard({ label, value, prefix = "", suffix = "", decimals = 0, icon: Icon, color, delay = 0 }: StatCardProps) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const start = () => {
      const duration = 1200;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(value * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (started.current) return;
    started.current = true;
    const id = setTimeout(start, delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return (
    <div className="card-lift rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </div>
    </div>
  );
}