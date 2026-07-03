import os
from pinecone import Pinecone
from rag.embeddings import embed_query


def get_index():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    return pc.Index(os.getenv("PINECONE_INDEX_NAME", "research-assistant"))


def retrieve(query: str, top_k: int = 5) -> list[dict]:
    index = get_index()
    vector = embed_query(query)

    results = index.query(vector=vector, top_k=top_k, include_metadata=True)

    return [
        {
            "text": match.metadata.get("text", ""),
            "source": match.metadata.get("source", ""),
            "score": float(match.score),
        }
        for match in results.matches
        if match.metadata
    ]
