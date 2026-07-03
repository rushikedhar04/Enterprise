# Project Context — Read This First

## What We're Building
Enterprise Multi-Agent Research Assistant. This is on the resume and must be interview-ready by ~2026-06-13.

## How It Works
A user asks a question → LangGraph orchestrates 6 agents:
1. **Planner** (GPT-4o) — breaks query into sub-tasks, decides which agents to call
2. **RAG Retriever** (GPT-3.5-turbo) — searches Pinecone vector store
3. **Web Searcher** (GPT-3.5-turbo) — live search via Tavily API
4. **Code Executor** (GPT-3.5-turbo) — runs sandboxed Python for calculations
5. **Synthesizer** (GPT-4o) — combines all outputs into one cited answer
6. **Evaluator** (GPT-4o as Judge) — scores the answer: faithfulness ≥ 0.87, relevancy ≥ 0.84

## Resume Claims to Verify
- LangGraph-orchestrated multi-agent (Planner → sub-agents → Synthesizer)
- LLM-as-Judge eval: faithfulness ≥ 0.87, answer relevancy ≥ 0.84 on 50-query golden dataset
- Cost-aware model routing: GPT-4o for reasoning, GPT-3.5-turbo for retrieval → ~62% cost reduction
- Prompt injection guardrails, infinite-loop termination (max_iterations=10), step-level trace logging
- Deployed on Railway (NOT DigitalOcean — user cancelled that)
- Observability: Prometheus + Grafana — TTFT, TBT, tokens/sec, cost-per-query
- CI/CD: golden-dataset regression on every push

## Tech Stack
Python · LangGraph · FastAPI · OpenAI API · Pinecone · Tavily · Prometheus · Grafana · Docker · Railway · React (Vite + Tailwind)

## Deployment
- **Railway** (paid plan, $5/mo) — same as user's other projects: Sentinel Vision, Drift Watch
- Connect GitHub repo → Railway auto-deploys on every push to main
- Need `railway.toml` in root (NOT docker-compose for prod, that's local dev only)

## Frontend
- React app (Vite + Tailwind) — looks good, has a live demo
- Shows real-time agent steps as they run
- Architecture diagram page (interactive SVG)
- Metrics dashboard page (pulls from Prometheus)

## File Structure have you done anything with the frontend? I just gave you the research component file, something I got from lovable. So that you can use it, it is in this enterprise folder. Go and use it for the frontend and update me till where we did the project. 
enterprise-research-assistant/
├── agents/           # planner, rag_retriever, web_searcher, code_executor, synthesizer, evaluator
├── harness/          # state.py, router.py, token_budget.py, guardrails.py, session.py
├── graph/            # workflow.py (LangGraph StateGraph), edges.py
├── rag/              # embeddings.py, retriever.py, indexer.py
├── eval/             # judge.py, metrics.py, golden_dataset.json (50 Q&A), run_eval.py
├── api/              # main.py (FastAPI), routes.py, models.py
├── observability/    # metrics.py (Prometheus), middleware.py
├── db/               # traces.py (PostgreSQL step logging)
├── tests/            # test_agents.py, test_golden_dataset.py
├── frontend/         # React app (Vite + Tailwind)
├── docker/           # Dockerfile, docker-compose.yml (local dev)
├── nginx/            # nginx.conf
├── grafana/          # dashboard.json
├── prometheus/       # prometheus.yml
├── scripts/          # seed_pinecone.py
├── .github/workflows/# ci.yml (GitHub Actions)
├── .env              # API keys — DO NOT COMMIT
├── .env.example      # safe template
├── railway.toml      # Railway deploy config
└── requirements.txt

## Build Order
1. harness/state.py → harness/router.py → harness/guardrails.py → harness/token_budget.py
2. agents/ (all 6)
3. graph/edges.py → graph/workflow.py
4. api/models.py → api/routes.py → api/main.py
5. observability/ → db/traces.py
6. eval/golden_dataset.json → eval/judge.py → eval/run_eval.py
7. frontend/ (React)
8. railway.toml → .github/workflows/ci.yml
9. seed_pinecone.py → docker compose up → verify end-to-end

## API Keys (user has all 3)
- OPENAI_API_KEY — platform.openai.com
- PINECONE_API_KEY — app.pinecone.io (index: research-assistant, dim 1536, cosine)
- TAVILY_API_KEY — app.tavily.com

## Cost Routing Logic
- gpt-4o → planner, synthesizer, evaluator
- gpt-3.5-turbo → rag_retriever, web_searcher, code_executor
- ~62% cost reduction vs all-GPT-4o

## Key Numbers
- Token budget per session: 8000
- Max iterations (loop guard): 10
- Faithfulness threshold: ≥ 0.87
- Relevancy threshold: ≥ 0.84
- Golden dataset: 50 Q&A pairs

## Full Spec File
The complete spec with all code snippets is at:
/Users/rushikedhar/Desktop/enterprise/enterprise_research_assistant_BUILD_SPEC.md
