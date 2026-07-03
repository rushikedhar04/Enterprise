from harness.state import ResearchState

INJECTION_PATTERNS = [
    "ignore previous instructions",
    "ignore all instructions",
    "you are now",
    "act as",
    "pretend you are",
    "jailbreak",
    "disregard your",
    "forget your instructions",
    "new persona",
    "override your",
]


def check_prompt_injection(query: str) -> bool:
    query_lower = query.lower()
    return any(pattern in query_lower for pattern in INJECTION_PATTERNS)


def check_loop_termination(state: ResearchState) -> bool:
    return state.get("iteration_count", 0) >= 10
