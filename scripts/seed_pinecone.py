"""
One-time script: index sample documents into Pinecone.
Run from project root: python scripts/seed_pinecone.py

Indexes 30+ documents covering LangGraph, RAG, LLMs, Python, FastAPI, etc.
These back the RAG retriever so the demo works out of the box.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from dotenv import load_dotenv
load_dotenv()

from rag.indexer import index_documents

DOCUMENTS = [
    {
        "text": "Retrieval-Augmented Generation (RAG) combines a retriever and a generator. The retriever fetches relevant documents from a knowledge base, which are then passed as context to the LLM. This grounds the model's response in factual content, reducing hallucinations significantly compared to pure generation.",
        "source": "rag-overview",
    },
    {
        "text": "LangGraph is a framework for building stateful, multi-actor LLM applications. It extends LangChain with a StateGraph abstraction that supports cycles, branching, and conditional routing — enabling complex agent workflows that aren't possible with linear chains.",
        "source": "langgraph-overview",
    },
    {
        "text": "Prompt injection is an attack where adversarial text in the user input tricks an LLM into ignoring its system instructions. Prevention strategies include input sanitization, pattern matching for known injection phrases, and strict separation of system and user content in the prompt template.",
        "source": "security-guardrails",
    },
    {
        "text": "Vector embeddings map text to high-dimensional numeric vectors that capture semantic meaning. Cosine similarity measures the angle between two vectors, making it magnitude-invariant. This is ideal for semantic search where direction (meaning) matters more than the length of the vector.",
        "source": "embeddings-explainer",
    },
    {
        "text": "Pinecone is a fully managed vector database optimized for similarity search at scale. It supports billions of vectors, approximate nearest neighbor (ANN) indexing, real-time upserts, and metadata filtering. The free tier provides one index with 1536 dimensions suitable for OpenAI embeddings.",
        "source": "pinecone-overview",
    },
    {
        "text": "OpenAI's text-embedding-3-small model produces 1536-dimensional vectors by default. It uses Matryoshka Representation Learning, allowing dimension reduction without retraining. It is the recommended embedding model for cost-sensitive RAG pipelines.",
        "source": "openai-embeddings",
    },
    {
        "text": "GPT-4o is OpenAI's multimodal flagship model supporting text, images, and audio. It has stronger reasoning capabilities than GPT-3.5-turbo but costs approximately 10x more per token. Cost-aware routing uses GPT-4o for reasoning tasks and GPT-3.5-turbo for retrieval, achieving ~62% cost reduction.",
        "source": "model-routing",
    },
    {
        "text": "Token budget management caps the total tokens used per session to control costs in multi-agent LLM systems. Without a budget, each sub-agent can independently consume tokens, leading to runaway costs. A session budget of 8000 tokens balances quality and cost for most research queries.",
        "source": "token-budget",
    },
    {
        "text": "FastAPI is a modern Python web framework based on Starlette and Pydantic. It uses type annotations for automatic request validation, async-first design, and auto-generated OpenAPI documentation. FastAPI is significantly faster than Flask for I/O-bound workloads due to async support.",
        "source": "fastapi-overview",
    },
    {
        "text": "Prometheus is a time-series metrics system that scrapes HTTP endpoints exposing metrics in its text format. It stores data locally in a custom TSDB and supports PromQL for queries. Key metrics for LLM APIs: query latency, TTFT (time to first token), tokens/sec, and cost per query.",
        "source": "prometheus-overview",
    },
    {
        "text": "Grafana is an observability platform that queries data sources like Prometheus and renders time-series data as interactive dashboards. Dashboards can be provisioned from JSON files for repeatability. Key panels for a research assistant: P95 latency, TTFT, cost per query, queries per minute, error rate.",
        "source": "grafana-overview",
    },
    {
        "text": "The attention mechanism in transformers computes a weighted sum of value vectors, where weights are derived from query-key dot products. Self-attention allows each position to attend to all other positions in the sequence, capturing long-range dependencies. Multi-head attention runs multiple attention operations in parallel.",
        "source": "attention-mechanism",
    },
    {
        "text": "LLM-as-Judge evaluation uses a powerful LLM (like GPT-4o) to score generated answers on criteria such as faithfulness and relevancy. Faithfulness measures whether every claim in the answer is supported by the provided context (score 0-1). Answer relevancy measures how completely the answer addresses the question.",
        "source": "llm-as-judge",
    },
    {
        "text": "Maximal Marginal Relevance (MMR) selects documents that are relevant to the query but diverse from already-selected documents. It balances relevance and novelty, reducing redundancy in retrieved context. MMR is especially useful when the knowledge base has many similar chunks about the same topic.",
        "source": "mmr-retrieval",
    },
    {
        "text": "TypedDict in Python defines dictionary types with specific string keys and typed values. It enables type checking without runtime overhead. LangGraph uses TypedDict to define agent state schemas — each key represents a state field that agents read from and write to as the graph executes.",
        "source": "typed-dict",
    },
    {
        "text": "Docker uses OS-level containerization, sharing the host kernel to create isolated environments. Unlike virtual machines that emulate hardware with a hypervisor, containers are lightweight and start in milliseconds. Docker Compose orchestrates multi-container applications like the research assistant stack (API + Postgres + Prometheus + Grafana).",
        "source": "docker-overview",
    },
    {
        "text": "GitHub Actions workflows are defined as YAML files in .github/workflows/. They run on events like push, pull_request, and schedule. A CI pipeline for an LLM application typically: installs dependencies, runs unit tests, runs the golden-dataset eval to check score thresholds, and builds the Docker image.",
        "source": "github-actions",
    },
    {
        "text": "Pydantic validates Python data using type annotations. It automatically parses incoming JSON, validates field types, and raises descriptive errors. FastAPI uses Pydantic models for request and response schemas, enabling automatic OpenAPI documentation and input validation at API boundaries.",
        "source": "pydantic-overview",
    },
    {
        "text": "The CAP theorem states that a distributed system can guarantee at most two of three properties: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition tolerance (the system works despite network splits). During a network partition, systems must choose between C and A.",
        "source": "cap-theorem",
    },
    {
        "text": "CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts web pages from making requests to a different domain. APIs must include Access-Control-Allow-Origin headers to permit cross-origin requests. FastAPI's CORSMiddleware adds these headers for configured origins.",
        "source": "cors-overview",
    },
    {
        "text": "TTFT (Time to First Token) is the latency between when a request is sent and when the first generated token arrives. Low TTFT (under 1s) makes the application feel responsive. High TTFT creates a blank-screen wait that degrades user experience, especially for streaming responses.",
        "source": "ttft-metric",
    },
    {
        "text": "Fine-tuning updates model weights on domain-specific data, adapting behavior permanently but requiring retraining for every knowledge update. RAG retrieves external documents at inference time, keeping knowledge current without retraining. RAG is preferred when the knowledge base changes frequently.",
        "source": "finetuning-vs-rag",
    },
    {
        "text": "Tavily is a search API optimized for LLM consumption. Unlike raw Google Search which returns HTML, Tavily returns pre-cleaned, summarized text in a structured format. It supports basic and advanced search depths and is designed for integration into RAG pipelines and agent tooling.",
        "source": "tavily-overview",
    },
    {
        "text": "Stateful agents maintain context across steps using persistent state. LangGraph implements statefulness via a TypedDict state that flows through the graph, with each node reading from and writing to state fields. Stateless agents process each request independently with no memory of prior interactions.",
        "source": "stateful-agents",
    },
    {
        "text": "L1 regularization (Lasso) adds the sum of absolute weight values as a penalty, producing sparse models where unimportant features have zero weight. L2 regularization (Ridge) adds the sum of squared weights, shrinking all weights toward zero without zeroing them. L1 is preferred for feature selection.",
        "source": "regularization",
    },
    {
        "text": "Async programming in Python uses async/await syntax and an event loop. When code awaits an I/O operation, the event loop runs other coroutines. This achieves high throughput for I/O-bound tasks (HTTP calls, DB queries) without threads. FastAPI uses asyncio natively for concurrent request handling.",
        "source": "async-python",
    },
    {
        "text": "Railway is a modern Platform-as-a-Service that auto-deploys from GitHub on push. It supports PostgreSQL, Redis, and custom Dockerfile builds. The railway.toml file configures build and deploy settings. Railway replaced Heroku's free tier for many developers after Heroku ended free dynos in 2022.",
        "source": "railway-deployment",
    },
    {
        "text": "Infinite loop termination in multi-agent systems uses an iteration counter in the state. When the counter reaches max_iterations (e.g., 10), the graph routes directly to the synthesizer instead of running another sub-agent cycle. This prevents runaway costs and stack overflows in recursive agent calls.",
        "source": "loop-termination",
    },
    {
        "text": "Precision and recall are complementary metrics in information retrieval. Precision = relevant retrieved / total retrieved (how many fetched results are useful). Recall = relevant retrieved / total relevant (how many useful results were found). The F1 score balances both as their harmonic mean.",
        "source": "precision-recall",
    },
    {
        "text": "Step-level trace logging records each agent's execution in a structured log — inputs, outputs, model used, token count, cost, and latency. These traces are stored in PostgreSQL for debugging, auditing, and performance analysis. The /sessions/{id}/trace endpoint exposes traces via the FastAPI REST API.",
        "source": "trace-logging",
    },
]


def main():
    print(f"Seeding {len(DOCUMENTS)} documents into Pinecone...")
    n = index_documents(DOCUMENTS)
    print(f"Done. Upserted {n} vectors.")


if __name__ == "__main__":
    main()
