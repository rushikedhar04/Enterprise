from typing import TypedDict, List, Optional, Annotated
import operator


class ResearchState(TypedDict):
    query: str
    session_id: str
    plan: Optional[str]
    sub_tasks: List[str]
    rag_results: List[dict]
    web_results: List[dict]
    code_output: Optional[str]
    final_answer: Optional[str]
    citations: List[str]
    source_map: List[dict]
    faithfulness_score: Optional[float]
    relevancy_score: Optional[float]
    tokens_used: int
    token_budget: int
    iteration_count: int
    trace_log: Annotated[List[dict], operator.add]
    cost_usd: float
    error: Optional[str]
