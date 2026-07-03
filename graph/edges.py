from harness.state import ResearchState


def route_after_planner(state: ResearchState) -> str:
    if state.get("error"):
        return "synthesize"

    if state.get("iteration_count", 0) >= 10:
        return "synthesize"

    plan = state.get("plan", "").lower()

    if "web" in plan or "search" in plan or "current" in plan or "latest" in plan:
        return "web"
    elif "code" in plan or "calculate" in plan or "compute" in plan or "math" in plan:
        return "code"
    elif "rag" in plan or "document" in plan or "retrieve" in plan or "knowledge" in plan:
        return "rag"
    else:
        return "rag"


def should_continue(state: ResearchState) -> str:
    if state.get("final_answer"):
        return "evaluate"
    return "end"
