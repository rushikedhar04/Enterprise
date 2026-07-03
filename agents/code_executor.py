import os
import subprocess
import tempfile
from langchain_openai import ChatOpenAI
from harness.state import ResearchState
from harness.router import get_model_for_agent, estimate_cost

CODE_GEN_PROMPT = """Write Python code to help answer: {query}

Only output runnable Python code. No markdown, no explanation, no imports that aren't in stdlib."""


def code_node(state: ResearchState) -> dict:
    model = get_model_for_agent("code_executor")
    llm = ChatOpenAI(model=model, temperature=0)

    code_response = llm.invoke(CODE_GEN_PROMPT.format(query=state["query"]))
    code = code_response.content.strip()
    # Strip markdown code fences if present
    if code.startswith("```"):
        lines = code.split("\n")
        code = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    usage = code_response.usage_metadata or {}
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)
    cost = estimate_cost(model, input_tokens, output_tokens)

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        tmp_path = f.name

    try:
        result = subprocess.run(
            ["python", tmp_path],
            capture_output=True,
            text=True,
            timeout=10,
        )
        output = result.stdout or result.stderr or "(no output)"
    except subprocess.TimeoutExpired:
        output = "Code execution timed out (10s limit)"
    except Exception as e:
        output = f"Execution error: {e}"
    finally:
        os.unlink(tmp_path)

    return {
        "code_output": output,
        "tokens_used": state.get("tokens_used", 0) + input_tokens + output_tokens,
        "cost_usd": state.get("cost_usd", 0.0) + cost,
        "trace_log": [{"step": "code_executor", "output": output[:200], "cost_usd": cost}],
    }
