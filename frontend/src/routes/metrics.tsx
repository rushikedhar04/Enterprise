import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, DollarSign, ShieldCheck, Target } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { QUERIES_OVER_TIME, RECENT_QUERIES } from "../lib/demo-data";

export const Route = createFileRoute("/metrics")({
  head: () => ({
    meta: [
      { title: "Metrics — ResearchAI Performance & Evaluation" },
      { name: "description", content: "Latency, cost per query, faithfulness, and relevancy metrics for the ResearchAI multi-agent pipeline, with query volume trends and recent evaluations." },
      { property: "og:title", content: "ResearchAI Metrics" },
      { property: "og:description", content: "Live performance and evaluation metrics for the multi-agent research assistant." },
    ],
  }),
  component: MetricsPage,
});

function MetricsPage() {
  return (
    <div className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Metrics</h1>
        <p className="mt-2 text-muted-foreground">Performance and evaluation across recent research queries.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Avg Latency" value={3.2} suffix="s" decimals={1} icon={Clock} color="oklch(0.6 0.16 230)" delay={0} />
          <StatCard label="Cost / Query" value={0.0041} prefix="$" decimals={4} icon={DollarSign} color="oklch(0.7 0.18 150)" delay={120} />
          <StatCard label="Faithfulness" value={0.91} decimals={2} icon={ShieldCheck} color="oklch(0.585 0.233 293)" delay={240} />
          <StatCard label="Relevancy" value={0.88} decimals={2} icon={Target} color="oklch(0.8 0.16 85)" delay={360} />
        </div>

        <div className="card-lift mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Queries Over Time</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={QUERIES_OVER_TIME} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-foreground)",
                  }}
                />
                <Line type="monotone" dataKey="queries" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-lift mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <h2 className="border-b border-border p-5 font-semibold text-foreground">Recent Queries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Query</th>
                  <th className="px-5 py-3 font-medium">Latency</th>
                  <th className="px-5 py-3 font-medium">Cost</th>
                  <th className="px-5 py-3 font-medium">Faithfulness</th>
                  <th className="px-5 py-3 font-medium">Relevancy</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_QUERIES.map((r, i) => (
                  <tr key={i} className="border-t border-border transition-colors duration-200 hover:bg-accent/40">
                    <td className="max-w-xs truncate px-5 py-3 text-foreground">{r.query}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.latency}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.cost}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.faith}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.rel}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          r.status === "passed"
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}