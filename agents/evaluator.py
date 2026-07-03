from harness.state import ResearchState
from eval.judge import score_faithfulness, score_relevancy


def evaluator_node(state: ResearchState) -> dict:
    context = " ".join(r.get("text", "") for r in state.get("rag_results", []))
    if not context:
        # Fall back to web results as context when no RAG results
        context = " ".join(r.get("content", "") for r in state.get("web_results", []))

    final_answer = state.get("final_answer", "")
    query = state["query"]

    faith = score_faithfulness(context or "No context available.", final_answer)
    relev = score_relevancy(query, final_answer)

    return {
        "faithfulness_score": faith,
        "relevancy_score": relev,
        "trace_log": [{"step": "evaluator", "faithfulness": faith, "relevancy": relev}],
    }
