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
from .analytics import (
    _severity,
    credit_delinquency_signal,
    gdp_negative_signal,
    hy_spread_signal,
    initial_claims_trend_signal,
    inversion_unwind_signal,
    manufacturing_momentum_signal,
    lei_6m_change_series,
    lei_signal,
    misery_index_signal,
    misery_series,
    real_wages_series,
    real_wages_signal,
    recession_composite_history,
    recession_composite_weighted,
    sahm_rule,
    sahm_series,
    skew_elevated_signal,
    stagflation_pressure_history,
    stagflation_pressure_score,
    vix_elevated_signal,
    yield_curve_inverted,
)
from .alphavantage_client import fetch_weekly_adjusted
from .bea_client import fetch_nipa_table
from .bis_client import fetch_credit_gdp
from .cboe_client import fetch_index as fetch_cboe_index
from .earnings_client import fetch_corporate_earnings
from .errors import ApiError, error_response
from .eia_client import fetch_series as fetch_eia_series
from .fred_client import fetch_series, get_start_for_range, today_iso
from .worldbank_client import fetch_indicator as fetch_wb_indicator
from .schemas import (
    ActivityResponse,
    ConsumerResponse,
    CorporateEarningsResponse,
    CpiBreakdownResponse,
    CreditConditionsResponse,
    EnergyResponse,
    FiscalResponse,
    GlobalMacroResponse,
    GroceryResponse,
    GdpBreakdownResponse,
    GdpComponent,
    GlobalCreditResponse,
    GlobalCreditSeries,
    HealthResponse,
    HousingResponse,
    InflationResponse,
    LaborResponse,
    MacroResponse,
    MarketPricesResponse,
    MarketsResponse,
    MetricsResponse,
    MonetaryConditionsResponse,
    RecessionSignal,
    RecessionSignalsResponse,
    SeriesMeta,
    SpreadsResponse,
    TradeResponse,
    VolatilityResponse,
    YieldCurveResponse,
)
from .series import (
    ACTIVITY_SERIES,
    CONSUMER_SERIES,
    CPI_COMPONENTS,
    CREDIT_CONDITIONS_SERIES,
    EARNINGS_SERIES,
    ENERGY_SERIES,
    FISCAL_SERIES,
    GLOBAL_MACRO_SERIES,
    GROCERY_SERIES,
    HOUSING_SERIES,
    INFLATION_SERIES,
    LABOR_SERIES,
    MACRO_SERIES,
    MONETARY_SERIES,
    BIS_CREDIT_COUNTRIES,
    GDP_COMPONENTS,
    MARKET_PRICES_SERIES,
    MARKETS_SERIES,
    RECESSION_INPUT_SERIES,
    SPREAD_SERIES,
    TRADE_SERIES,
    VOLATILITY_SERIES,
    WB_GDP_COUNTRIES,
    YIELD_MATURITIES,
)
from .transforms import yoy
from .treasury_client import fetch_series as fetch_treasury_series

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
        eia_key=bool(os.environ.get("EIA_API_KEY")),
        alphavantage_key=bool(os.environ.get("ALPHAVANTAGE_API_KEY")),
        bea_key=bool(os.environ.get("BEA_API_KEY")),
        census_key=bool(os.environ.get("CENSUS_API_KEY")),
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
def recession_signals(range: str = "MAX") -> RecessionSignalsResponse:  # noqa: A002
    cache_key = f"recession-signals:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()

    # Fetch every input series; skip gracefully on non-fatal upstream errors
    series_out: dict[str, list[dict]] = {}
    for s in RECESSION_INPUT_SERIES:
        try:
            series_out[s["id"]] = fetch_series(s["id"], start, end)
        except ApiError as exc:
            if exc.status_code == 503:
                raise
            logger.warning("Skipping recession series %s: %s", s["id"], exc.message)
            series_out[s["id"]] = []
        except Exception as exc:
            logger.warning("Skipping recession series %s: %s", s["id"], exc)
            series_out[s["id"]] = []

    # YoY transforms for series delivered as raw levels
    cpi_yoy = yoy(series_out.get("CPIAUCSL", []))
    wages_yoy = yoy(series_out.get("AHETPI", []))
    ipman_yoy = yoy(series_out.get("IPMAN", []))

    # --- Signal analytics -----------------------------------------------
    sahm_val, sahm_trig = sahm_rule(series_out.get("UNRATE", []))
    inv2y_val, inv2y_trig = yield_curve_inverted(series_out.get("T10Y2Y", []))
    inv3m_val, inv3m_trig = yield_curve_inverted(series_out.get("T10Y3M", []))
    unwind_val, unwind_trig = inversion_unwind_signal(series_out.get("T10Y2Y", []))
    hy_val, hy_trig = hy_spread_signal(series_out.get("BAMLH0A0HYM2", []))
    ism_val, ism_trig = manufacturing_momentum_signal(ipman_yoy)
    lei_val, lei_trig = lei_signal(series_out.get("USALOLITONOSTSAM", []))
    gdp_val, gdp_trig = gdp_negative_signal(series_out.get("A191RL1Q225SBEA", []))
    misery_val, misery_trig = misery_index_signal(series_out.get("UNRATE", []), cpi_yoy)
    realwage_val, realwage_trig = real_wages_signal(wages_yoy, cpi_yoy)
    delin_val, delin_trig = credit_delinquency_signal(series_out.get("DRCCLACBS", []))
    claims_val, claims_trig = initial_claims_trend_signal(series_out.get("IC4WSA", []))
    vix_val, vix_trig = vix_elevated_signal(series_out.get("VIXCLS", []))

    # SKEW: try CBOE client first, fall back to empty (FRED doesn't carry SKEW)
    try:
        skew_raw = fetch_cboe_index("SKEW", start=start)
        series_out["SKEW"] = skew_raw
    except Exception as exc:
        logger.warning("CBOE SKEW unavailable for recession signals: %s", exc)
        series_out["SKEW"] = []
    skew_val, skew_trig = skew_elevated_signal(series_out.get("SKEW", []))

    # --- Computed time series for charting ------------------------------
    series_out["SAHM_SCORE"] = sahm_series(series_out.get("UNRATE", []))
    series_out["MISERY_INDEX"] = misery_series(series_out.get("UNRATE", []), cpi_yoy)
    series_out["REAL_WAGES"] = real_wages_series(wages_yoy, cpi_yoy)
    series_out["IPMAN_YOY"] = ipman_yoy
    series_out["CPI_YOY"] = cpi_yoy
    series_out["WAGES_YOY"] = wages_yoy
    series_out["LEI_6M_CHANGE"] = lei_6m_change_series(series_out.get("USALOLITONOSTSAM", []))
    series_out["RECESSION_RISK"] = recession_composite_history(series_out, cpi_yoy, wages_yoy, years=30)
    series_out["STAGFLATION_PRESSURE"] = stagflation_pressure_history(
        series_out.get("UNRATE", []), cpi_yoy, wages_yoy, years=30
    )

    # --- Build signal objects -------------------------------------------
    signals = [
        # Business Cycle
        RecessionSignal(
            id="lei", label="Conference Board LEI",
            value=lei_val, triggered=lei_trig,
            description="Leading index proxy (OECD CLI) 6-month % change < 0 flags cycle downturn",
            category="cycle", weight=2.0,
            severity=_severity(lei_val, 0.5, 0.0, -2.0, higher_is_worse=False),
        ),
        RecessionSignal(
            id="ism_pmi", label="Manufacturing Output Momentum",
            value=ism_val, triggered=ism_trig,
            description="IPMAN YoY below 0 for 3+ consecutive months = manufacturing contraction",
            category="cycle", weight=1.5,
            severity=_severity(ism_val, 2.0, 0.0, -5.0, higher_is_worse=False),
        ),
        RecessionSignal(
            id="gdp", label="Real GDP Growth",
            value=gdp_val, triggered=gdp_trig,
            description="Annualized quarterly real GDP growth is negative",
            category="cycle", weight=0.75,
            severity=_severity(gdp_val, 1.0, 0.0, -2.0, higher_is_worse=False),
        ),
        # Labor Market
        RecessionSignal(
            id="sahm", label="Sahm Rule",
            value=sahm_val, triggered=sahm_trig,
            description="3M-avg unemployment ≥ 0.5pp above trailing 12M low",
            category="labor", weight=1.0,
            severity=_severity(sahm_val, 0.2, 0.5, 0.8, higher_is_worse=True),
        ),
        RecessionSignal(
            id="ic4wma", label="Initial Claims Trend",
            value=claims_val, triggered=claims_trig,
            description="4-week avg initial claims rising > 15% YoY — deteriorating labor demand",
            category="labor", weight=1.25,
            severity="warning" if claims_trig else (
                "watch" if (claims_val is not None and claims_val > 250_000) else "normal"
            ),
        ),
        # Financial Conditions
        RecessionSignal(
            id="inversion_unwind", label="Post-Inversion Unwind",
            value=unwind_val, triggered=unwind_trig,
            description=(
                "Yield curve has exited a prolonged inversion — recession typically follows "
                "6–18 months after un-inversion, not during it"
            ),
            category="financial", weight=1.5,
            severity="warning" if unwind_trig else (
                "watch" if (unwind_val is not None and 0 < unwind_val < 0.5) else "normal"
            ),
        ),
        RecessionSignal(
            id="curve_2y", label="10Y–2Y Inversion",
            value=inv2y_val, triggered=inv2y_trig,
            description="10Y Treasury yield below 2Y — historically precedes recession by 12–24 months",
            category="financial", weight=0.75,
            severity=_severity(inv2y_val, 0.5, 0.0, -0.5, higher_is_worse=False),
        ),
        RecessionSignal(
            id="curve_3m", label="10Y–3M Inversion",
            value=inv3m_val, triggered=inv3m_trig,
            description="10Y Treasury yield below 3M — most reliable near-term inversion signal",
            category="financial", weight=0.75,
            severity=_severity(inv3m_val, 0.5, 0.0, -0.5, higher_is_worse=False),
        ),
        RecessionSignal(
            id="hy_spread", label="High-Yield Credit Spread",
            value=hy_val, triggered=hy_trig,
            description="ICE BofA HY OAS > 500 bps signals credit market stress and tightening conditions",
            category="financial", weight=1.5,
            severity=_severity(hy_val, 350.0, 500.0, 700.0, higher_is_worse=True),
        ),
        RecessionSignal(
            id="cc_delin", label="Credit Card Delinquency",
            value=delin_val, triggered=delin_trig,
            description="Delinquency rate on credit card loans ≥ 3.0% signals consumer financial stress",
            category="financial", weight=1.25,
            severity=_severity(delin_val, 2.5, 3.0, 4.5, higher_is_worse=True),
        ),
        # Volatility & Tail Risk
        RecessionSignal(
            id="vix_elevated", label="VIX Stress Regime",
            value=vix_val, triggered=vix_trig,
            description="CBOE VIX > 30 for 3+ consecutive sessions — systemic fear and risk-off conditions",
            category="financial", weight=1.0,
            severity=_severity(vix_val, 20.0, 30.0, 45.0, higher_is_worse=True),
        ),
        RecessionSignal(
            id="skew_elevated", label="CBOE SKEW Tail Risk",
            value=skew_val, triggered=skew_trig,
            description="SKEW Index > 145 — options market pricing elevated left-tail / crash risk on S&P 500",
            category="financial", weight=0.75,
            severity=_severity(skew_val, 130.0, 145.0, 160.0, higher_is_worse=True),
        ),
        # Stagflation Pressure
        RecessionSignal(
            id="misery", label="Misery Index",
            value=misery_val, triggered=misery_trig,
            description="Unemployment + CPI YoY > 10 — elevated stagflationary pressure",
            category="stagflation", weight=1.0,
            severity=_severity(misery_val, 7.0, 10.0, 14.0, higher_is_worse=True),
        ),
        RecessionSignal(
            id="real_wages", label="Real Wage Growth",
            value=realwage_val, triggered=realwage_trig,
            description="Nominal wage YoY minus CPI YoY — negative = real purchasing-power erosion",
            category="stagflation", weight=0.75,
            severity=_severity(realwage_val, 0.5, 0.0, -2.0, higher_is_worse=False),
        ),
    ]

    all_dump = [s.model_dump() for s in signals]
    composite = recession_composite_weighted(all_dump)
    stagflation = stagflation_pressure_score(misery_val, realwage_val)

    result = RecessionSignalsResponse(
        updated=today_iso(),
        composite_score=composite,
        stagflation_score=stagflation,
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


@app.get("/api/energy", response_model=EnergyResponse, tags=["energy"])
def energy(range: str = "10Y") -> EnergyResponse:
    cache_key = f"energy:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}
    for s in ENERGY_SERIES:
        try:
            series_out[s["id"]] = fetch_eia_series(s["id"], start=start, end=end)
        except ApiError as exc:
            if exc.code in {"EIA_KEY_MISSING", "EIA_AUTH_FAILED"}:
                raise
            logger.warning("Skipping energy series %s: %s", s["id"], exc.message)
            series_out[s["id"]] = []
        except Exception as exc:
            logger.warning("Skipping energy series %s: %s", s["id"], exc)
            series_out[s["id"]] = []

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in ENERGY_SERIES
    ]

    result = EnergyResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/fiscal", response_model=FiscalResponse, tags=["fiscal"])
def fiscal(range: str = "10Y") -> FiscalResponse:
    cache_key = f"fiscal:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()

    series_out: dict[str, list[dict]] = {}
    for s in FISCAL_SERIES:
        obs = fetch_series(s["id"], start, end)
        series_out[s["id"]] = obs

    # FiscalData no-key API enrichments for debt outstanding.
    try:
        debt_public = fetch_treasury_series(
            "accounting/od/debt_to_penny",
            date_field="record_date",
            value_field="debt_held_public_amt",
        )
        debt_total = fetch_treasury_series(
            "accounting/od/debt_to_penny",
            date_field="record_date",
            value_field="tot_pub_debt_out_amt",
        )
        series_out["TREASURY_DEBT_PUBLIC"] = [o for o in debt_public if start <= o["date"] <= end]
        series_out["TREASURY_DEBT_TOTAL"] = [o for o in debt_total if start <= o["date"] <= end]
    except Exception as exc:
        logger.warning("Treasury FiscalData enrichments unavailable: %s", exc)
        series_out.setdefault("TREASURY_DEBT_PUBLIC", [])
        series_out.setdefault("TREASURY_DEBT_TOTAL", [])

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in FISCAL_SERIES
    ]
    metadata.extend([
        SeriesMeta(id="TREASURY_DEBT_PUBLIC", label="Treasury Debt Held by Public", color="#6fa49a", unit="$"),
        SeriesMeta(id="TREASURY_DEBT_TOTAL", label="Treasury Total Public Debt Outstanding", color="#d7b46a", unit="$"),
    ])

    result = FiscalResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/global-macro", response_model=GlobalMacroResponse, tags=["global"])
def global_macro(range: str = "10Y") -> GlobalMacroResponse:
    cache_key = f"global-macro:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    end = today_iso()
    series_out: dict[str, list[dict]] = {}

    # FRED-sourced CLI, policy rates, sovereign yields, FX
    for s in GLOBAL_MACRO_SERIES:
        try:
            obs = fetch_series(s["id"], start, end)
            series_out[s["id"]] = obs
        except ApiError as exc:
            if exc.status_code == 503:
                raise
            logger.warning("Skipping global-macro FRED series %s: %s", s["id"], exc.message)
            series_out[s["id"]] = []
        except Exception as exc:
            logger.warning("Skipping global-macro FRED series %s: %s", s["id"], exc)
            series_out[s["id"]] = []

    # World Bank annual GDP YoY for G7 + China
    for c in WB_GDP_COUNTRIES:
        wb_id = f"WB_GDP_{c['iso']}"
        try:
            obs = fetch_wb_indicator(c["iso"], "NY.GDP.MKTP.KD.ZG")
            series_out[wb_id] = [o for o in obs if o["date"] >= start]
        except Exception as exc:
            logger.warning("World Bank GDP skip %s: %s", c["iso"], exc)
            series_out[wb_id] = []

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in GLOBAL_MACRO_SERIES
    ]
    for c in WB_GDP_COUNTRIES:
        metadata.append(
            SeriesMeta(
                id=f"WB_GDP_{c['iso']}",
                label=c["label"],
                color=c["color"],
                unit="%",
            )
        )

    result = GlobalMacroResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/volatility", response_model=VolatilityResponse, tags=["markets"])
def volatility(range: str = "10Y") -> VolatilityResponse:
    cache_key = f"volatility:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    series_out: dict[str, list[dict]] = {}

    for s in VOLATILITY_SERIES:
        sym = s["id"]
        try:
            series_out[sym] = fetch_cboe_index(sym, start=start)
        except ApiError as exc:
            logger.warning("Skipping CBOE series %s: %s", sym, exc.message)
            series_out[sym] = []
        except Exception as exc:
            logger.warning("Skipping CBOE series %s: %s", sym, exc)
            series_out[sym] = []

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in VOLATILITY_SERIES
    ]

    result = VolatilityResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/market-prices", response_model=MarketPricesResponse, tags=["markets"])
def market_prices(range: str = "5Y") -> MarketPricesResponse:
    cache_key = f"market-prices:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    series_out: dict[str, list[dict]] = {}

    # Cache each symbol independently to reduce Alpha Vantage free-tier burn.
    # Add a small delay between uncached fetches to stay under 5 calls/min.
    for s in MARKET_PRICES_SERIES:
        symbol = s["id"]
        raw_key = f"av-weekly:{symbol}"
        raw = cache.get(raw_key)
        if raw is None:
            try:
                raw = fetch_weekly_adjusted(symbol)
                cache.store(raw_key, raw)
            except ApiError as exc:
                logger.warning("Alpha Vantage skipping %s: %s", symbol, exc.message)
                raw = []
                cache.store(raw_key, raw)  # Cache empty to avoid hammering rate limit
            except Exception as exc:
                logger.warning("Alpha Vantage skipping %s: %s", symbol, exc)
                raw = []
            time.sleep(12)  # ~5 calls/min limit: 60s / 5 = 12s gap between fetches
        series_out[symbol] = [o for o in raw if o["date"] >= start]

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in MARKET_PRICES_SERIES
    ]

    result = MarketPricesResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/gdp-breakdown", response_model=GdpBreakdownResponse, tags=["macro"])
def gdp_breakdown() -> GdpBreakdownResponse:
    """BEA NIPA T10101 — real GDP percent change from prior period by component."""
    cache_key = "gdp-breakdown"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    try:
        rows = fetch_nipa_table("T10101", frequency="Q")
    except Exception as exc:
        logger.error("BEA GDP breakdown error: %s", exc)
        # Fall back to FRED equivalents if BEA is unavailable
        rows = []

    components_out: list[GdpComponent] = []
    if rows:
        for comp in GDP_COMPONENTS:
            line_rows = [r for r in rows if str(r.get("line_number")) == comp["line"]]
            data = [
                {"date": r["period"], "value": r["value"]}
                for r in sorted(line_rows, key=lambda x: x["period"])
                if r["value"] is not None
            ]
            if data:
                components_out.append(
                    GdpComponent(id=f"bea_{comp['line']}", label=comp["label"], color=comp["color"], data=data)
                )

    # If BEA unavailable, fall back to FRED for core components
    if not components_out:
        fred_fallbacks = [c for c in GDP_COMPONENTS if c.get("fred")]
        for comp in fred_fallbacks:
            try:
                raw = fetch_series(comp["fred"], start="1990-01-01")
                data = [{"date": o["date"], "value": o["value"]} for o in raw if o["value"] is not None]
                if data:
                    components_out.append(
                        GdpComponent(id=comp["fred"], label=comp["label"], color=comp["color"], data=data)
                    )
            except Exception as exc:
                logger.warning("FRED fallback %s failed: %s", comp["fred"], exc)

    result = GdpBreakdownResponse(updated=today_iso(), components=components_out)
    cache.store(cache_key, result)
    return result


@app.get("/api/global-credit", response_model=GlobalCreditResponse, tags=["macro"])
def global_credit() -> GlobalCreditResponse:
    """BIS private non-financial sector credit as % of GDP by country.

    Primary: FRED BIS-mirrored quarterly series (CRDQ{ISO}PABIS).
    Fallback: Direct BIS stats API (may be unavailable).
    """
    cache_key = "global-credit"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    # FRED carries BIS credit/GDP data under series IDs: CRDQ{ISO2}PABIS
    FRED_BIS_SERIES = {
        c["iso"]: f"CRDQ{c['iso']}PABIS"
        for c in BIS_CREDIT_COUNTRIES
    }

    series_out: list[GlobalCreditSeries] = []
    for country in BIS_CREDIT_COUNTRIES:
        iso = country["iso"]
        fred_id = FRED_BIS_SERIES[iso]

        # Try FRED first (BIS-mirrored series)
        data: list[dict] = []
        try:
            raw = fetch_series(fred_id, start="1990-01-01", end=today_iso())
            data = [{"date": o["date"], "value": o["value"]} for o in raw]
        except ApiError as exc:
            if exc.status_code == 503:
                raise
            logger.warning("FRED BIS credit skipping %s (%s): %s", iso, fred_id, exc.message)
        except Exception as exc:
            logger.warning("FRED BIS credit skipping %s (%s): %s", iso, fred_id, exc)

        # Fallback to BIS direct API if FRED returned nothing
        if not data:
            try:
                data = fetch_credit_gdp(iso)
            except Exception as exc:
                logger.warning("BIS direct API also unavailable for %s: %s", iso, exc)

        if data:
            series_out.append(
                GlobalCreditSeries(
                    country=iso,
                    label=country["label"],
                    color=country["color"],
                    data=data,
                )
            )

    result = GlobalCreditResponse(updated=today_iso(), series=series_out)
    cache.store(cache_key, result)
    return result


@app.get("/api/trade", response_model=TradeResponse, tags=["macro"])
def trade(range: str = "10Y") -> TradeResponse:
    """FRED trade balance and flows series."""
    cache_key = f"trade:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    series_out: dict[str, list[dict]] = {}

    for s in TRADE_SERIES:
        try:
            series_out[s["id"]] = fetch_series(s["id"], start=start)
        except ApiError as exc:
            logger.warning("Skipping trade series %s: %s", s["id"], exc.message)
            series_out[s["id"]] = []
        except Exception as exc:
            logger.warning("Skipping trade series %s: %s", s["id"], exc)
            series_out[s["id"]] = []

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in TRADE_SERIES
    ]

    result = TradeResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result


@app.get("/api/corporate-earnings", response_model=CorporateEarningsResponse, tags=["markets"])
def corporate_earnings() -> CorporateEarningsResponse:
    """Corporate profitability: BEA profits, margins, S&P 500 EPS, P/E ratio."""
    cache_key = "corporate-earnings"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    try:
        data = fetch_corporate_earnings()
        result = CorporateEarningsResponse(
            updated=today_iso(),
            profits=data.get("profits", []),
            net_margin=data.get("net_margin", []),
            operating_margin=data.get("operating_margin", []),
            earnings_per_share=data.get("earnings_per_share", []),
            pe_ratio=data.get("pe_ratio", []),
        )
    except Exception as exc:
        logger.error("Corporate earnings error: %s", exc)
        result = CorporateEarningsResponse(
            updated=today_iso(),
            profits=[],
            net_margin=[],
            operating_margin=[],
            earnings_per_share=[],
            pe_ratio=[],
        )

    cache.store(cache_key, result)
    return result


@app.get("/api/monetary-conditions", response_model=MonetaryConditionsResponse, tags=["rates"])
def monetary_conditions(range: str = "10Y") -> MonetaryConditionsResponse:
    """Monetary conditions: M1/M2/M3, monetary base, reserves, lending."""
    cache_key = f"monetary-conditions:{range}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    start = get_start_for_range(range)
    series_out: dict[str, list[dict]] = {}

    for s in MONETARY_SERIES:
        try:
            series_out[s["id"]] = fetch_series(s["id"], start=start)
        except ApiError as exc:
            logger.warning("Skipping monetary series %s: %s", s["id"], exc.message)
            series_out[s["id"]] = []
        except Exception as exc:
            logger.warning("Skipping monetary series %s: %s", s["id"], exc)
            series_out[s["id"]] = []

    metadata = [
        SeriesMeta(id=s["id"], label=s["label"], color=s["color"], unit=s.get("unit"))
        for s in MONETARY_SERIES
    ]

    result = MonetaryConditionsResponse(updated=today_iso(), series=series_out, metadata=metadata)
    cache.store(cache_key, result)
    return result

