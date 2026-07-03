ROUTING_CONFIG = {
    "planner": "gpt-4o",
    "synthesizer": "gpt-4o",
    "evaluator": "gpt-4o",
    "rag_retriever": "gpt-3.5-turbo",
    "web_searcher": "gpt-3.5-turbo",
    "code_executor": "gpt-3.5-turbo",
}

COST_PER_1K_TOKENS = {
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
}


def get_model_for_agent(agent_name: str) -> str:
    return ROUTING_CONFIG.get(agent_name, "gpt-3.5-turbo")


def estimate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    rates = COST_PER_1K_TOKENS.get(model, COST_PER_1K_TOKENS["gpt-3.5-turbo"])
    return (input_tokens / 1000 * rates["input"]) + (output_tokens / 1000 * rates["output"])
