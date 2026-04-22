"""Unit tests for pure transforms."""

from __future__ import annotations

from server.transforms import pct_change, yoy


def _monthly(values: list[float]) -> list[dict]:
    return [
        {"date": f"2024-{(i % 12) + 1:02d}-01", "value": v}
        for i, v in enumerate(values)
    ]


def test_yoy_requires_thirteen_points() -> None:
    assert yoy(_monthly([1.0] * 12)) == []


def test_yoy_computes_year_over_year() -> None:
    series = _monthly([100.0] * 12 + [110.0])
    out = yoy(series)
    assert len(out) == 1
    assert out[0]["value"] == 10.0


def test_pct_change_with_periods() -> None:
    series = _monthly([100.0, 110.0, 121.0])
    out = pct_change(series, periods=1)
    assert [round(x["value"], 1) for x in out] == [10.0, 10.0]
