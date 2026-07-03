import { Brain, Check, Code2, Database, Globe, Layers, Loader2, Scale, Coins, Cpu } from "lucide-react";
import { AGENT_DEFS } from "../lib/demo-data";
import { useAgentStatuses } from "../lib/agent-status";

const ICONS: Record<string, typeof Brain> = {
  planner: Brain,
  rag: Database,
  web: Globe,
  code: Code2,
  synth: Layers,
  eval: Scale,
};

interface Props {
  cost: string;
  tokens: string;
}

export function AgentSteps({ cost, tokens }: Props) {
  const { statuses } = useAgentStatuses();
  const doneCount = AGENT_DEFS.filter((a) => statuses[a.key] === "done").length;
  const progress = (doneCount / AGENT_DEFS.length) * 100;

  return (
    <div className="flex h-full flex-col">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Agent Pipeline</h2>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)] transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {AGENT_DEFS.map((agent, i) => {
          const status = statuses[agent.key] ?? "idle";
          const Icon = ICONS[agent.key];
          return (
            <div
              key={agent.key}
              className="animate-step-in flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 transition-all duration-200 ease-in-out"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `color-mix(in oklab, ${agent.color} 18%, transparent)` }}
              >
                {status === "running" && (
                  <span className="absolute inset-0 animate-ring-spin rounded-lg border-2 border-transparent border-t-primary border-r-primary" />
                )}
                <Icon className="h-4 w-4" style={{ color: agent.color }} />
              </div>

              <span className="flex-1 text-sm font-medium text-foreground">{agent.name}</span>

              {status === "idle" && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">idle</span>
              )}
              {status === "running" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Running…
                </span>
              )}
              {status === "done" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">
                  <Check className="h-3 w-3" /> {agent.time}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <div className="rounded-xl border border-border bg-card/60 p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Coins className="h-3 w-3 text-primary" /> Cost
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">{cost}</div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Cpu className="h-3 w-3 text-primary" /> Tokens
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">{tokens}</div>
        </div>
      </div>
    </div>
  );
}
