import os
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from harness.state import ResearchState


def rag_node(state: ResearchState) -> dict:
    try:
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index(os.getenv("PINECONE_INDEX_NAME", "research-assistant"))

        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        query_vector = embeddings.embed_query(state["query"])

        results = index.query(
            vector=query_vector,
            top_k=5,
            include_metadata=True,
        )

        chunks = [
            {
                "text": match.metadata.get("text", ""),
                "source": match.metadata.get("source", ""),
                "score": float(match.score),
            }
            for match in results.matches
            if match.metadata
        ]
    except Exception as e:
        chunks = []
        return {
            "rag_results": chunks,
            "trace_log": [{"step": "rag_retriever", "error": str(e), "chunks_found": 0}],
        }

    return {
        "rag_results": chunks,
        "trace_log": [{"step": "rag_retriever", "chunks_found": len(chunks)}],
    }
