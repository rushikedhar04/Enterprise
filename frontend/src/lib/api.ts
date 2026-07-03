import type { ChatMessage, Citation } from "./demo-data";

// Set VITE_API_URL in .env for Railway / production deployments.
// Falls back to localhost for local dev.
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

interface ApiResponse {
  answer: string;
  citations: Citation[];
  latency: string;
  cost: string;
  tokens: string;
  faithfulness?: number;
  relevancy?: number;
}

export async function queryResearch(query: string): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }

  const data: ApiResponse = await res.json();

  return {
    id: `ai-${Date.now()}`,
    role: "ai",
    text: data.answer,
    citations: data.citations,
    latency: data.latency,
    cost: data.cost,
    tokens: data.tokens,
  };
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
