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


class RecessionSignalsResponse(BaseModel):
    updated: str
    composite_score: float = Field(..., description="0-1 weighted recession risk")
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


class ConsumerResponse(BaseModel):
    updated: str
    series: dict[str, list[Observation]]
    metadata: list[SeriesMeta]
