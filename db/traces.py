import os
import json
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

_pg_available = False
_pool = None


def _get_connection():
    global _pg_available, _pool
    try:
        import psycopg2
        from psycopg2 import pool as pg_pool

        if _pool is None:
            db_url = os.getenv("DATABASE_URL")
            if not db_url:
                return None
            _pool = pg_pool.SimpleConnectionPool(1, 5, dsn=db_url)
            _ensure_table()
        _pg_available = True
        return _pool.getconn()
    except Exception:
        _pg_available = False
        return None


def _ensure_table():
    conn = _get_connection()
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS traces (
                    id SERIAL PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    trace_log JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            conn.commit()
    finally:
        if _pool:
            _pool.putconn(conn)


def log_trace(session_id: str, trace_log: list) -> None:
    conn = _get_connection()
    if not conn:
        logger.debug("DB unavailable — trace not persisted for session %s", session_id)
        return
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO traces (session_id, trace_log) VALUES (%s, %s)",
                (session_id, json.dumps(trace_log)),
            )
        conn.commit()
    except Exception as e:
        logger.warning("Failed to log trace: %s", e)
    finally:
        if _pool:
            _pool.putconn(conn)


def get_trace(session_id: str) -> Optional[list]:
    conn = _get_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT trace_log FROM traces WHERE session_id = %s ORDER BY created_at DESC LIMIT 1",
                (session_id,),
            )
            row = cur.fetchone()
            return row[0] if row else None
    except Exception as e:
        logger.warning("Failed to fetch trace: %s", e)
        return None
    finally:
        if _pool:
            _pool.putconn(conn)
