"""Two-tier cache for FRED responses.

In-memory TTL cache backed by an optional SQLite blob store so that cached
payloads survive process restarts (e.g. Railway redeploys). Disable the disk
tier by unsetting `ORATOR_CACHE_PATH` or pointing it at `:memory:`.
"""

from __future__ import annotations

import json
import os
import sqlite3
import threading
import time
from collections.abc import Callable
from typing import Any

from pydantic import BaseModel

CACHE_TTL_SECONDS = int(os.environ.get("ORATOR_CACHE_TTL", 4 * 3600))
CACHE_PATH = os.environ.get("ORATOR_CACHE_PATH", "/tmp/orator-cache.sqlite")

_mem: dict[str, tuple[float, Any]] = {}
_lock = threading.Lock()
_disk_lock = threading.Lock()


def _serialize(data: Any) -> str:
    if isinstance(data, BaseModel):
        return data.model_dump_json()
    return json.dumps(data, default=str)


def _disk_conn() -> sqlite3.Connection | None:
    if not CACHE_PATH or CACHE_PATH == ":memory:":
        return None
    try:
        conn = sqlite3.connect(CACHE_PATH, timeout=2.0, check_same_thread=False)
        conn.execute(
            "CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, ts REAL, value TEXT)"
        )
        return conn
    except sqlite3.Error:
        return None


def _disk_get(key: str) -> Any | None:
    conn = _disk_conn()
    if conn is None:
        return None
    try:
        with _disk_lock:
            row = conn.execute(
                "SELECT ts, value FROM cache WHERE key = ?", (key,)
            ).fetchone()
        if not row:
            return None
        ts, value = row
        if time.time() - ts >= CACHE_TTL_SECONDS:
            return None
        return json.loads(value)
    except (sqlite3.Error, json.JSONDecodeError):
        return None
    finally:
        conn.close()


def _disk_store(key: str, data: Any) -> None:
    conn = _disk_conn()
    if conn is None:
        return
    try:
        payload = _serialize(data)
        with _disk_lock:
            conn.execute(
                "INSERT OR REPLACE INTO cache (key, ts, value) VALUES (?, ?, ?)",
                (key, time.time(), payload),
            )
            conn.commit()
    except (sqlite3.Error, TypeError, ValueError):
        pass
    finally:
        conn.close()


def get(key: str) -> Any | None:
    with _lock:
        entry = _mem.get(key)
    if entry and time.time() - entry[0] < CACHE_TTL_SECONDS:
        _record_hit()
        return entry[1]
    disk = _disk_get(key)
    if disk is not None:
        with _lock:
            _mem[key] = (time.time(), disk)
        _record_hit()
        return disk
    _record_miss()
    return None


def _record_hit() -> None:
    try:
        from . import observability

        observability.increment("cache_hits")
    except Exception:
        pass


def _record_miss() -> None:
    try:
        from . import observability

        observability.increment("cache_misses")
    except Exception:
        pass


def store(key: str, data: Any) -> Any:
    with _lock:
        _mem[key] = (time.time(), data)
    _disk_store(key, data)
    return data


def get_or_compute(key: str, compute: Callable[[], Any]) -> Any:
    hit = get(key)
    if hit is not None:
        return hit
    return store(key, compute())


def clear() -> None:
    with _lock:
        _mem.clear()
    conn = _disk_conn()
    if conn is not None:
        try:
            with _disk_lock:
                conn.execute("DELETE FROM cache")
                conn.commit()
        except sqlite3.Error:
            pass
        finally:
            conn.close()


def stats() -> dict[str, Any]:
    with _lock:
        mem_keys = len(_mem)
    return {"memory_keys": mem_keys, "disk_path": CACHE_PATH, "ttl_seconds": CACHE_TTL_SECONDS}
