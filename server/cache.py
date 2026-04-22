"""Process-local TTL cache for FRED responses."""

from __future__ import annotations

import threading
import time
from typing import Any, Callable

CACHE_TTL_SECONDS = 4 * 3600

_cache: dict[str, tuple[float, Any]] = {}
_lock = threading.Lock()


def get(key: str) -> Any | None:
    with _lock:
        entry = _cache.get(key)
    if entry and time.time() - entry[0] < CACHE_TTL_SECONDS:
        return entry[1]
    return None


def store(key: str, data: Any) -> Any:
    with _lock:
        _cache[key] = (time.time(), data)
    return data


def get_or_compute(key: str, compute: Callable[[], Any]) -> Any:
    hit = get(key)
    if hit is not None:
        return hit
    return store(key, compute())


def clear() -> None:
    with _lock:
        _cache.clear()
