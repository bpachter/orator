"""Derived analytics — recession signals, composites."""

from __future__ import annotations

from typing import Any


def sahm_rule(unrate: list[dict]) -> tuple[float | None, bool]:
    """Sahm Rule: triggers when 3-month avg unemployment is >= 0.5pp above
    the trailing 12-month minimum of that 3-month average."""
    if len(unrate) < 15:
        return None, False
    values = [o["value"] for o in unrate]
    rolling3 = [
        sum(values[i - 2 : i + 1]) / 3 for i in range(2, len(values))
    ]
    if len(rolling3) < 13:
        return None, False
    current = rolling3[-1]
    trailing_min = min(rolling3[-13:-1])
    delta = round(current - trailing_min, 3)
    return delta, delta >= 0.5


def sahm_series(unrate: list[dict]) -> list[dict]:
    """Return the Sahm Rule score as a time series aligned with unrate dates."""
    if len(unrate) < 15:
        return []
    dates = [o["date"] for o in unrate]
    values = [o["value"] for o in unrate]
    rolling3 = [
        sum(values[i - 2 : i + 1]) / 3 for i in range(2, len(values))
    ]
    # rolling3[i] corresponds to dates[i + 2]
    result = []
    for i, r3 in enumerate(rolling3):
        date_idx = i + 2
        if i < 12:
            continue  # need 13 rolling3 values to compute trailing min
        trailing_min = min(rolling3[max(0, i - 12) : i])
        delta = round(r3 - trailing_min, 3)
        result.append({"date": dates[date_idx], "value": delta})
    return result


def latest_value(series: list[dict]) -> float | None:
    return series[-1]["value"] if series else None


def yield_curve_inverted(spread: list[dict]) -> tuple[float | None, bool]:
    v = latest_value(spread)
    return (None, False) if v is None else (round(v, 3), v < 0)


def recession_composite(signals: list[dict[str, Any]]) -> float:
    """Equal-weighted share of triggered signals, 0..1."""
    if not signals:
        return 0.0
    triggered = sum(1 for s in signals if s.get("triggered"))
    return round(triggered / len(signals), 3)
