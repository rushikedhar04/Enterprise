# Enterprise Research Assistant

A LangGraph-orchestrated multi-agent research assistant. A user question is
decomposed by a planning agent, routed to the right retrieval/compute
sub-agents, synthesized into a single cited answer, and scored by an
LLM-as-Judge evaluator — all inside an agent harness that enforces token
budgets, prompt-injection guardrails, and loop termination.

## Architecture

```
User Query
   │
   ▼
Planner (gpt-4o) ──► decomposes query, decides which tools are needed
   │
   ├──► RAG Retriever (gpt-3.5-turbo)  — Pinecone vector search
   ├──► Web Searcher   (gpt-3.5-turbo)  — Tavily live search
   └──► Code Executor  (gpt-3.5-turbo)  — sandboxed Python for calculations
   │
   ▼
Synthesizer (gpt-4o) ──► combines sub-agent outputs into one cited answer
   │
   ▼
Evaluator (gpt-4o as Judge) ──► scores faithfulness & answer relevancy
```

Cost-aware model routing sends reasoning-heavy steps (planner, synthesizer,
evaluator) to GPT-4o and retrieval/compute steps to GPT-3.5-turbo — see
`harness/router.py` and `scripts/cost_benchmark.py` for the routing table
and the measured cost reduction.

## Tech stack

Python · LangGraph · FastAPI · OpenAI API · Pinecone · Tavily · Prometheus ·
Grafana · PostgreSQL · Docker · Railway · React (Vite + Tailwind + TanStack)

## Project structure

```
agents/           planner, rag_retriever, web_searcher, code_executor, synthesizer, evaluator
harness/          state.py, router.py, token_budget.py, guardrails.py, session.py
graph/            workflow.py (LangGraph StateGraph), edges.py
rag/              embeddings.py, retriever.py, indexer.py
eval/             judge.py, metrics.py, golden_dataset.json (50 Q&A), run_eval.py
api/              main.py (FastAPI), routes.py, models.py
observability/    Prometheus metrics + middleware
db/                PostgreSQL step-level trace logging
tests/            unit tests + golden-dataset integration test
frontend/         React app (Vite + Tailwind) — chat UI, live agent steps, architecture + metrics pages
docker/           Dockerfile, docker-compose.yml (local dev: api + postgres + prometheus + grafana)
nginx/            reverse proxy config
grafana/           dashboard.json
prometheus/       scrape config
scripts/          seed_pinecone.py, cost_benchmark.py
.github/workflows/ ci.yml — unit tests + golden-dataset regression on every push
```

## Setup

```bash
cp .env.example .env   # fill in OPENAI_API_KEY, PINECONE_API_KEY, TAVILY_API_KEY, etc.
pip install -r requirements.txt
python scripts/seed_pinecone.py   # one-time: index sample docs into Pinecone
```

## Running locally

```bash
# Backend only
uvicorn api.main:app --reload

# Full stack (API + Postgres + Prometheus + Grafana + frontend)
docker compose -f docker/docker-compose.yml up --build
```

API docs at `http://localhost:8000/docs`, frontend at `http://localhost:5173`,
Grafana at `http://localhost:3000`.

## Tests & eval

```bash
pytest tests/test_agents.py -v      # unit tests, no API keys required
python -m eval.run_eval              # full 50-query golden-dataset eval (requires API keys)
python scripts/cost_benchmark.py     # cost-routing vs all-GPT-4o comparison
```

Golden-dataset thresholds (enforced in CI): faithfulness ≥ 0.87, answer
relevancy ≥ 0.84.

## Deployment

Deployed via Railway (`railway.toml`), connected to this repo for
auto-deploy on push to `main`. `docker/docker-compose.yml` is for local
development only.
