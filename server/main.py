"""
Orator — FRED Data API
FastAPI backend deployed on Railway. Proxies FRED, computes YoY transforms,
and caches responses so the browser never needs an API key.
"""

from __future__ import annotations

import logging
import os
import time

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import cache, observability
from .analytics import recession_composite, sahm_rule, yield_curve_inverted
from .errors import ApiError, error_response
from .fred_client import fetch_series, get_start_for_range, today_iso
from .schemas import (
    ActivityResponse,
    ConsumerResponse,
    CpiBreakdownResponse,
    CreditConditionsResponse,
    GroceryResponse,
    HealthResponse,
    HousingResponse,
    InflationResponse,
    LaborResponse,
    MacroResponse,
    MarketsResponse,
    MetricsResponse,
    RecessionSignal,
    RecessionSignalsResponse,
    SeriesMeta,
    SpreadsResponse,
    YieldCurveResponse,
)
from .series import (
    ACTIVITY_SERIES,
    CONSUMER_SERIES,
    CPI_COMPONENTS,
    CREDIT_CONDITIONS_SERIES,
    GROCERY_SERIES,
    HOUSING_SERIES,
    INFLATION_SERIES,
    LABOR_SERIES,
    MACRO_SERIES,
    MARKETS_SERIES,
    RECESSION_INPUT_SERIES,
    SPREAD_SERIES,
    YIELD_MATURITIES,
)
from .transforms import yoy

observability.configure_logging()
logger = logging.getLogger("orator")

API_VERSION = "0.4.0"

DEFAULT_ALLOWED_ORIGINS = [
    "https://bpachter.github.io",
    "http://localhost:5173",
    "http://localhost:4173",
]


def _allowed_origins() -> list[str]:
    raw = os.environ.get("ALLOWED_ORIGINS")
    if not raw:
        return DEFAULT_ALLOWED_ORIGINS
    return [o.strip() for o in raw.split(",") if o.strip()]


app = FastAPI(
    title="Orator FRED API",
    version=API_VERSION,
    description="Macro-economic data proxy for the Orator dashboard.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_methods=["GET"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)


@app.middleware("http")
async def request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or observability.new_request_id()
    request.state.request_id = request_id
    observability.increment("requests_total")
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        observability.increment("upstream_errors")
        logger.exception(
            "request_failed",
            extra={"request_id": request_id, "method": request.method, "path": request.url.path},
        )
        raise
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "request",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    return response


# ---------------------------------------------------------------------------
# Standardized error envelope handlers
# ---------------------------------------------------------------------------


@app.exception_handler(ApiError)
async def handle_api_error(_: Request, exc: ApiError):
    return error_response(exc.status_code, exc.code, exc.message)


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(_: Request, exc: StarletteHTTPException):
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail and "message" in detail:
        return error_response(exc.status_code, detail["code"], detail["message"])
    return error_response(exc.status_code, "HTTP_ERROR", str(detail))


@app.exception_handler(RequestValidationError)
async def handle_validation_error(_: Request, exc: RequestValidationError):
    return error_response(422, "VALIDATION_ERROR", str(exc.errors()))


@app.exception_handler(Exception)
async def handle_unexpected(_: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return error_response(500, "INTERNAL_ERROR", "Unexpected server error")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health", response_model=HealthResponse, tags=["meta"])
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        fred_key=bool(os.environ.get("FRED_API_KEY")),
        version=API_VERSION,
    )


@app.get(
    "/api/yield-curve",
    response_model=YieldCurveResponse,
    tags=["rates"],
    responses={502: {"description": "Upstream FRED error"}},
)
def yield_curve(range: str = "5Y") -> YieldCurveResponse:
    cache_key = f"yield:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    all_series = []
    for m in YIELD_MATURITIES:
        obs = fetch_series(m["id"], start, end, frequency="w", aggregation_method="eop")
        all_series.append(obs)

    date_sets = [set(o["date"] for o in s) for s in all_series]
    common_dates = sorted(
        d
        for d in (o["date"] for o in all_series[0])
        if all(d in ds for ds in date_sets)
    )
    maps = [{o["date"]: o["value"] for o in s} for s in all_series]

    result = YieldCurveResponse(
        updated=today_iso(),
        range=range,
        dates=common_dates,
        maturityLabels=[m["label"] for m in YIELD_MATURITIES],
        maturityYears=[m["years"] for m in YIELD_MATURITIES],
        z=[[mp.get(d, float("nan")) for mp in maps] for d in common_dates],
    )
    cache.store(cache_key, result)
    return result


@app.get("/api/macro", response_model=MacroResponse, tags=["macro"])
def macro(range: str = "10Y") -> MacroResponse:
    cache_key = f"macro:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in MACRO_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = yoy(obs) if s.get("yoy") else obs

    result = MacroResponse(updated=today_iso(), series=series_out)
    cache.store(cache_key, result)
    return result


@app.get("/api/cpi-breakdown", response_model=CpiBreakdownResponse, tags=["inflation"])
def cpi_breakdown(range: str = "10Y") -> CpiBreakdownResponse:
    cache_key = f"cpi-breakdown:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in CPI_COMPONENTS:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = yoy(obs)

    result = CpiBreakdownResponse(
        updated=today_iso(),
        components=[SeriesMeta(**c) for c in CPI_COMPONENTS],  # type: ignore[arg-type]
        series=series_out,
    )
    cache.store(cache_key, result)
    return result


@app.get("/api/spreads", response_model=SpreadsResponse, tags=["rates"])
def spreads(range: str = "10Y") -> SpreadsResponse:
    cache_key = f"spreads:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in SPREAD_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = yoy(obs) if s.get("yoy") else obs

    result = SpreadsResponse(updated=today_iso(), series=series_out)
    cache.store(cache_key, result)
    return result


@app.get("/api/grocery", response_model=GroceryResponse, tags=["consumer"])
def grocery(range: str = "10Y") -> GroceryResponse:
    cache_key = f"grocery:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in GROCERY_SERIES:
        try:
            obs = fetch_series(s["id"], start, end)
            series_out[s["id"]] = yoy(obs)
        except ApiError as e:
            if e.status_code == 503:
                raise
            logger.warning("Skipping %s: %s", s["id"], e.message)
            series_out[s["id"]] = []
        except Exception as exc:
            logger.warning("Skipping %s: %s", s["id"], exc)
            series_out[s["id"]] = []

    result = GroceryResponse(
        updated=today_iso(),
        items=[SeriesMeta(**i) for i in GROCERY_SERIES],  # type: ignore[arg-type]
        series=series_out,
    )
    cache.store(cache_key, result)
    return result


@app.get("/api/labor", response_model=LaborResponse, tags=["labor"])
def labor(range: str = "10Y") -> LaborResponse:
    cache_key = f"labor:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in LABOR_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = yoy(obs) if s.get("yoy") else obs

    result = LaborResponse(
        updated=today_iso(),
        series=series_out,
        metadata=[SeriesMeta(**s) for s in LABOR_SERIES],  # type: ignore[arg-type]
    )
    cache.store(cache_key, result)
    return result


@app.get("/api/housing", response_model=HousingResponse, tags=["housing"])
def housing(range: str = "10Y") -> HousingResponse:
    cache_key = f"housing:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in HOUSING_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = yoy(obs) if s.get("yoy") else obs

    result = HousingResponse(
        updated=today_iso(),
        series=series_out,
        metadata=[SeriesMeta(**s) for s in HOUSING_SERIES],  # type: ignore[arg-type]
    )
    cache.store(cache_key, result)
    return result


@app.get(
    "/api/recession-signals",
    response_model=RecessionSignalsResponse,
    tags=["analytics"],
)
def recession_signals(range: str = "MAX") -> RecessionSignalsResponse:
    cache_key = f"recession-signals:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in RECESSION_INPUT_SERIES:
        series_out[s["id"]] = fetch_series(s["id"], start, end)

    sahm_value, sahm_trig = sahm_rule(series_out.get("UNRATE", []))
    inv2y, inv2y_trig = yield_curve_inverted(series_out.get("T10Y2Y", []))
    inv3m, inv3m_trig = yield_curve_inverted(series_out.get("T10Y3M", []))

    signals = [
        RecessionSignal(
            id="sahm",
            label="Sahm Rule",
            value=sahm_value,
            triggered=sahm_trig,
            description="3M-avg unemployment ≥ 0.5pp above 12M low",
        ),
        RecessionSignal(
            id="curve_2y",
            label="10Y–2Y Inversion",
            value=inv2y,
            triggered=inv2y_trig,
            description="10Y Treasury yield below 2Y",
        ),
        RecessionSignal(
            id="curve_3m",
            label="10Y–3M Inversion",
            value=inv3m,
            triggered=inv3m_trig,
            description="10Y Treasury yield below 3M",
        ),
    ]
    composite = recession_composite([s.model_dump() for s in signals])

    result = RecessionSignalsResponse(
        updated=today_iso(),
        composite_score=composite,
        signals=signals,
        series=series_out,
    )
    cache.store(cache_key, result)
    return result


@app.get("/api/metrics", response_model=MetricsResponse, tags=["meta"])
def metrics() -> MetricsResponse:
    snap = observability.snapshot()
    return MetricsResponse(
        requests_total=int(snap.get("requests_total", 0)),
        cache_hits=int(snap.get("cache_hits", 0)),
        cache_misses=int(snap.get("cache_misses", 0)),
        upstream_errors=int(snap.get("upstream_errors", 0)),
        uptime_seconds=float(snap.get("uptime_seconds", 0.0)),
    )


@app.get("/api/inflation", response_model=InflationResponse, tags=["inflation"])
def inflation(range: str = "10Y") -> InflationResponse:
    cache_key = f"inflation:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in INFLATION_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = yoy(obs) if s.get("yoy") else obs

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in INFLATION_SERIES
    ]

    result = InflationResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/credit-conditions", response_model=CreditConditionsResponse, tags=["credit"])
def credit_conditions(range: str = "10Y") -> CreditConditionsResponse:
    cache_key = f"credit-conditions:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in CREDIT_CONDITIONS_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = obs

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in CREDIT_CONDITIONS_SERIES
    ]

    result = CreditConditionsResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/activity", response_model=ActivityResponse, tags=["business"])
def activity(range: str = "10Y") -> ActivityResponse:
    cache_key = f"activity:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in ACTIVITY_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = obs

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in ACTIVITY_SERIES
    ]

    result = ActivityResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/markets", response_model=MarketsResponse, tags=["markets"])
def markets(range: str = "10Y") -> MarketsResponse:
    cache_key = f"markets:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in MARKETS_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = obs

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in MARKETS_SERIES
    ]

    result = MarketsResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/consumer", response_model=ConsumerResponse, tags=["consumer"])
def consumer(range: str = "10Y") -> ConsumerResponse:
    cache_key = f"consumer:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in CONSUMER_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = yoy(obs) if s.get("yoy") else obs

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in CONSUMER_SERIES
    ]

    result = ConsumerResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result
