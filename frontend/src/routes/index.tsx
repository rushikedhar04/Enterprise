import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowUp, Github, MessageSquarePlus, Plus } from "lucide-react";
import { AgentSteps } from "../components/AgentSteps";
import { MessageBubble } from "../components/MessageBubble";
import { NeuralIllustration } from "../components/NeuralIllustration";
import { ThemeToggle } from "../components/ThemeToggle";
import { Logo } from "../components/Logo";
import { AGENT_DEFS, DEMO_ANSWER, type ChatMessage } from "../lib/demo-data";
import { queryResearch } from "../lib/api";
import { useAgentStatuses } from "../lib/agent-status";
import { LivePipelineCard } from "../components/LivePipelineCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResearchAI — Cited answers from a multi-agent research assistant" },
      { name: "description", content: "Ask anything and get cited, evaluated answers powered by a GPT-4o multi-agent pipeline with RAG, web search, and code execution." },
      { property: "og:title", content: "ResearchAI — Multi-Agent Research Assistant" },
      { property: "og:description", content: "Cited answers powered by GPT-4o, Pinecone, and Tavily." },
    ],
  }),
  component: ChatPage,
});

const idleStatuses = () =>
  Object.fromEntries(AGENT_DEFS.map((a) => [a.key, "idle" as const]));

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [cost, setCost] = useState("$0.0000");
  const [tokens, setTokens] = useState("0");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { setStatuses } = useAgentStatuses();

  const runAnimation = (answer: ChatMessage) => {
    setStatuses(idleStatuses());
    setRunning(true);
    setCost("$0.0000");
    setTokens("0");
    timers.current.forEach(clearTimeout);
    timers.current = [];

    AGENT_DEFS.forEach((agent, i) => {
      timers.current.push(
        setTimeout(() => {
          setStatuses((s) => ({ ...s, [agent.key]: "running" }));
        }, i * 600),
      );
      timers.current.push(
        setTimeout(() => {
          setStatuses((s) => ({ ...s, [agent.key]: "done" }));
          setCost(`$${(0.0007 * (i + 1)).toFixed(4)}`);
          setTokens(`${(360 * (i + 1)).toLocaleString()}`);
        }, i * 600 + 300),
      );
    });

    const total = AGENT_DEFS.length * 600 + 350;
    timers.current.push(
      setTimeout(() => {
        // Show real cost/tokens from the answer
        if (answer.cost) setCost(answer.cost);
        if (answer.tokens) setTokens(answer.tokens);
        setMessages((m) => [...m, answer]);
        setRunning(false);
      }, total),
    );
  };

  const send = async (query?: string) => {
    const q = (query ?? input).trim();
    if (!q || running) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: q }]);
    setInput("");
    setHistory((h) => [q, ...h.filter((x) => x !== q)]);

    let answer: ChatMessage = { ...DEMO_ANSWER, id: `ai-${Date.now()}` };
    try {
      answer = await queryResearch(q);
    } catch {
      // Backend unreachable — show demo fallback
    }
    runAnimation(answer);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStatuses(idleStatuses());
    setRunning(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="p-4">
          <Logo />
          <button
            onClick={clearChat}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-in-out hover-glow"
          >
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          {history.length > 0 && (
            <>
              <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent
              </p>
              {history.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="mb-1 flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground transition-all duration-200 ease-in-out hover:bg-accent hover:text-foreground"
                >
                  <MessageSquarePlus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="line-clamp-2">{q}</span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border p-4">
          <ThemeToggle withLabel />
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
      </aside>

      {/* Main chat */}
      <main className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center animate-fade-up">
              <NeuralIllustration />
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                Ask anything. Get cited answers.
              </h1>
              <p className="mt-2 text-muted-foreground">Powered by GPT-4o · Pinecone · Tavily</p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {running && <LivePipelineCard />}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border bg-background/80 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={2}
              placeholder="Ask a research question…"
              className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 ease-in-out placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={() => send()}
              disabled={running || !input.trim()}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-in-out hover-glow disabled:opacity-50 disabled:hover:scale-100"
            >
              Send <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-right text-xs text-muted-foreground">
            Press <kbd className="rounded bg-secondary px-1.5 py-0.5">⌘↵</kbd> to send
          </p>
        </div>
      </main>

      {/* Right agent panel */}
      <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-border bg-sidebar p-4 xl:block">
        <AgentSteps cost={cost} tokens={tokens} />
      </aside>
    </div>
  );
}
