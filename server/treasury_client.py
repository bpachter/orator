"""Treasury FiscalData client (no API key required)."""

from __future__ import annotations

import logging
import time

import requests

from .errors import ApiError

logger = logging.getLogger("orator.treasury")

TREASURY_BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1"
DEFAULT_TIMEOUT = 20
MAX_RETRIES = 3
BACKOFF_BASE_SECONDS = 1.0


def fetch_series(endpoint: str, date_field: str, value_field: str, limit: int = 2000) -> list[dict]:
    """Fetch and normalize treasury data into [{date, value}] ascending."""
    url = f"{TREASURY_BASE}/{endpoint}"
    params = {
        "page[number]": 1,
        "page[size]": min(limit, 10000),
        "sort": date_field,
        "fields": f"{date_field},{value_field}",
    }

    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, params=params, timeout=DEFAULT_TIMEOUT)
            if resp.status_code >= 500:
                raise ApiError(502, "TREASURY_UPSTREAM_ERROR", "Treasury FiscalData upstream service error")
            if resp.status_code >= 400:
                raise ApiError(502, "TREASURY_BAD_RESPONSE", f"Treasury request failed: HTTP {resp.status_code}")

            payload = resp.json()
            rows = payload.get("data") or []
            out: list[dict] = []
            for row in rows:
                dt = row.get(date_field)
                val = row.get(value_field)
                if dt in (None, "") or val in (None, "", "."):
                    continue
                try:
                    out.append({"date": str(dt), "value": float(val)})
                except Exception:
                    continue
            out.sort(key=lambda x: x["date"])
            return out
        except ApiError:
            raise
        except requests.Timeout as exc:
            last_exc = exc
            logger.warning("Treasury timeout for %s (attempt %s/%s)", endpoint, attempt, MAX_RETRIES)
        except requests.RequestException as exc:
            last_exc = exc
            logger.warning("Treasury request error for %s (attempt %s/%s): %s", endpoint, attempt, MAX_RETRIES, exc)
        except Exception as exc:
            last_exc = exc
            logger.warning("Treasury parse error for %s (attempt %s/%s): %s", endpoint, attempt, MAX_RETRIES, exc)

        if attempt < MAX_RETRIES:
            time.sleep(BACKOFF_BASE_SECONDS * (2 ** (attempt - 1)))

    raise ApiError(502, "TREASURY_UNAVAILABLE", f"Treasury request failed after retries: {last_exc}")
