import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Brain, Code2, Database, DollarSign, Gavel, Globe, Layers, ListChecks, ShieldCheck, Sparkles, User, Loader2, Check } from "lucide-react";
import { useAgentStatuses, type AgentStatus } from "../lib/agent-status";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — ResearchAI Multi-Agent Pipeline" },
      { name: "description", content: "Live diagram of the ResearchAI multi-agent harness showing real-time agent status." },
    ],
  }),
  component: ArchitecturePage,
});

type Variant = "blue" | "gray" | "purple" | "gold" | "green" | "ext";

const baseStyles: Record<Variant, string> = {
  blue:   "border-sky-500/40 bg-sky-500/10 text-foreground",
  gray:   "border-border bg-card text-foreground",
  purple: "border-primary/50 bg-primary/10 text-foreground",
  gold:   "border-amber-500/40 bg-amber-500/10 text-foreground",
  green:  "border-emerald-500/40 bg-emerald-500/10 text-foreground",
  ext:    "border-border bg-secondary text-foreground",
};

const activeRing: Record<AgentStatus, string> = {
  idle:    "",
  running: "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-[0_0_16px_4px_var(--color-primary)]",
  done:    "ring-2 ring-emerald-500/60 ring-offset-1 ring-offset-background",
};

function Node({
  cx, cy, w = 170, h = 58, variant, icon, title, subtitle, badge, agentKey, children,
}: {
  cx: number; cy: number; w?: number; h?: number; variant: Variant;
  icon: ReactNode; title: string; subtitle?: string; badge?: string;
  agentKey?: string; children?: ReactNode;
}) {
  const { statuses } = useAgentStatuses();
  const status: AgentStatus = agentKey ? (statuses[agentKey] ?? "idle") : "idle";

  return (
    <div
      className={`card-lift absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border p-3 shadow-lg transition-all duration-300 ${baseStyles[variant]} ${agentKey ? activeRing[status] : ""}`}
      style={{ left: cx, top: cy, width: w, minHeight: h }}
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{title}</div>
          {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {agentKey && status === "running" && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
        )}
        {agentKey && status === "done" && (
          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        )}
      </div>
      {badge && (
        <span className="mt-1 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[0.65rem] font-medium text-amber-500">
          {badge}
        </span>
      )}
      {children}
    </div>
  );
}

function Edge({ d, dashed, delay }: { d: string; dashed?: boolean; delay: number }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--color-primary)"
      strokeOpacity={dashed ? 0.5 : 0.7}
      strokeWidth={2}
      strokeDasharray={dashed ? "6 6" : "1"}
      pathLength={1}
      style={
        dashed
          ? undefined
          : { strokeDasharray: 1, strokeDashoffset: 1, animation: `draw-line 1.2s ease-out ${delay}s forwards` }
      }
      markerEnd="url(#arrow)"
    />
  );
}

function LiveBanner() {
  const { statuses } = useAgentStatuses();
  const anyRunning = Object.values(statuses).some((s) => s === "running");
  const allDone = Object.values(statuses).length > 0 && Object.values(statuses).every((s) => s === "done");

  if (anyRunning) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin" />
        Pipeline running — agents light up in real time
      </div>
    );
  }
  if (allDone) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-500">
        <Check className="h-4 w-4" />
        Pipeline complete — go back to Chat to see the answer
      </div>
    );
  }
  return (
    <p className="mb-4 text-sm text-muted-foreground">
      Send a query from the <strong>Chat</strong> page and watch each agent light up here in real time.
    </p>
  );
}

function ArchitecturePage() {
  return (
    <div className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Architecture</h1>
        <p className="mt-1 text-muted-foreground">
          A cost-routed multi-agent harness with guardrails and LLM-as-a-judge evaluation.
        </p>

        <div className="mt-4">
          <LiveBanner />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card/40 p-4">
          <div className="relative mx-auto" style={{ width: 1060, height: 760 }}>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1060 760" preserveAspectRatio="none">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-primary)" />
                </marker>
              </defs>
              <Edge d="M380,63 L380,105" delay={0} />
              <Edge d="M380,163 L380,221" delay={0.15} />
              <Edge d="M380,279 L380,343" delay={0.3} />
              <Edge d="M380,279 L380,311 L170,311 L170,343" delay={0.3} />
              <Edge d="M380,279 L380,311 L590,311 L590,343" delay={0.3} />
              <Edge d="M170,401 L170,450 L380,450 L380,461" delay={0.6} />
              <Edge d="M380,401 L380,461" delay={0.6} />
              <Edge d="M590,401 L590,450 L380,450 L380,461" delay={0.6} />
              <Edge d="M380,519 L380,565" delay={0.9} />
              <Edge d="M380,623 L380,667" delay={1.05} />
              <Edge d="M850,134 L520,134" dashed delay={0} />
              <Edge d="M850,372 L256,372" dashed delay={0} />
              <Edge d="M850,470 L466,386" dashed delay={0} />
            </svg>

            <Node cx={380} cy={34}  variant="blue"   title="User Query"      icon={<User       className="h-5 w-5 text-sky-500" />} />
            <Node cx={380} cy={134} w={280} h={70} variant="gray" title="Agent Harness" icon={<Layers className="h-5 w-5 text-muted-foreground" />}>
              <div className="mt-2 flex gap-2 text-[0.65rem]">
                <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">token budget</span>
                <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">guardrails</span>
              </div>
            </Node>
            <Node cx={380} cy={250} variant="purple" title="Planner"       subtitle="GPT-4o"  icon={<Brain    className="h-5 w-5 text-primary" />}           agentKey="planner" />
            <Node cx={170} cy={372} variant="gray"   title="RAG Retriever" subtitle="GPT-3.5" icon={<Database className="h-5 w-5 text-sky-400" />}            agentKey="rag" />
            <Node cx={380} cy={372} variant="gray"   title="Web Searcher"  subtitle="GPT-3.5" icon={<Globe    className="h-5 w-5 text-emerald-400" />}        agentKey="web" />
            <Node cx={590} cy={372} variant="gray"   title="Code Executor" subtitle="GPT-3.5" icon={<Code2    className="h-5 w-5 text-amber-400" />}          agentKey="code" />
            <Node cx={380} cy={490} variant="purple" title="Synthesizer"   subtitle="GPT-4o"  icon={<Sparkles className="h-5 w-5 text-primary" />}            agentKey="synth" />
            <Node cx={380} cy={594} variant="gold"   title="Evaluator"     subtitle="GPT-4o"  icon={<Gavel    className="h-5 w-5 text-amber-500" />} badge="LLM-as-Judge" agentKey="eval" />
            <Node cx={380} cy={696} variant="green"  title="Final Answer"                      icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />} />

            <Node cx={920} cy={134} w={150} variant="ext" title="PostgreSQL" subtitle="trace logs"   icon={<Database className="h-5 w-5 text-sky-400" />} />
            <Node cx={920} cy={372} w={150} variant="ext" title="Pinecone"   subtitle="vector store" icon={<Database className="h-5 w-5 text-primary" />} />
            <Node cx={920} cy={470} w={150} variant="ext" title="Tavily API" subtitle="web search"   icon={<Globe    className="h-5 w-5 text-emerald-400" />} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
            title="Cost Routing"
            body="GPT-3.5 handles retrieval and tool calls; GPT-4o is reserved for planning, synthesis, and judging — ~62% cost reduction per query."
          />
          <InfoCard
            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
            title="Guardrails"
            body="The harness enforces token budgets, tool whitelists, and prompt-injection checks before any agent acts on external content."
          />
          <InfoCard
            icon={<ListChecks className="h-5 w-5 text-amber-500" />}
            title="Eval Metrics"
            body="An LLM-as-a-judge evaluator scores every answer on faithfulness and relevancy, gating responses that fall below quality thresholds."
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="card-lift rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">{icon}</span>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
