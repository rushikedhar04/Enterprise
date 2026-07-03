from prometheus_client import Counter, Histogram, Gauge

query_counter = Counter(
    "research_queries_total",
    "Total queries processed",
    ["status"],
)

latency_histogram = Histogram(
    "query_latency_seconds",
    "End-to-end query latency",
    buckets=[0.5, 1, 2, 5, 10, 30, 60],
)

ttft_histogram = Histogram(
    "ttft_seconds",
    "Time to first token",
    buckets=[0.1, 0.5, 1, 2, 5],
)

cost_histogram = Histogram(
    "query_cost_usd",
    "Cost per query in USD",
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
)

tokens_gauge = Gauge("tokens_used_last_query", "Tokens used in the last query")

active_sessions = Gauge("active_sessions", "Currently active sessions")
