import time
from starlette.middleware.base import BaseHTTPMiddleware
from observability.metrics import latency_histogram, query_counter


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start

        if request.url.path == "/query":
            latency_histogram.observe(duration)
            query_counter.labels(status=str(response.status_code)).inc()

        return response
