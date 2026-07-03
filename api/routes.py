import time
import uuid
import logging
import traceback
from fastapi import APIRouter, HTTPException
from api.models import QueryRequest, QueryResponse, HealthResponse, CitationOut

logger = logging.getLogger(__name__)
from graph.workflow import build_graph
from harness.guardrails import check_prompt_injection
from db.traces import log_trace
from observability.metrics import (
    query_counter,
    latency_histogram,
    cost_histogram,
    tokens_gauge,
    active_sessions,
)

router = APIRouter()
_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


def _build_citations(source_map: list, used_nums: list[str]) -> list[CitationOut]:
    """
    Convert the synthesizer's source_map into CitationOut objects.
    Only include sources whose number was actually cited in the answer.
    If no cite numbers are available, return all sources.
    """
    if not source_map:
        return []

    # used_nums are 1-indexed strings like ["1", "3"]
    indices = [int(n) - 1 for n in used_nums if n.isdigit() and 0 < int(n) <= len(source_map)]
    if not indices:
        indices = list(range(len(source_map)))

    citations = []
    for rank, idx in enumerate(indices, start=1):
        src = source_map[idx]
        citations.append(CitationOut(
            id=rank,
            title=src.get("title") or "Source",
            url=src.get("url") or "#",
            snippet=src.get("snippet") or "",
        ))
    return citations


@router.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    if check_prompt_injection(request.query):
        query_counter.labels(status="rejected").inc()
        raise HTTPException(status_code=400, detail="Prompt injection detected.")

    active_sessions.inc()
    start = time.time()

    state = {
        "query": request.query,
        "session_id": str(uuid.uuid4()),
        "plan": None,
        "sub_tasks": [],
        "rag_results": [],
        "web_results": [],
        "code_output": None,
        "final_answer": None,
        "citations": [],
        "source_map": [],
        "faithfulness_score": None,
        "relevancy_score": None,
        "tokens_used": 0,
        "token_budget": request.token_budget or 8000,
        "iteration_count": 0,
        "trace_log": [],
        "cost_usd": 0.0,
        "error": None,
    }

    try:
        graph = get_graph()
        result = await graph.ainvoke(state)
        latency = time.time() - start

        latency_histogram.observe(latency)
        cost_histogram.observe(result.get("cost_usd", 0))
        tokens_gauge.set(result.get("tokens_used", 0))
        query_counter.labels(status="200").inc()

        log_trace(result["session_id"], result.get("trace_log", []))

        cost_usd = result.get("cost_usd", 0.0)
        tokens_used = result.get("tokens_used", 0)
        citations = _build_citations(
            result.get("source_map", []),
            result.get("citations", []),
        )

        return QueryResponse(
            answer=result.get("final_answer") or "No answer generated.",
            citations=citations,
            # formatted strings for the frontend
            latency=f"{latency:.1f}s",
            cost=f"${cost_usd:.4f}",
            tokens=f"{tokens_used:,}",
            # raw numbers for logging / other consumers
            faithfulness=result.get("faithfulness_score"),
            relevancy=result.get("relevancy_score"),
            cost_usd=cost_usd,
            tokens_used=tokens_used,
            latency_sec=round(latency, 3),
            session_id=result["session_id"],
            trace_log=result.get("trace_log", []),
        )
    except Exception as e:
        query_counter.labels(status="500").inc()
        logger.error("Query failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        active_sessions.dec()


@router.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")


@router.get("/sessions/{session_id}/trace")
async def get_trace(session_id: str):
    from db.traces import get_trace as fetch_trace
    trace = fetch_trace(session_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"session_id": session_id, "trace": trace}
