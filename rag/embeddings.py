from langchain_openai import OpenAIEmbeddings


def get_embeddings():
    return OpenAIEmbeddings(model="text-embedding-3-small")


def embed_texts(texts: list[str]) -> list[list[float]]:
    embeddings = get_embeddings()
    return embeddings.embed_documents(texts)


def embed_query(query: str) -> list[float]:
    embeddings = get_embeddings()
    return embeddings.embed_query(query)
