from pydantic import BaseModel
from typing import Optional, List


class QueryRequest(BaseModel):
    query: str
    token_budget: Optional[int] = 8000


class CitationOut(BaseModel):
    id: int
    title: str
    url: str
    snippet: str


class QueryResponse(BaseModel):
    answer: str
    # Rich citation objects — consumed by the Lovable frontend
    citations: List[CitationOut]
    # Formatted strings — consumed directly by the frontend UI
    latency: str        # e.g. "3.1s"
    cost: str           # e.g. "$0.0041"
    tokens: str         # e.g. "2,184"
    # Raw numbers — useful for logging / Prometheus / other consumers
    faithfulness: Optional[float]
    relevancy: Optional[float]
    cost_usd: float
    tokens_used: int
    latency_sec: float
    session_id: str
    trace_log: Optional[List[dict]] = None


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"
