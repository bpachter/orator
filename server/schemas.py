"""Pydantic response schemas for Orator API endpoints."""

from __future__ import annotations

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Primitive shapes
# ---------------------------------------------------------------------------


class Observation(BaseModel):
    date: str = Field(..., description="ISO date (YYYY-MM-DD)")
    value: float


class SeriesMeta(BaseModel):
    id: str
    label: str
    color: str
    unit: str | None = None


# ---------------------------------------------------------------------------
# Error envelope
# ---------------------------------------------------------------------------


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error message")


class ErrorResponse(BaseModel):
    error: ErrorDetail


# ---------------------------------------------------------------------------
# Endpoint response models
# ---------------------------------------------------------------------------


class HealthResponse(BaseModel):
    status: str
    fred_key: bool
    eia_key: bool = False
    alphavantage_key: bool = False
    bea_key: bool = False
    census_key: bool = False
    version: str


class YieldCurveResponse(BaseModel):
    updated: str
    range: str
    dates: list[str]
    maturityLabels: list[str]
    maturityYears: list[float]
    z: list[list[float]]


class MacroResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]


class CpiBreakdownResponse(BaseModel):
    updated: str
    components: list[SeriesMeta]
    series: dict[str, list[Observation]]


class SpreadsResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]


class GroceryResponse(BaseModel):
    updated: str
    items: list[SeriesMeta]
    series: dict[str, list[Observation]]


class LaborResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class HousingResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class RecessionSignal(BaseModel):
    id: str
    label: str
    value: float | None
    triggered: bool
    description: str
    category: str = "cycle"  # 'cycle' | 'financial' | 'stagflation' | 'labor'
    weight: float = 1.0
    severity: str = "normal"  # 'normal' | 'watch' | 'warning' | 'critical'


class RecessionSignalsResponse(BaseModel):
    updated: str
    composite_score: float = Field(..., description="0-1 importance-weighted recession risk")
    stagflation_score: float = Field(0.0, description="0-1 weighted stagflation pressure")
    signals: list[RecessionSignal]
    series: dict[str, list[Observation]]


class MetricsResponse(BaseModel):
    requests_total: int
    cache_hits: int
    cache_misses: int
    upstream_errors: int
    uptime_seconds: float


class InflationResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class CreditConditionsResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class ActivityResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class MarketsResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class EnergyResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class FiscalResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class MarketPricesResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class ConsumerResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class GlobalMacroResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class VolatilityResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class GdpComponent(BaseModel):
    id: str
    label: str
    color: str
    data: list[Observation]  # {date: "2024Q3", value: float}


class GdpBreakdownResponse(BaseModel):
    updated: str
    components: list[GdpComponent]


class GlobalCreditSeries(BaseModel):
    country: str
    label: str
    color: str
    data: list[Observation]


class GlobalCreditResponse(BaseModel):
    updated: str
    series: list[GlobalCreditSeries]


class TradeResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


class CorporateEarningsResponse(BaseModel):
    updated: str
    profits: list[Observation]
    net_margin: list[Observation]
    operating_margin: list[Observation]
    earnings_per_share: list[Observation]
    pe_ratio: list[Observation]


class MonetaryConditionsResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]


# ---------------------------------------------------------------------------
# Mithrandir integration — daily macro snapshot
# ---------------------------------------------------------------------------


class TopSignal(BaseModel):
    name: str
    value: str
    state: str  # 'normal' | 'watch' | 'warning' | 'critical'


class MacroSnapshot(BaseModel):
    """Condensed daily macro snapshot for Mithrandir morning brief and external consumers.

    A single-call summary of today's most important macro signals.
    TTL: same as ORATOR_CACHE_TTL (default 4h).
    """

    date: str
    recession_composite: float = 0.0  # 0–1 importance-weighted risk
    recession_label: str = "Low"       # "Low" | "Moderate" | "Elevated" | "High"
    stagflation_score: float = 0.0     # 0–1
    yield_curve_spread_2_10: float = 0.0  # percentage points (negative = inverted)
    yield_curve_inverted: bool = False
    vix: float = 0.0
    vix_regime: str = "normal"          # "calm" | "normal" | "elevated" | "crisis"
    hy_spread: float = 0.0              # basis points (ICE BofA HY OAS)
    unemployment: float = 0.0          # percent
    cpi_yoy: float = 0.0               # percent year-over-year
    fed_funds_rate: float = 0.0        # percent
    top_signals: list[TopSignal] = []  # up to 5 highest-weight signals
    narrative: str = ""                # one-paragraph plain-English summary
