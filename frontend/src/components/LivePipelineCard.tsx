import { Brain, Check, Code2, Database, Globe, Layers, Loader2, Scale, Sparkles } from "lucide-react";
import { useAgentStatuses, type AgentStatus } from "../lib/agent-status";

type NodeDef = { key: string; label: string; icon: React.ElementType; color: string };

const ROW1: NodeDef[] = [
  { key: "planner", label: "Planner",    icon: Brain,    color: "oklch(0.585 0.233 293)" },
];
const ROW2: NodeDef[] = [
  { key: "rag",  label: "RAG",  icon: Database, color: "oklch(0.6 0.16 230)" },
  { key: "web",  label: "Web",  icon: Globe,    color: "oklch(0.7 0.16 162)" },
  { key: "code", label: "Code", icon: Code2,    color: "oklch(0.75 0.17 70)"  },
];
const ROW3: NodeDef[] = [
  { key: "synth", label: "Synthesizer", icon: Sparkles, color: "oklch(0.585 0.233 293)" },
];
const ROW4: NodeDef[] = [
  { key: "eval", label: "Evaluator", icon: Scale, color: "oklch(0.8 0.16 85)" },
];

function PipeNode({ def }: { def: NodeDef }) {
  const { statuses } = useAgentStatuses();
  const status: AgentStatus = statuses[def.key] ?? "idle";
  const Icon = def.icon;

  const ring =
    status === "running"
      ? "ring-2 ring-primary shadow-[0_0_12px_2px_var(--color-primary)]"
      : status === "done"
      ? "ring-2 ring-emerald-500/70"
      : "ring-1 ring-border";

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border bg-card px-3 py-2 transition-all duration-300 ${ring}`}
      style={{ borderColor: status === "idle" ? undefined : def.color + "66" }}
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: `color-mix(in oklab, ${def.color} 20%, transparent)` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: def.color }} />
      </span>
      <span className="text-xs font-medium text-foreground whitespace-nowrap">{def.label}</span>
      <span className="ml-auto pl-2">
        {status === "running" && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
        {status === "done"    && <Check   className="h-3 w-3 text-emerald-500" />}
        {status === "idle"    && <span    className="h-3 w-3 block rounded-full bg-secondary" />}
      </span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-1">
      <div className="h-4 w-px bg-border" />
    </div>
  );
}

function BranchArrows({ count }: { count: number }) {
  return (
    <div className="relative flex justify-center py-1" style={{ height: 20 }}>
      <svg width="240" height="20" viewBox="0 0 240 20" className="overflow-visible">
        {count === 3 && (
          <>
            <line x1="120" y1="0" x2="40"  y2="20" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="120" y1="0" x2="120" y2="20" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="120" y1="0" x2="200" y2="20" stroke="var(--color-border)" strokeWidth="1.5" />
          </>
        )}
      </svg>
    </div>
  );
}

function MergeArrows() {
  return (
    <div className="relative flex justify-center py-1" style={{ height: 20 }}>
      <svg width="240" height="20" viewBox="0 0 240 20" className="overflow-visible">
        <line x1="40"  y1="0" x2="120" y2="20" stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1="120" y1="0" x2="120" y2="20" stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1="200" y1="0" x2="120" y2="20" stroke="var(--color-border)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function LivePipelineCard() {
  const { statuses } = useAgentStatuses();
  const doneCount  = Object.values(statuses).filter((s) => s === "done").length;
  const totalNodes = ROW1.length + ROW2.length + ROW3.length + ROW4.length;
  const progress   = Math.round((doneCount / totalNodes) * 100);

  return (
    <div className="flex justify-start animate-fade-up">
      <div className="w-full max-w-sm rounded-2xl rounded-bl-md border border-border bg-card/80 p-4 backdrop-blur-sm shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent Pipeline
            </span>
          </div>
          <span className="text-xs font-medium text-primary">{progress}%</span>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 shadow-[0_0_6px_var(--color-primary)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flow */}
        <div className="flex flex-col items-center gap-0">
          {/* Row 1 — Planner */}
          <div className="w-48">
            {ROW1.map((d) => <PipeNode key={d.key} def={d} />)}
          </div>

          <BranchArrows count={3} />

          {/* Row 2 — RAG / Web / Code */}
          <div className="flex gap-2">
            {ROW2.map((d) => <PipeNode key={d.key} def={d} />)}
          </div>

          <MergeArrows />

          {/* Row 3 — Synthesizer */}
          <div className="w-48">
            {ROW3.map((d) => <PipeNode key={d.key} def={d} />)}
          </div>

          <Arrow />

          {/* Row 4 — Evaluator */}
          <div className="w-48">
            {ROW4.map((d) => <PipeNode key={d.key} def={d} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
