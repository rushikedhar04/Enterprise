"""
Integration test: run a small subset of the golden dataset and assert thresholds.
Requires OPENAI_API_KEY, PINECONE_API_KEY, TAVILY_API_KEY.
Skipped automatically if keys are missing.
"""
import os
import json
import pytest
import asyncio
from pathlib import Path

pytestmark = pytest.mark.skipif(
    not os.getenv("OPENAI_API_KEY"),
    reason="OPENAI_API_KEY not set — skipping integration eval"
)


@pytest.mark.asyncio
async def test_golden_dataset_subset():
    from graph.workflow import build_graph
    from eval.metrics import mean, FAITHFULNESS_THRESHOLD, RELEVANCY_THRESHOLD

    dataset_path = Path(__file__).parent.parent / "eval" / "golden_dataset.json"
    with open(dataset_path) as f:
        dataset = json.load(f)

    # Run only first 5 in CI to limit cost
    subset = dataset[:5]
    graph = build_graph()

    faith_scores, relev_scores = [], []

    for item in subset:
        state = {
            "query": item["question"],
            "session_id": f"test_{item['id']}",
            "plan": None, "sub_tasks": [],
            "rag_results": [], "web_results": [],
            "code_output": None, "final_answer": None,
            "citations": [], "source_map": [], "faithfulness_score": None, "relevancy_score": None,
            "tokens_used": 0, "token_budget": 4000,
            "iteration_count": 0, "trace_log": [],
            "cost_usd": 0.0, "error": None,
        }

        result = await graph.ainvoke(state)
        assert result.get("final_answer"), f"No answer for question {item['id']}"

        faith_scores.append(result.get("faithfulness_score") or 0)
        relev_scores.append(result.get("relevancy_score") or 0)

    avg_faith = mean(faith_scores)
    avg_relev = mean(relev_scores)

    assert avg_faith >= FAITHFULNESS_THRESHOLD, f"Faithfulness {avg_faith:.3f} < {FAITHFULNESS_THRESHOLD}"
    assert avg_relev >= RELEVANCY_THRESHOLD, f"Relevancy {avg_relev:.3f} < {RELEVANCY_THRESHOLD}"
