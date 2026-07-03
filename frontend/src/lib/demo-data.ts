export interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  citations?: Citation[];
  latency?: string;
  cost?: string;
  tokens?: string;
}

export const AGENT_DEFS = [
  { key: "planner", name: "Planner", color: "oklch(0.585 0.233 293)", time: "0.4s" },
  { key: "rag", name: "RAG Retriever", color: "oklch(0.6 0.16 230)", time: "0.9s" },
  { key: "web", name: "Web Searcher", color: "oklch(0.7 0.16 162)", time: "1.1s" },
  { key: "code", name: "Code Executor", color: "oklch(0.75 0.17 70)", time: "0.6s" },
  { key: "synth", name: "Synthesizer", color: "oklch(0.585 0.233 293)", time: "0.8s" },
  { key: "eval", name: "Evaluator", color: "oklch(0.8 0.16 85)", time: "0.5s" },
] as const;

export const PAST_QUERIES = [
  "What are the latest advances in retrieval-augmented generation?",
  "Compare vector databases for production RAG pipelines",
  "Summarize the 2024 papers on LLM-as-a-judge evaluation",
];

export const DEMO_ANSWER: ChatMessage = {
  id: "demo-ai",
  role: "ai",
  text: "Retrieval-augmented generation (RAG) grounds language models in external knowledge by retrieving relevant documents before generation [1]. Modern production stacks pair a vector store such as Pinecone with hybrid search and re-ranking to maximize faithfulness [2]. Recent work shows that combining dense retrieval with live web search via Tavily reduces hallucinations on time-sensitive queries by up to 34% [3].",
  citations: [
    {
      id: 1,
      title: "Lewis et al. — Retrieval-Augmented Generation",
      url: "https://arxiv.org/abs/2005.11401",
      snippet: "Introduces the RAG architecture combining parametric and non-parametric memory.",
    },
    {
      id: 2,
      title: "Pinecone — Production RAG Best Practices",
      url: "https://www.pinecone.io/learn/",
      snippet: "Hybrid search and re-ranking strategies for high-faithfulness retrieval.",
    },
    {
      id: 3,
      title: "Tavily — Live Search for Grounded Answers",
      url: "https://tavily.com/",
      snippet: "Real-time web search reduces hallucination on time-sensitive queries.",
    },
  ],
  latency: "3.1s",
  cost: "$0.0041",
  tokens: "2,184",
};

// Metrics page data
export const QUERIES_OVER_TIME = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  queries: Math.round(40 + 30 * Math.sin(i / 3) + i * 2.5 + Math.random() * 12),
}));

export const RECENT_QUERIES = [
  { query: "Advances in retrieval-augmented generation for...", latency: "3.1s", cost: "$0.0041", faith: "0.93", rel: "0.90", status: "passed" },
  { query: "Compare Pinecone vs Weaviate for hybrid search...", latency: "2.8s", cost: "$0.0038", faith: "0.91", rel: "0.88", status: "passed" },
  { query: "LLM-as-a-judge reliability across model sizes...", latency: "4.2s", cost: "$0.0052", faith: "0.74", rel: "0.81", status: "failed" },
  { query: "Cost routing strategies for multi-agent systems...", latency: "2.4s", cost: "$0.0029", faith: "0.95", rel: "0.92", status: "passed" },
  { query: "Guardrail patterns for tool-using agents in prod...", latency: "5.1s", cost: "$0.0061", faith: "0.68", rel: "0.79", status: "failed" },
] as const;