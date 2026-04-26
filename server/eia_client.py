"""Thin EIA API v2 client with retries and normalized observation parsing."""

from __future__ import annotations

import logging
import os
import time
from datetime import date

import requests

from .errors import ApiError

logger = logging.getLogger("orator.eia")

EIA_BASE = "https://api.eia.gov/v2/seriesid"
DEFAULT_TIMEOUT = 20
MAX_RETRIES = 3
BACKOFF_BASE_SECONDS = 1.0


def get_api_key() -> str:
    key = os.environ.get("EIA_API_KEY", "")
    if not key:
        raise ApiError(503, "EIA_KEY_MISSING", "EIA_API_KEY environment variable is not set")
    return key


def today_iso() -> str:
    return date.today().isoformat()


def _period_to_iso(period: str) -> str:
    # EIA may return daily, weekly, monthly, or annual periods depending on series.
    if len(period) == 10 and period[4] == "-" and period[7] == "-":
        return period
    if len(period) == 7 and period[4] == "-":
        return f"{period}-01"
    if len(period) == 4 and period.isdigit():
        return f"{period}-01-01"
    return period


def fetch_series(series_id: str, start: str | None = None, end: str | None = None) -> list[dict]:
    """Fetch a single EIA series and normalize into [{date, value}] sorted ascending."""
    api_key = get_api_key()
    url = f"{EIA_BASE}/{series_id}"
    params = {
        "api_key": api_key,
        "out": "json",
    }

    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, params=params, timeout=DEFAULT_TIMEOUT)
            if resp.status_code == 401:
                raise ApiError(503, "EIA_AUTH_FAILED", "EIA authentication failed")
            if resp.status_code == 404:
                raise ApiError(404, "EIA_SERIES_NOT_FOUND", f"Unknown EIA series: {series_id}")
            if resp.status_code >= 500:
                raise ApiError(502, "EIA_UPSTREAM_ERROR", "EIA upstream service error")
            if resp.status_code >= 400:
                raise ApiError(502, "EIA_BAD_RESPONSE", f"EIA request failed: HTTP {resp.status_code}")

            payload = resp.json()
            rows = ((payload.get("response") or {}).get("data") or [])
            out: list[dict] = []
            for row in rows:
                period = str(row.get("period") or row.get("date") or "")
                raw_val = row.get("value")
                if not period or raw_val in (None, "", "."):
                    continue
                try:
                    val = float(raw_val)
                except Exception:
                    continue
                iso = _period_to_iso(period)
                if start and iso < start:
                    continue
                if end and iso > end:
                    continue
                out.append({"date": iso, "value": val})

            out.sort(key=lambda x: x["date"])
            return out
        except ApiError:
            raise
        except requests.Timeout as exc:
            last_exc = exc
            logger.warning("EIA timeout for %s (attempt %s/%s)", series_id, attempt, MAX_RETRIES)
        except requests.RequestException as exc:
            last_exc = exc
            logger.warning("EIA request error for %s (attempt %s/%s): %s", series_id, attempt, MAX_RETRIES, exc)
        except Exception as exc:
            last_exc = exc
            logger.warning("EIA parse error for %s (attempt %s/%s): %s", series_id, attempt, MAX_RETRIES, exc)

        if attempt < MAX_RETRIES:
            time.sleep(BACKOFF_BASE_SECONDS * (2 ** (attempt - 1)))

    raise ApiError(502, "EIA_UNAVAILABLE", f"EIA request failed after retries: {last_exc}")
