"""Thin Alpha Vantage client for weekly adjusted OHLC close series."""

from __future__ import annotations

import logging
import os
import time

import requests

from .errors import ApiError

logger = logging.getLogger("orator.alpha_vantage")

AV_BASE = "https://www.alphavantage.co/query"
DEFAULT_TIMEOUT = 20
MAX_RETRIES = 3
BACKOFF_BASE_SECONDS = 1.0


def get_api_key() -> str:
    key = os.environ.get("ALPHAVANTAGE_API_KEY", "")
    if not key:
        raise ApiError(503, "ALPHAVANTAGE_KEY_MISSING", "ALPHAVANTAGE_API_KEY environment variable is not set")
    return key


def fetch_weekly_adjusted(symbol: str) -> list[dict]:
    """Return weekly adjusted close observations as [{date, value}] sorted ascending."""
    api_key = get_api_key()
    params = {
        "function": "TIME_SERIES_WEEKLY_ADJUSTED",
        "symbol": symbol,
        "apikey": api_key,
    }

    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(AV_BASE, params=params, timeout=DEFAULT_TIMEOUT)
            if resp.status_code >= 500:
                raise ApiError(502, "ALPHAVANTAGE_UPSTREAM_ERROR", "Alpha Vantage upstream service error")
            if resp.status_code >= 400:
                raise ApiError(502, "ALPHAVANTAGE_BAD_RESPONSE", f"Alpha Vantage request failed: HTTP {resp.status_code}")

            payload = resp.json()
            if payload.get("Note"):
                raise ApiError(429, "ALPHAVANTAGE_RATE_LIMIT", str(payload.get("Note")))
            if payload.get("Information"):
                raise ApiError(429, "ALPHAVANTAGE_RATE_LIMIT", str(payload.get("Information")))
            if payload.get("Error Message"):
                raise ApiError(404, "ALPHAVANTAGE_SYMBOL_NOT_FOUND", str(payload.get("Error Message")))

            data = payload.get("Weekly Adjusted Time Series") or {}
            out: list[dict] = []
            for dt, row in data.items():
                try:
                    out.append({"date": str(dt), "value": float(row.get("5. adjusted close"))})
                except Exception:
                    continue
            out.sort(key=lambda x: x["date"])
            return out
        except ApiError:
            raise
        except requests.Timeout as exc:
            last_exc = exc
            logger.warning("Alpha Vantage timeout for %s (attempt %s/%s)", symbol, attempt, MAX_RETRIES)
        except requests.RequestException as exc:
            last_exc = exc
            logger.warning(
                "Alpha Vantage request error for %s (attempt %s/%s): %s",
                symbol,
                attempt,
                MAX_RETRIES,
                exc,
            )
        except Exception as exc:
            last_exc = exc
            logger.warning("Alpha Vantage parse error for %s (attempt %s/%s): %s", symbol, attempt, MAX_RETRIES, exc)

        if attempt < MAX_RETRIES:
            time.sleep(BACKOFF_BASE_SECONDS * (2 ** (attempt - 1)))

    raise ApiError(502, "ALPHAVANTAGE_UNAVAILABLE", f"Alpha Vantage request failed after retries: {last_exc}")
