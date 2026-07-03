"""
Cost benchmark: compare all-GPT-4o vs cost-routed for 10 queries.
Run: python scripts/cost_benchmark.py
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from dotenv import load_dotenv
load_dotenv()

from graph.workflow import build_graph
from harness.router import estimate_cost, ROUTING_CONFIG

QUERIES = [
    "What is retrieval-augmented generation?",
    "Calculate compound interest on $5000 at 4% for 5 years",
    "What are the latest AI model releases?",
    "Explain the transformer attention mechanism",
    "Write Python code to find the GCD of two numbers",
    "What is LangGraph and how does it work?",
    "What is the current state of AI regulation?",
    "Explain vector embeddings and cosine similarity",
    "Calculate the factorial of 12",
    "What is prompt injection and how to prevent it?",
]

AVG_TOKENS = {"input": 500, "output": 400}


def estimate_all_4o_cost():
    total = 0
    for _ in QUERIES:
        for agent in ROUTING_CONFIG:
            total += estimate_cost("gpt-4o", AVG_TOKENS["input"], AVG_TOKENS["output"])
    return total


def estimate_routed_cost():
    total = 0
    for _ in QUERIES:
        for agent, model in ROUTING_CONFIG.items():
            total += estimate_cost(model, AVG_TOKENS["input"], AVG_TOKENS["output"])
    return total


def main():
    all_4o = estimate_all_4o_cost()
    routed = estimate_routed_cost()
    reduction = (1 - routed / all_4o) * 100

    print(f"\nCost Benchmark — {len(QUERIES)} queries, {len(ROUTING_CONFIG)} agents each")
    print(f"{'─' * 40}")
    print(f"All GPT-4o:     ${all_4o:.4f}")
    print(f"Cost-routed:    ${routed:.4f}")
    print(f"Reduction:      {reduction:.1f}%")
    print(f"{'─' * 40}")

    if reduction >= 60:
        print(f"PASS: {reduction:.1f}% >= 60% target")
    else:
        print(f"FAIL: {reduction:.1f}% < 60% target")
        sys.exit(1)


if __name__ == "__main__":
    main()
