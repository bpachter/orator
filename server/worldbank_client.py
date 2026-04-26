"""World Bank Open Data client — no API key required.

Fetches annual development indicators for G7 + China via the World Bank REST API v2.
"""

from __future__ import annotations

import logging

import httpx

from .errors import ApiError

logger = logging.getLogger("orator.worldbank")

WB_BASE = "https://api.worldbank.org/v2"

# G7 + China ISO2 → display label
COUNTRY_LABELS: dict[str, str] = {
    "US": "United States",
    "GB": "United Kingdom",
    "DE": "Germany",
    "FR": "France",
    "JP": "Japan",
    "CN": "China",
    "CA": "Canada",
    "IT": "Italy",
}


def fetch_indicator(country_iso: str, indicator: str, per_page: int = 100) -> list[dict]:
    """Fetch an annual World Bank indicator series for one country.

    Args:
        country_iso: ISO 2-letter country code e.g. 'US', 'DE'
        indicator: World Bank indicator code e.g. 'NY.GDP.MKTP.KD.ZG'
        per_page: Max observations to retrieve

    Returns:
        Sorted list of {date: str (YYYY-01-01), value: float}
    """
    url = f"{WB_BASE}/country/{country_iso}/indicator/{indicator}"
    params: dict[str, str] = {
        "format": "json",
        "per_page": str(per_page),
        "mrv": "60",
    }
    try:
        resp = httpx.get(url, params=params, timeout=15.0)
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise ApiError(
            502, "WB_HTTP_ERROR", f"World Bank HTTP {exc.response.status_code}"
        ) from exc
    except httpx.RequestError as exc:
        raise ApiError(
            502, "WB_NETWORK_ERROR", f"World Bank request failed: {exc}"
        ) from exc

    try:
        data = resp.json()
        # World Bank returns [pagination_meta, [observations]] or [meta, null] when no data
        if not isinstance(data, list) or len(data) < 2 or not data[1]:
            return []
        result: list[dict] = []
        for obs in data[1]:
            if obs.get("value") is None:
                continue
            year = str(obs.get("date", ""))
            if not year.isdigit():
                continue
            result.append({"date": f"{year}-01-01", "value": float(obs["value"])})
        result.sort(key=lambda o: o["date"])
        return result
    except ApiError:
        raise
    except Exception as exc:
        logger.warning("WorldBank parse error for %s/%s: %s", country_iso, indicator, exc)
        return []
