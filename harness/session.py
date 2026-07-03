import uuid
from harness.state import ResearchState
from harness.token_budget import DEFAULT_SESSION_BUDGET


def init_session(query: str, token_budget: int = DEFAULT_SESSION_BUDGET) -> ResearchState:
    return {
        "query": query,
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
        "token_budget": token_budget,
        "iteration_count": 0,
        "trace_log": [],
        "cost_usd": 0.0,
        "error": None,
    }
