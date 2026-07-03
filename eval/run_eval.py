"""
Run the full eval suite against the golden dataset.
Called by CI/CD on every push.

Usage:
    python -m eval.run_eval
    # or
    python eval/run_eval.py
"""
import asyncio
import json
import sys
from pathlib import Path
from typing import Optional, Tuple

from graph.workflow import build_graph
from eval.metrics import mean, FAITHFULNESS_THRESHOLD, RELEVANCY_THRESHOLD

DATASET_PATH = Path(__file__).parent / "golden_dataset.json"


async def run_eval(limit: Optional[int] = None) -> Tuple[float, float]:
    with open(DATASET_PATH) as f:
        dataset = json.load(f)

    if limit:
        dataset = dataset[:limit]

    graph = build_graph()

    faithfulness_scores = []
    relevancy_scores = []
    failures = []

    for item in dataset:
        state = {
            "query": item["question"],
            "session_id": f"eval_{item['id']}",
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
            "token_budget": 6000,
            "iteration_count": 0,
            "trace_log": [],
            "cost_usd": 0.0,
            "error": None,
        }

        try:
            result = await graph.ainvoke(state)

            if result.get("final_answer"):
                faith = result.get("faithfulness_score") or 0.0
                relev = result.get("relevancy_score") or 0.0
                faithfulness_scores.append(faith)
                relevancy_scores.append(relev)
                print(f"  [{item['id']:02d}] faith={faith:.3f}  relev={relev:.3f}  '{item['question'][:60]}'")
            else:
                failures.append(item["id"])
                print(f"  [{item['id']:02d}] NO ANSWER — '{item['question'][:60]}'")
        except Exception as e:
            failures.append(item["id"])
            print(f"  [{item['id']:02d}] ERROR: {e}")

    avg_faith = mean(faithfulness_scores)
    avg_relev = mean(relevancy_scores)

    print("\n" + "=" * 60)
    print(f"Faithfulness:     {avg_faith:.3f}  (target: ≥{FAITHFULNESS_THRESHOLD})")
    print(f"Answer Relevancy: {avg_relev:.3f}  (target: ≥{RELEVANCY_THRESHOLD})")
    print(f"Answered: {len(faithfulness_scores)}/{len(dataset)}  |  Failed: {len(failures)}")
    if failures:
        print(f"Failed IDs: {failures}")
    print("=" * 60)

    if avg_faith < FAITHFULNESS_THRESHOLD:
        print(f"FAIL: Faithfulness {avg_faith:.3f} < {FAITHFULNESS_THRESHOLD}")
        sys.exit(1)
    if avg_relev < RELEVANCY_THRESHOLD:
        print(f"FAIL: Relevancy {avg_relev:.3f} < {RELEVANCY_THRESHOLD}")
        sys.exit(1)

    print("PASS: All thresholds met.")
    return avg_faith, avg_relev


if __name__ == "__main__":
    asyncio.run(run_eval())
