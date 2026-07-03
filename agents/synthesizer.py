import re
from langchain_openai import ChatOpenAI
from harness.state import ResearchState
from harness.router import get_model_for_agent, estimate_cost

SYNTHESIZER_PROMPT = """You are a research synthesizer. Combine the following information into \
a single coherent, cited answer.

User Query: {query}

Sources (use [1], [2], ... to cite them inline):
{sources}

Code Execution Output:
{code_output}

Instructions:
- Write a clear, comprehensive answer (3-5 paragraphs)
- Cite sources inline using [1], [2] numbers only — e.g. "RAG grounds responses [1][2]."
- Do NOT use labels like [RAG-1] or [WEB-1], only plain numbers [1], [2], etc.
- Be factual, do not hallucinate
- Omit a source type from citations if it had no results
"""


def synthesizer_node(state: ResearchState) -> dict:
    model = get_model_for_agent("synthesizer")
    llm = ChatOpenAI(model=model, temperature=0.1)

    rag_results = state.get("rag_results", [])
    web_results = state.get("web_results", [])

    # Build a flat numbered source list so the LLM uses [1], [2], ...
    sources = []
    source_map = []  # parallel list of metadata for the API layer
    for r in rag_results:
        n = len(sources) + 1
        sources.append(f"[{n}] {r['text'][:400]} (source: {r.get('source', 'internal')})")
        source_map.append({"type": "rag", "title": r.get("source") or "Knowledge Base", "url": "#", "snippet": r["text"][:200]})
    for r in web_results:
        n = len(sources) + 1
        sources.append(f"[{n}] {r['title']}: {r['content'][:300]} ({r['url']})")
        source_map.append({"type": "web", "title": r["title"], "url": r["url"], "snippet": r["content"][:200]})

    sources_text = "\n".join(sources) if sources else "No external sources available."
    code_out = state.get("code_output") or "No code execution was performed."

    response = llm.invoke(SYNTHESIZER_PROMPT.format(
        query=state["query"],
        sources=sources_text,
        code_output=code_out,
    ))

    usage = response.usage_metadata or {}
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)
    cost = estimate_cost(model, input_tokens, output_tokens)

    # Extract citation numbers used in the answer
    used_nums = list(dict.fromkeys(int(n) for n in re.findall(r"\[(\d+)\]", response.content)))
    citations = [str(n) for n in used_nums]

    return {
        "final_answer": response.content,
        "citations": citations,
        "source_map": source_map,
        "tokens_used": state.get("tokens_used", 0) + input_tokens + output_tokens,
        "cost_usd": state.get("cost_usd", 0.0) + cost,
        "trace_log": [{
            "step": "synthesizer",
            "answer_length": len(response.content),
            "citations": citations,
            "cost_usd": cost,
        }],
    }
