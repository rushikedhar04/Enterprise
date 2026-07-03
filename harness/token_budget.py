from harness.state import ResearchState

DEFAULT_SESSION_BUDGET = 8000


def check_budget(state: ResearchState) -> bool:
    return state["tokens_used"] < state["token_budget"]


def update_tokens(state: ResearchState, new_tokens: int) -> ResearchState:
    state["tokens_used"] = state.get("tokens_used", 0) + new_tokens
    return state
