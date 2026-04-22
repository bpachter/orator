"""Smoke tests for FastAPI routes (no live FRED calls)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from server.main import app

client = TestClient(app)


def test_health_endpoint_returns_envelope() -> None:
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "version" in body
    assert "fred_key" in body


def test_missing_fred_key_returns_error_envelope(monkeypatch) -> None:
    monkeypatch.delenv("FRED_API_KEY", raising=False)
    res = client.get("/api/macro")
    # Without an API key the request should produce a structured error envelope.
    assert res.status_code in (502, 503)
    body = res.json()
    assert "error" in body
    assert "code" in body["error"]
    assert "message" in body["error"]
