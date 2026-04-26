"""BIS (Bank for International Settlements) Statistics REST API client.

API docs: https://stats.bis.org/api-doc/v1/
No API key required.

Dataset C (total credit to private non-financial sector) — series key format:
  C.GDPC.{country}.A  — private credit as % of GDP, annual

Dataset EER (Effective Exchange Rates) — series key format:
  N.B.{country}.M     — narrow BIS EER, monthly
"""
from __future__ import annotations

import httpx

BIS_BASE = "https://stats.bis.org/api/v1"


def fetch_credit_gdp(country_iso: str) -> list[dict]:
    """Return private non-financial sector credit as % of GDP for a country.

    Args:
        country_iso: ISO2 country code, e.g. "US", "CN", "JP".

    Returns:
        List of {date: str (YYYY-Q format or YYYY), value: float} dicts.
    """
    # BIS dataset: C (Total Credit), measure GDPC = credit/GDP ratio, annual
    # Key: C.GDPC.{COUNTRY}.A  (C=total credit, G=GDP ratio, annual)
    key = f"C.GDPC.{country_iso.upper()}.A"
    url = f"{BIS_BASE}/data/{key}"
    params = {"startPeriod": "1990"}
    try:
        resp = httpx.get(url, params=params, timeout=20, follow_redirects=True)
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            return []
        raise
    # BIS returns CSV by default; request JSON-stat or SDMX-JSON
    # Check if JSON-stat is available
    content_type = resp.headers.get("content-type", "")
    if "json" in content_type:
        return _parse_bis_json(resp.json())
    return _parse_bis_csv(resp.text)


def _parse_bis_json(data: dict) -> list[dict]:
    """Parse BIS JSON-stat format."""
    try:
        obs = data.get("dataSets", [{}])[0].get("series", {})
        # Flatten series observations
        result = []
        for series_data in obs.values():
            observations = series_data.get("observations", {})
            time_dimension = data.get("structure", {}).get("dimensions", {}).get("observation", [{}])[0]
            time_values = [v.get("id") for v in time_dimension.get("values", [])]
            for idx_str, val_list in observations.items():
                idx = int(idx_str)
                if idx < len(time_values) and val_list and val_list[0] is not None:
                    result.append({"date": time_values[idx], "value": float(val_list[0])})
        return sorted(result, key=lambda x: x["date"])
    except (KeyError, IndexError, TypeError, ValueError):
        return []


def _parse_bis_csv(text: str) -> list[dict]:
    """Parse BIS CSV download format."""
    out = []
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return out
    # BIS CSV: first row is header, subsequent rows are data
    # Column layout varies; look for period/value pattern
    header = None
    for line in lines:
        if header is None:
            # Detect header line
            if "Period" in line or "TIME_PERIOD" in line or line.startswith('"'):
                header = [c.strip().strip('"') for c in line.split(",")]
                continue
            # Some BIS files have metadata rows first; skip until we see a year
            parts = line.split(",")
            if len(parts) >= 2:
                try:
                    float(parts[-1].strip())
                    # Looks like data — try to parse as year,value
                    out.append({"date": parts[0].strip().strip('"'), "value": float(parts[-1].strip())})
                except (ValueError, IndexError):
                    continue
            continue

        parts = [c.strip().strip('"') for c in line.split(",")]
        if len(parts) < 2:
            continue
        try:
            date = parts[0]
            value = float(parts[-1])
            if date and value is not None:
                out.append({"date": date, "value": value})
        except (ValueError, IndexError):
            continue

    return sorted(out, key=lambda x: x["date"])
