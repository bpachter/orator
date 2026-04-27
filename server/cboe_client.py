"""CBOE Volatility Index data client — no API key required.

Fetches daily history CSVs from CBOE's public data endpoint:
  - VIX   (30-day implied volatility on S&P 500)
  - VIX3M (3-month implied volatility on S&P 500)
  - SKEW  (tail-risk measure; high value = fat left tail)
"""

from __future__ import annotations

import csv
import io
import logging

import httpx

from .errors import ApiError

logger = logging.getLogger("orator.cboe")

# CBOE public daily-history CSV URLs (no auth required)
CBOE_URLS: dict[str, str] = {
    "VIX": "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv",
    "VIX3M": "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX3M_History.csv",
    "SKEW": "https://cdn.cboe.com/api/global/us_indices/daily_prices/SKEW_History.csv",
}


def fetch_index(symbol: str, start: str | None = None) -> list[dict]:
    """Fetch daily CBOE index history.

    Args:
        symbol: One of 'VIX', 'VIX3M', 'SKEW'
        start: Optional ISO date 'YYYY-MM-DD'; observations before this date are excluded.

    Returns:
        Sorted list of {date: str (YYYY-MM-DD), value: float}
    """
    sym = symbol.upper()
    url = CBOE_URLS.get(sym)
    if not url:
        raise ApiError(400, "CBOE_UNKNOWN_SYMBOL", f"Unknown CBOE symbol: {symbol}")

    try:
        resp = httpx.get(url, timeout=20.0, follow_redirects=True)
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise ApiError(
            502, "CBOE_HTTP_ERROR", f"CBOE HTTP {exc.response.status_code}"
        ) from exc
    except httpx.RequestError as exc:
        raise ApiError(
            502, "CBOE_NETWORK_ERROR", f"CBOE request failed: {exc}"
        ) from exc

    try:
        reader = csv.DictReader(io.StringIO(resp.text))
        result: list[dict] = []
        for row in reader:
            # Headers vary: 'DATE'/'Date', 'CLOSE'/'Close'
            date_raw = (row.get("DATE") or row.get("Date") or "").strip()
            close_raw = (
                row.get("CLOSE")
                or row.get("Close")
                or row.get(sym)
                or row.get(sym.lower())
                or ""
            ).strip()
            if not date_raw or not close_raw:
                continue
            try:
                date = _parse_date(date_raw)
                value = float(close_raw)
            except (ValueError, TypeError):
                continue
            if start and date < start:
                continue
            result.append({"date": date, "value": value})
        result.sort(key=lambda o: o["date"])
        return result
    except ApiError:
        raise
    except Exception as exc:
        logger.warning("CBOE parse error for %s: %s", symbol, exc)
        return []


def _parse_date(raw: str) -> str:
    """Normalize CBOE date string to YYYY-MM-DD."""
    # Already ISO format
    if len(raw) == 10 and raw[4] == "-":
        return raw
    # MM/DD/YYYY format
    parts = raw.split("/")
    if len(parts) == 3:
        mm, dd, yyyy = parts
        return f"{yyyy}-{mm.zfill(2)}-{dd.zfill(2)}"
    raise ValueError(f"Unknown CBOE date format: {raw!r}")
