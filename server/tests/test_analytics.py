"""Tests for derived analytics."""

from __future__ import annotations

from server.analytics import recession_composite, sahm_rule, yield_curve_inverted


def _series(values: list[float]) -> list[dict]:
    return [{"date": f"2024-01-{i+1:02d}", "value": v} for i, v in enumerate(values)]


def test_sahm_rule_returns_none_for_short_series() -> None:
    assert sahm_rule(_series([3.5] * 5)) == (None, False)


def test_sahm_rule_triggers_on_jump() -> None:
    base = [3.5] * 14
    spike = base + [5.0]
    delta, triggered = sahm_rule(_series(spike))
    assert triggered is True
    assert delta is not None and delta >= 0.5


def test_yield_curve_inverted_negative() -> None:
    val, inverted = yield_curve_inverted(_series([0.5, 0.2, -0.1]))
    assert val == -0.1
    assert inverted is True


def test_recession_composite() -> None:
    signals = [
        {"triggered": True},
        {"triggered": False},
        {"triggered": True},
    ]
    assert recession_composite(signals) == round(2 / 3, 3)


def test_recession_composite_empty() -> None:
    assert recession_composite([]) == 0.0
