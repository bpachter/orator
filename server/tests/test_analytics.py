"""Tests for derived analytics."""

from __future__ import annotations

from server.analytics import (
    manufacturing_momentum_signal,
    recession_composite,
    recession_composite_history,
    sahm_rule,
    stagflation_pressure_score,
    yield_curve_inverted,
)


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


def test_recession_composite_history_returns_series() -> None:
    # Build enough monthly points for rolling windows + YoY calculations.
    unrate = [{"date": f"2021-{m:02d}-01", "value": 4.0} for m in range(1, 13)] + [
        {"date": f"2022-{m:02d}-01", "value": 4.2} for m in range(1, 13)
    ]
    cpi_yoy = [{"date": o["date"], "value": 2.0} for o in unrate]
    wages_yoy = [{"date": o["date"], "value": 3.0} for o in unrate]

    series_map = {
        "UNRATE": unrate,
        "T10Y2Y": [{"date": o["date"], "value": 0.5} for o in unrate],
        "T10Y3M": [{"date": o["date"], "value": 0.4} for o in unrate],
        "BAMLH0A0HYM2": [{"date": o["date"], "value": 300.0} for o in unrate],
        "IPMAN": [{"date": o["date"], "value": 100.0 + i} for i, o in enumerate(unrate)],
        "USALOLITONOSTSAM": [{"date": o["date"], "value": 100.0} for o in unrate],
        "A191RL1Q225SBEA": [{"date": o["date"], "value": 1.5} for o in unrate],
        "DRCCLACBS": [{"date": o["date"], "value": 2.0} for o in unrate],
        "IC4WSA": [{"date": o["date"], "value": 200000.0} for o in unrate],
    }

    history = recession_composite_history(series_map, cpi_yoy, wages_yoy, years=5)

    assert len(history) == len(unrate)
    assert history[-1]["date"] == unrate[-1]["date"]
    assert 0.0 <= history[-1]["value"] <= 1.0


def test_manufacturing_momentum_signal_triggers_after_three_negative_months() -> None:
    ipman_yoy = _series([0.5, -0.1, -0.2, -0.3])
    val, triggered = manufacturing_momentum_signal(ipman_yoy)
    assert val == -0.3
    assert triggered is True


def test_stagflation_pressure_not_binary_only() -> None:
    # Watch-zone values should still produce non-zero pressure.
    score = stagflation_pressure_score(misery=7.5, real_wages=0.2)
    assert 0.0 < score < 1.0
