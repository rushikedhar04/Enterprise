import json
from langchain_openai import ChatOpenAI

FAITHFULNESS_PROMPT = """You are evaluating an AI answer for faithfulness to the provided context.
Score 0.0 to 1.0 where 1.0 = every claim in the answer is supported by the context.

Context:
{context}

Answer:
{answer}

Return ONLY a JSON object with no other text: {{"score": 0.XX, "reasoning": "one sentence"}}"""

RELEVANCY_PROMPT = """You are evaluating an AI answer for relevancy to the question.
Score 0.0 to 1.0 where 1.0 = answer directly and completely addresses the question.

Question: {question}
Answer: {answer}

Return ONLY a JSON object with no other text: {{"score": 0.XX, "reasoning": "one sentence"}}"""


def _parse_score(content: str) -> float:
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    data = json.loads(content)
    return float(data["score"])


def score_faithfulness(context: str, answer: str) -> float:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    response = llm.invoke(FAITHFULNESS_PROMPT.format(context=context[:3000], answer=answer[:2000]))
    try:
        return _parse_score(response.content)
    except Exception:
        return 0.0


def score_relevancy(question: str, answer: str) -> float:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    response = llm.invoke(RELEVANCY_PROMPT.format(question=question, answer=answer[:2000]))
    try:
        return _parse_score(response.content)
    except Exception:
        return 0.0
