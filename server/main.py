"""
Orator — FRED Data API
FastAPI backend deployed on Railway. Proxies FRED, computes YoY transforms,
and caches responses so the browser never needs an API key.
"""

import os
import time
import logging
from datetime import date, timedelta
from typing import Any

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orator")

FRED_API_KEY = os.environ.get("FRED_API_KEY", "")
FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"
CACHE_TTL = 4 * 3600  # 4 hours

app = FastAPI(title="Orator FRED API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bpachter.github.io",
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Simple in-memory cache
# ---------------------------------------------------------------------------

_cache: dict[str, tuple[float, Any]] = {}


def _cached(key: str) -> Any | None:
    entry = _cache.get(key)
    if entry and time.time() - entry[0] < CACHE_TTL:
        return entry[1]
    return None


def _store(key: str, data: Any) -> Any:
    _cache[key] = (time.time(), data)
    return data


# ---------------------------------------------------------------------------
# FRED fetch helpers
# ---------------------------------------------------------------------------

def _get_start(range_str: str) -> str:
    if range_str == "MAX":
        return "1990-01-01"
    years = {"1Y": 1, "2Y": 2, "5Y": 5, "10Y": 10}.get(range_str, 10)
    return (date.today() - timedelta(days=365 * years)).isoformat()


def _today() -> str:
    return date.today().isoformat()


def _fetch_fred(series_id: str, start: str, end: str, **extra) -> list[dict]:
    if not FRED_API_KEY:
        raise HTTPException(503, "FRED_API_KEY not configured")
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
        "observation_start": start,
        "observation_end": end,
        **extra,
    }
    r = requests.get(FRED_BASE, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    if "error_message" in data:
        raise HTTPException(502, f"FRED: {data['error_message']}")
    return [
        {"date": o["date"], "value": float(o["value"])}
        for o in data.get("observations", [])
        if o["value"] != "."
    ]


def _yoy(series: list[dict]) -> list[dict]:
    """Year-over-year % change for monthly series."""
    out = []
    for i in range(12, len(series)):
        prev = series[i - 12]["value"]
        curr = series[i]["value"]
        if prev != 0:
            out.append({"date": series[i]["date"], "value": round((curr - prev) / abs(prev) * 100, 3)})
    return out


# ---------------------------------------------------------------------------
# Series definitions
# ---------------------------------------------------------------------------

YIELD_MATURITIES = [
    {"id": "DGS3MO", "label": "3M",  "years": 0.25},
    {"id": "DGS6MO", "label": "6M",  "years": 0.5},
    {"id": "DGS1",   "label": "1Y",  "years": 1},
    {"id": "DGS2",   "label": "2Y",  "years": 2},
    {"id": "DGS3",   "label": "3Y",  "years": 3},
    {"id": "DGS5",   "label": "5Y",  "years": 5},
    {"id": "DGS7",   "label": "7Y",  "years": 7},
    {"id": "DGS10",  "label": "10Y", "years": 10},
    {"id": "DGS20",  "label": "20Y", "years": 20},
    {"id": "DGS30",  "label": "30Y", "years": 30},
]

MACRO_SERIES = [
    {"id": "FEDFUNDS",        "label": "Fed Funds Rate",       "color": "#e8b84b"},
    {"id": "CPIAUCSL",        "label": "CPI (YoY %)",           "color": "#ef4444", "yoy": True},
    {"id": "UNRATE",          "label": "Unemployment Rate",     "color": "#4a9eff"},
    {"id": "A191RL1Q225SBEA", "label": "Real GDP Growth (YoY)", "color": "#22c55e"},
]

CPI_COMPONENTS = [
    {"id": "CPIAUCSL",  "label": "All Items",              "color": "#ef4444"},
    {"id": "CPILFESL",  "label": "Core (ex Food & Energy)","color": "#f97316"},
    {"id": "CPIENGSL",  "label": "Energy",                 "color": "#eab308"},
    {"id": "CPIFABSL",  "label": "Food & Beverages",       "color": "#22c55e"},
    {"id": "CPIHOSSL",  "label": "Shelter",                "color": "#06b6d4"},
    {"id": "CPITRNSL",  "label": "Transportation",         "color": "#8b5cf6"},
    {"id": "CPIMEDSL",  "label": "Medical Care",           "color": "#ec4899"},
    {"id": "CPIRECSL",  "label": "Recreation",             "color": "#14b8a6"},
    {"id": "CPIEDUSL",  "label": "Education & Comm.",      "color": "#f59e0b"},
    {"id": "CPIAPPSL",  "label": "Apparel",                "color": "#a78bfa"},
    {"id": "CPIOGSSL",  "label": "Other Goods & Services", "color": "#64748b"},
]

SPREAD_SERIES = [
    {"id": "T10Y2Y",  "label": "10Y–2Y Spread",    "color": "#4a9eff"},
    {"id": "T10Y3M",  "label": "10Y–3M Spread",    "color": "#22c55e"},
    {"id": "FEDFUNDS","label": "Fed Funds Rate",   "color": "#e8b84b"},
    {"id": "CPILFESL","label": "Core CPI (YoY %)", "color": "#ef4444", "yoy": True},
    {"id": "USREC",   "label": "Recession",        "color": "#ef444440"},
]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok", "fred_key": bool(FRED_API_KEY)}


@app.get("/api/yield-curve")
def yield_curve(range: str = "5Y"):
    cache_key = f"yield:{range}"
    if hit := _cached(cache_key):
        return hit

    start = _get_start(range)
    end = _today()
    all_series = []
    for m in YIELD_MATURITIES:
        obs = _fetch_fred(m["id"], start, end, frequency="w", aggregation_method="eop")
        all_series.append(obs)

    date_sets = [set(o["date"] for o in s) for s in all_series]
    common_dates = sorted(
        d for d in (o["date"] for o in all_series[0])
        if all(d in ds for ds in date_sets)
    )
    maps = [{o["date"]: o["value"] for o in s} for s in all_series]

    result = {
        "updated": _today(),
        "range": range,
        "dates": common_dates,
        "maturityLabels": [m["label"] for m in YIELD_MATURITIES],
        "maturityYears": [m["years"] for m in YIELD_MATURITIES],
        "z": [[mp.get(d, float("nan")) for mp in maps] for d in common_dates],
    }
    return _store(cache_key, result)


@app.get("/api/macro")
def macro():
    cache_key = "macro"
    if hit := _cached(cache_key):
        return hit

    start = _get_start("10Y")
    end = _today()
    series_out = {}
    for s in MACRO_SERIES:
        obs = _fetch_fred(s["id"], start, end)
        series_out[s["id"]] = _yoy(obs) if s.get("yoy") else obs

    result = {"updated": _today(), "series": series_out}
    return _store(cache_key, result)


@app.get("/api/cpi-breakdown")
def cpi_breakdown():
    cache_key = "cpi-breakdown"
    if hit := _cached(cache_key):
        return hit

    start = _get_start("10Y")
    end = _today()
    series_out = {}
    for s in CPI_COMPONENTS:
        obs = _fetch_fred(s["id"], start, end)
        series_out[s["id"]] = _yoy(obs)

    result = {
        "updated": _today(),
        "components": CPI_COMPONENTS,
        "series": series_out,
    }
    return _store(cache_key, result)


@app.get("/api/spreads")
def spreads():
    cache_key = "spreads"
    if hit := _cached(cache_key):
        return hit

    start = _get_start("MAX")
    end = _today()
    series_out = {}
    for s in SPREAD_SERIES:
        obs = _fetch_fred(s["id"], start, end)
        series_out[s["id"]] = _yoy(obs) if s.get("yoy") else obs

    result = {
        "updated": _today(),
        "series": series_out,
    }
    return _store(cache_key, result)
