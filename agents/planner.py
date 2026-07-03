import json
from langchain_openai import ChatOpenAI
from harness.state import ResearchState
from harness.router import get_model_for_agent, estimate_cost
from harness.guardrails import check_prompt_injection

PLANNER_PROMPT = """You are a research planning agent. Given a user query, decompose it into \
specific sub-tasks and determine which tools to use.

Available tools:
- RAG retrieval: search internal knowledge base documents
- Web search: search the internet for current information
- Code execution: run Python for calculations or data analysis

Output a JSON plan:
{{
  "reasoning": "why you chose these tools",
  "sub_tasks": ["task1", "task2"],
  "tools_needed": ["rag", "web", "code"]
}}

Only include tools that are actually needed for this query.

Query: {query}"""


def planner_node(state: ResearchState) -> dict:
    if check_prompt_injection(state["query"]):
        return {
            "error": "Prompt injection detected",
            "final_answer": "I cannot process this request.",
            "trace_log": [{"step": "planner", "error": "injection_detected"}],
        }

    model = get_model_for_agent("planner")
    llm = ChatOpenAI(model=model, temperature=0)

    response = llm.invoke(PLANNER_PROMPT.format(query=state["query"]))

    try:
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        plan_data = json.loads(content)
    except (json.JSONDecodeError, IndexError):
        plan_data = {"reasoning": response.content, "sub_tasks": [state["query"]], "tools_needed": ["rag"]}

    usage = response.usage_metadata or {}
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)
    cost = estimate_cost(model, input_tokens, output_tokens)

    return {
        "plan": json.dumps(plan_data),
        "sub_tasks": plan_data.get("sub_tasks", []),
        "iteration_count": state.get("iteration_count", 0) + 1,
        "tokens_used": state.get("tokens_used", 0) + input_tokens + output_tokens,
        "cost_usd": state.get("cost_usd", 0.0) + cost,
        "trace_log": [{
            "step": "planner",
            "model": model,
            "output": plan_data,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost,
        }],
    }
