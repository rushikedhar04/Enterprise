import os
import time
import uuid
from pinecone import Pinecone, ServerlessSpec
from rag.embeddings import embed_texts

INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "research-assistant")
EMBED_DIM = 1536  # text-embedding-ada-002 / text-embedding-3-small


def _get_or_create_index(pc: Pinecone):
    existing = [idx.name for idx in pc.list_indexes()]
    if INDEX_NAME not in existing:
        print(f"Index '{INDEX_NAME}' not found — creating it (this takes ~30s)...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=EMBED_DIM,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        # Wait until the index is ready
        while not pc.describe_index(INDEX_NAME).status.get("ready", False):
            time.sleep(2)
        print(f"Index '{INDEX_NAME}' ready.")
    return pc.Index(INDEX_NAME)


def index_documents(documents: list[dict], batch_size: int = 100) -> int:
    """
    Index a list of documents into Pinecone.
    Each doc: {"text": str, "source": str, "metadata": dict (optional)}
    Returns number of vectors upserted.
    """
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index = _get_or_create_index(pc)

    texts = [doc["text"] for doc in documents]
    vectors = embed_texts(texts)

    upserted = 0
    for i in range(0, len(documents), batch_size):
        batch_docs = documents[i : i + batch_size]
        batch_vecs = vectors[i : i + batch_size]

        records = [
            {
                "id": str(uuid.uuid4()),
                "values": vec,
                "metadata": {
                    "text": doc["text"],
                    "source": doc.get("source", ""),
                    **(doc.get("metadata", {})),
                },
            }
            for doc, vec in zip(batch_docs, batch_vecs)
        ]

        index.upsert(vectors=records)
        upserted += len(records)

    return upserted
