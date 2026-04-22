"""Lightweight in-process metrics and structured logging helpers."""

from __future__ import annotations

import json
import logging
import time
import uuid
from threading import Lock

START_TIME = time.time()

_lock = Lock()
_counters: dict[str, int] = {
    "requests_total": 0,
    "cache_hits": 0,
    "cache_misses": 0,
    "upstream_errors": 0,
}


def increment(name: str, by: int = 1) -> None:
    with _lock:
        _counters[name] = _counters.get(name, 0) + by


def snapshot() -> dict[str, float]:
    with _lock:
        data: dict[str, float] = dict(_counters)
    data["uptime_seconds"] = round(time.time() - START_TIME, 2)
    return data


def new_request_id() -> str:
    return uuid.uuid4().hex[:12]


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key in ("request_id", "method", "path", "status", "duration_ms"):
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(level: int = logging.INFO) -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)
