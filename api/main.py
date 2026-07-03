from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from api.routes import router
from observability.middleware import MetricsMiddleware

app = FastAPI(
    title="Enterprise Research Assistant API",
    description="LangGraph-orchestrated multi-agent research assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(MetricsMiddleware)
app.include_router(router)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
