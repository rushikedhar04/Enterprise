from langgraph.graph import StateGraph, END
from harness.state import ResearchState
from agents.planner import planner_node
from agents.rag_retriever import rag_node
from agents.web_searcher import web_search_node
from agents.code_executor import code_node
from agents.synthesizer import synthesizer_node
from agents.evaluator import evaluator_node
from graph.edges import route_after_planner, should_continue


def build_graph():
    workflow = StateGraph(ResearchState)

    workflow.add_node("planner", planner_node)
    workflow.add_node("rag_retriever", rag_node)
    workflow.add_node("web_searcher", web_search_node)
    workflow.add_node("code_executor", code_node)
    workflow.add_node("synthesizer", synthesizer_node)
    workflow.add_node("evaluator", evaluator_node)

    workflow.set_entry_point("planner")

    workflow.add_conditional_edges(
        "planner",
        route_after_planner,
        {
            "rag": "rag_retriever",
            "web": "web_searcher",
            "code": "code_executor",
            "synthesize": "synthesizer",
        },
    )

    workflow.add_edge("rag_retriever", "synthesizer")
    workflow.add_edge("web_searcher", "synthesizer")
    workflow.add_edge("code_executor", "synthesizer")

    workflow.add_conditional_edges(
        "synthesizer",
        should_continue,
        {"evaluate": "evaluator", "end": END},
    )
    workflow.add_edge("evaluator", END)

    return workflow.compile()
