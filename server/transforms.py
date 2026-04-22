"""Pure data transforms used by the FRED routes."""

from __future__ import annotations


def yoy(series: list[dict]) -> list[dict]:
    """Year-over-year percent change for monthly series (12-period lag)."""
    out: list[dict] = []
    for i in range(12, len(series)):
        prev = series[i - 12]["value"]
        curr = series[i]["value"]
        if prev != 0:
            out.append(
                {
                    "date": series[i]["date"],
                    "value": round((curr - prev) / abs(prev) * 100, 3),
                }
            )
    return out


def pct_change(series: list[dict], periods: int = 1) -> list[dict]:
    """Percent change over `periods` rows."""
    out: list[dict] = []
    for i in range(periods, len(series)):
        prev = series[i - periods]["value"]
        curr = series[i]["value"]
        if prev != 0:
            out.append(
                {
                    "date": series[i]["date"],
                    "value": round((curr - prev) / abs(prev) * 100, 3),
                }
            )
    return out
