"""Smoke tests for metadata endpoints (no live FRED calls)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from server.main import app

client = TestClient(app)


def test_metrics_endpoint_returns_counters() -> None:
    res = client.get("/api/metrics")
    assert res.status_code == 200
    body = res.json()
    for k in ("requests_total", "cache_hits", "cache_misses", "upstream_errors", "uptime_seconds"):
        assert k in body


def test_request_id_header_round_trip() -> None:
    res = client.get("/api/health", headers={"X-Request-ID": "test-id-123"})
    assert res.status_code == 200
    assert res.headers.get("X-Request-ID") == "test-id-123"
