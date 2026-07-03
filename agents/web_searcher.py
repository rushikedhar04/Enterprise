import os
from tavily import TavilyClient
from harness.state import ResearchState


def web_search_node(state: ResearchState) -> dict:
    try:
        client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

        results = client.search(
            query=state["query"],
            search_depth="basic",
            max_results=5,
        )

        web_results = [
            {"title": r["title"], "url": r["url"], "content": r["content"]}
            for r in results.get("results", [])
        ]
    except Exception as e:
        web_results = []
        return {
            "web_results": web_results,
            "trace_log": [{"step": "web_searcher", "error": str(e), "results_found": 0}],
        }

    return {
        "web_results": web_results,
        "trace_log": [{"step": "web_searcher", "results_found": len(web_results)}],
    }
