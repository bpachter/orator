"""Thin FRED HTTP client with retries and standardized error mapping."""

from __future__ import annotations

import logging
import os
import time
from datetime import date, timedelta
from typing import Any

import requests

from .errors import ApiError

logger = logging.getLogger("orator.fred")

FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"
DEFAULT_TIMEOUT = 20
MAX_RETRIES = 3
BACKOFF_BASE_SECONDS = 1.0


def get_api_key() -> str:
    key = os.environ.get("FRED_API_KEY", "").strip().lower()
    if not key:
        raise ApiError(503, "FRED_KEY_MISSING", "FRED_API_KEY environment variable is not set")
    return key


def get_start_for_range(range_str: str) -> str:
    if range_str == "MAX":
        return "1990-01-01"
    # Map of range string to months (for flexibility with non-year boundaries)
    range_map = {
        "6M": 6,
        "1Y": 12,
        "3Y": 36,
        "5Y": 60,
        "10Y": 120,
        "20Y": 240,
        "30Y": 360,
    }
    months = range_map.get(range_str, 120)  # default to 10Y
    return (date.today() - timedelta(days=int(months * 30.44))).isoformat()


def today_iso() -> str:
    return date.today().isoformat()


def fetch_series(series_id: str, start: str, end: str, **extra: Any) -> list[dict]:
    """Fetch a single FRED series. Retries transient failures with backoff."""
    api_key = get_api_key()
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "observation_start": start,
        "observation_end": end,
        **extra,
    }

    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            r = requests.get(FRED_BASE, params=params, timeout=DEFAULT_TIMEOUT)
            if r.status_code >= 500:
                raise requests.HTTPError(f"upstream {r.status_code}")
            r.raise_for_status()
            data = r.json()
            if "error_message" in data:
                raise ApiError(502, "FRED_ERROR", data["error_message"])
            return [
                {"date": o["date"], "value": float(o["value"])}
                for o in data.get("observations", [])
                if o["value"] != "."
            ]
        except ApiError:
            raise
        except (requests.Timeout, requests.HTTPError, requests.ConnectionError) as exc:
            last_exc = exc
            wait = BACKOFF_BASE_SECONDS * (2 ** (attempt - 1))
            logger.warning(
                "FRED fetch failed for %s (attempt %d/%d): %s — retrying in %.1fs",
                series_id,
                attempt,
                MAX_RETRIES,
                exc,
                wait,
            )
            time.sleep(wait)

    try:
        from . import observability

        observability.increment("upstream_errors")
    except Exception:
        pass

    raise ApiError(
        502,
        "FRED_UNREACHABLE",
        f"Failed to fetch {series_id} after {MAX_RETRIES} attempts: {last_exc}",
    )
