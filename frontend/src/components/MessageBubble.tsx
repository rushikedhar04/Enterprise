import { useState } from "react";
import { ChevronDown, Clock, Coins, Cpu, ExternalLink } from "lucide-react";
import type { ChatMessage } from "../lib/demo-data";

function renderWithCitations(text: string) {
  return text.split(/(\[\d+\])/g).map((part, i) =>
    /^\[\d+\]$/.test(part) ? (
      <sup key={i} className="mx-0.5 rounded bg-primary/20 px-1 text-[0.65rem] font-semibold text-primary">
        {part}
      </sup>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const [open, setOpen] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-fade-up">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground shadow-[0_4px_20px_-4px_var(--color-primary)]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-up">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-card p-4 text-card-foreground">
        <p className="leading-relaxed">{renderWithCitations(message.text)}</p>

        {message.citations && (
          <div className="mt-3 border-t border-border pt-3">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-medium text-primary transition-all duration-200 ease-in-out hover:opacity-80"
            >
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
              Citations ({message.citations.length})
            </button>
            {open && (
              <ul className="mt-2 space-y-2 animate-fade-up">
                {message.citations.map((c) => (
                  <li key={c.id} className="rounded-lg border border-border bg-background/50 p-3 text-sm">
                    <a href={c.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium text-foreground hover:text-primary">
                      <span className="text-primary">[{c.id}]</span> {c.title}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="mt-1 text-muted-foreground">{c.snippet}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Pill icon={Clock} label={message.latency ?? "—"} />
          <Pill icon={Coins} label={message.cost ?? "—"} />
          <Pill icon={Cpu} label={`${message.tokens ?? "—"} tok`} />
        </div>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
      <Icon className="h-3 w-3 text-primary" />
      {label}
    </span>
  );
}