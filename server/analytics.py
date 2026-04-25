"""Derived analytics — recession signals, composites, and stagflation indicators.

Signal suite:
    Business Cycle   : Leading Index proxy, Real GDP Growth, Manufacturing momentum proxy
  Labor Market     : Sahm Rule, Initial Claims 4W-MA Trend
  Financial        : 10Y-2Y Inversion, 10Y-3M Inversion, Post-Inversion Unwind,
                     High-Yield Credit Spread, Credit Card Delinquency
  Stagflation      : Misery Index, Real Wage Growth
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from .transforms import yoy


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def latest_value(series: list[dict]) -> float | None:
    return series[-1]["value"] if series else None


def _severity(
    value: float | None,
    watch: float,
    trigger: float,
    critical: float,
    higher_is_worse: bool = True,
) -> str:
    """Classify a signal value into a severity tier.

    Parameters
    ----------
    watch, trigger, critical:
        Thresholds from least to most severe (order matters for higher_is_worse logic).
    higher_is_worse:
        True  → larger values are more alarming (e.g. Misery Index).
        False → smaller values are more alarming (e.g. ISM PMI, LEI change).
    """
    if value is None:
        return "normal"
    if higher_is_worse:
        if value >= critical:
            return "critical"
        if value >= trigger:
            return "warning"
        if value >= watch:
            return "watch"
        return "normal"
    else:
        if value <= critical:
            return "critical"
        if value <= trigger:
            return "warning"
        if value <= watch:
            return "watch"
        return "normal"


# ---------------------------------------------------------------------------
# Core signal functions — each returns (latest_value, triggered)
# ---------------------------------------------------------------------------


def sahm_rule(unrate: list[dict]) -> tuple[float | None, bool]:
    """Sahm Rule: triggers when 3-month avg unemployment is >= 0.5pp above
    the trailing 12-month minimum of that 3-month average."""
    if len(unrate) < 15:
        return None, False
    values = [o["value"] for o in unrate]
    rolling3 = [sum(values[i - 2 : i + 1]) / 3 for i in range(2, len(values))]
    if len(rolling3) < 13:
        return None, False
    current = rolling3[-1]
    trailing_min = min(rolling3[-13:-1])
    delta = round(current - trailing_min, 3)
    return delta, delta >= 0.5


def yield_curve_inverted(spread: list[dict]) -> tuple[float | None, bool]:
    """10Y minus shorter yield: negative = inverted."""
    v = latest_value(spread)
    return (None, False) if v is None else (round(v, 3), v < 0)


def inversion_unwind_signal(spread: list[dict]) -> tuple[float | None, bool]:
    """Post-Inversion Unwind: curve has recently recovered from a prolonged inversion
    (≥ 120 daily observations ≈ 6 months).  Historically, recession tends to follow
    6–18 months *after* the curve un-inverts, not during the inversion itself."""
    if len(spread) < 30:
        return None, False
    current = spread[-1]["value"]
    if current <= 0:
        # Still inverted — covered by the regular inversion signal
        return round(current, 3), False
    # Scan back up to 600 obs (~2 years of daily data) for a prior sustained inversion
    lookback = spread[-600:]
    max_consec_inverted = 0
    current_run = 0
    for obs in lookback[:-5]:  # exclude the very recent days
        if obs["value"] < 0:
            current_run += 1
            max_consec_inverted = max(max_consec_inverted, current_run)
        else:
            current_run = 0
    triggered = max_consec_inverted >= 120
    return round(current, 3), triggered


def hy_spread_signal(hy_spread: list[dict]) -> tuple[float | None, bool]:
    """ICE BofA High-Yield OAS > 500 bps = credit market stress."""
    v = latest_value(hy_spread)
    if v is None:
        return None, False
    return round(v, 1), v > 500


def ism_pmi_signal(napm: list[dict]) -> tuple[float | None, bool]:
    """ISM Manufacturing PMI.  Triggers when < 50 for 2+ consecutive months
    (confirmed contraction, not a single-month blip)."""
    if not napm:
        return None, False
    v = napm[-1]["value"]
    triggered = len(napm) >= 2 and v < 50 and napm[-2]["value"] < 50
    return round(v, 1), triggered


def manufacturing_momentum_signal(ipman_yoy: list[dict]) -> tuple[float | None, bool]:
    """Manufacturing momentum proxy via IPMAN YoY.

    Triggers when YoY production growth is below 0 for 3+ consecutive months.
    """
    if not ipman_yoy:
        return None, False
    v = ipman_yoy[-1]["value"]
    recent = ipman_yoy[-3:] if len(ipman_yoy) >= 3 else ipman_yoy
    triggered = len(recent) >= 3 and all(o["value"] < 0 for o in recent)
    return round(v, 2), triggered


def lei_signal(lei: list[dict]) -> tuple[float | None, bool]:
    """Conference Board LEI: 6-month % change below 0 signals cycle downturn."""
    if len(lei) < 7:
        return None, False
    recent = lei[-1]["value"]
    six_ago = lei[-7]["value"]
    if six_ago == 0:
        return None, False
    pct_change = round((recent - six_ago) / abs(six_ago) * 100, 2)
    return pct_change, pct_change < 0


def gdp_negative_signal(gdp: list[dict]) -> tuple[float | None, bool]:
    """Real GDP annualized quarterly growth is negative (technical contraction)."""
    v = latest_value(gdp)
    if v is None:
        return None, False
    return round(v, 2), v < 0


def misery_index_signal(
    unrate: list[dict], cpi_yoy: list[dict]
) -> tuple[float | None, bool]:
    """Misery Index = unemployment rate + CPI YoY.  Triggers at > 10."""
    u = latest_value(unrate)
    c = latest_value(cpi_yoy)
    if u is None or c is None:
        return None, False
    misery = round(u + c, 2)
    return misery, misery > 10


def real_wages_signal(
    wages_yoy: list[dict], cpi_yoy: list[dict]
) -> tuple[float | None, bool]:
    """Real wage growth = nominal wage YoY − CPI YoY.
    Triggers when negative (purchasing-power erosion)."""
    if not wages_yoy or not cpi_yoy:
        return None, False
    w_map = {o["date"]: o["value"] for o in wages_yoy}
    c_map = {o["date"]: o["value"] for o in cpi_yoy}
    common = sorted(set(w_map.keys()) & set(c_map.keys()))
    if not common:
        return None, False
    latest_date = common[-1]
    real_w = round(w_map[latest_date] - c_map[latest_date], 2)
    return real_w, real_w < 0


def credit_delinquency_signal(delin: list[dict]) -> tuple[float | None, bool]:
    """Credit card delinquency rate ≥ 3.0% = consumer financial stress."""
    v = latest_value(delin)
    if v is None:
        return None, False
    return round(v, 2), v >= 3.0


def initial_claims_trend_signal(claims: list[dict]) -> tuple[float | None, bool]:
    """4-week avg initial claims rising > 15% YoY = deteriorating labor demand."""
    v = latest_value(claims)
    if v is None:
        return None, False
    if len(claims) < 52:
        return round(v, 0), False
    year_ago = claims[-52]["value"]
    if year_ago == 0:
        return round(v, 0), False
    pct_change = (v - year_ago) / year_ago * 100
    return round(v, 0), pct_change > 15


# ---------------------------------------------------------------------------
# Computed time-series (for charting)
# ---------------------------------------------------------------------------


def sahm_series(unrate: list[dict]) -> list[dict]:
    """Sahm Rule score as a historical time series."""
    if len(unrate) < 15:
        return []
    dates = [o["date"] for o in unrate]
    values = [o["value"] for o in unrate]
    rolling3 = [sum(values[i - 2 : i + 1]) / 3 for i in range(2, len(values))]
    result = []
    for i, r3 in enumerate(rolling3):
        date_idx = i + 2
        if i < 12:
            continue
        trailing_min = min(rolling3[max(0, i - 12) : i])
        delta = round(r3 - trailing_min, 3)
        result.append({"date": dates[date_idx], "value": delta})
    return result


def misery_series(unrate: list[dict], cpi_yoy: list[dict]) -> list[dict]:
    """Misery index time series = UNRATE + CPI YoY, date-aligned."""
    u_map = {o["date"]: o["value"] for o in unrate}
    c_map = {o["date"]: o["value"] for o in cpi_yoy}
    common = sorted(set(u_map.keys()) & set(c_map.keys()))
    return [{"date": d, "value": round(u_map[d] + c_map[d], 2)} for d in common]


def real_wages_series(wages_yoy: list[dict], cpi_yoy: list[dict]) -> list[dict]:
    """Real wages time series = nominal wage YoY − CPI YoY."""
    w_map = {o["date"]: o["value"] for o in wages_yoy}
    c_map = {o["date"]: o["value"] for o in cpi_yoy}
    common = sorted(set(w_map.keys()) & set(c_map.keys()))
    return [{"date": d, "value": round(w_map[d] - c_map[d], 2)} for d in common]


def lei_6m_change_series(lei: list[dict]) -> list[dict]:
    """Conference Board LEI 6-month % change as a time series."""
    result = []
    for i in range(6, len(lei)):
        recent = lei[i]["value"]
        six_ago = lei[i - 6]["value"]
        if six_ago != 0:
            pct = round((recent - six_ago) / abs(six_ago) * 100, 2)
            result.append({"date": lei[i]["date"], "value": pct})
    return result


# ---------------------------------------------------------------------------
# Composite scoring
# ---------------------------------------------------------------------------


def recession_composite(signals: list[dict[str, Any]]) -> float:
    """Equal-weighted share of triggered signals, 0–1."""
    if not signals:
        return 0.0
    triggered = sum(1 for s in signals if s.get("triggered"))
    return round(triggered / len(signals), 3)


def recession_composite_weighted(signals: list[dict[str, Any]]) -> float:
    """Importance-weighted share of triggered signals, 0–1.
    Each signal's contribution is proportional to its ``weight`` field."""
    if not signals:
        return 0.0
    total_w = sum(s.get("weight", 1.0) for s in signals)
    trig_w = sum(s.get("weight", 1.0) for s in signals if s.get("triggered"))
    return round(trig_w / total_w, 3) if total_w > 0 else 0.0


def _tiered_pressure(
    value: float | None,
    watch: float,
    trigger: float,
    critical: float,
    higher_is_worse: bool,
) -> float:
    """Convert thresholds into a 0-1 pressure score with smooth transitions."""
    if value is None:
        return 0.0

    if higher_is_worse:
        if value < watch:
            return 0.0
        if value < trigger:
            span = max(trigger - watch, 1e-9)
            return round(0.35 * (value - watch) / span, 3)
        if value < critical:
            span = max(critical - trigger, 1e-9)
            return round(0.35 + 0.4 * (value - trigger) / span, 3)
        return 1.0

    if value > watch:
        return 0.0
    if value > trigger:
        span = max(watch - trigger, 1e-9)
        return round(0.35 * (watch - value) / span, 3)
    if value > critical:
        span = max(trigger - critical, 1e-9)
        return round(0.35 + 0.4 * (trigger - value) / span, 3)
    return 1.0


def stagflation_pressure_score(misery: float | None, real_wages: float | None) -> float:
    """Continuous 0-1 stagflation score (not trigger-only).

    This captures mounting pressure in watch zones instead of collapsing to zero
    unless strict trigger thresholds are crossed.
    """
    misery_p = _tiered_pressure(misery, 7.0, 10.0, 14.0, higher_is_worse=True)
    realw_p = _tiered_pressure(real_wages, 0.5, 0.0, -2.0, higher_is_worse=False)
    total_w = 1.0 + 0.75
    return round((misery_p * 1.0 + realw_p * 0.75) / total_w, 3)


def stagflation_pressure_history(
    unrate: list[dict],
    cpi_yoy: list[dict],
    wages_yoy: list[dict],
    years: int = 30,
) -> list[dict]:
    """Build monthly historical stagflation pressure (0-1) over a rolling window."""
    if not unrate:
        return []

    latest_date = date.fromisoformat(unrate[-1]["date"])
    cutoff_date = latest_date - timedelta(days=365 * max(1, years))
    anchor_dates = [
        obs["date"]
        for obs in unrate
        if date.fromisoformat(obs["date"]) >= cutoff_date
    ]

    history: list[dict] = []
    for anchor in anchor_dates:
        un_hist = [o for o in unrate if o["date"] <= anchor]
        cpi_hist = [o for o in cpi_yoy if o["date"] <= anchor]
        wages_hist = [o for o in wages_yoy if o["date"] <= anchor]

        misery_val, _ = misery_index_signal(un_hist, cpi_hist)
        realwage_val, _ = real_wages_signal(wages_hist, cpi_hist)
        pressure = stagflation_pressure_score(misery_val, realwage_val)
        history.append({"date": anchor, "value": pressure})

    return history


def recession_composite_history(
    series_map: dict[str, list[dict]],
    cpi_yoy: list[dict],
    wages_yoy: list[dict],
    years: int = 30,
) -> list[dict]:
    """Build monthly historical weighted recession risk over a rolling window.

    Uses UNRATE monthly timestamps as anchors and evaluates each signal as-of
    that anchor date using only information available at that time.
    """
    unrate = series_map.get("UNRATE", [])
    if not unrate:
        return []

    latest_date = date.fromisoformat(unrate[-1]["date"])
    cutoff_date = latest_date - timedelta(days=365 * max(1, years))
    anchor_dates = [
        obs["date"]
        for obs in unrate
        if date.fromisoformat(obs["date"]) >= cutoff_date
    ]

    if not anchor_dates:
        return []

    history: list[dict] = []
    weights = {
        "lei": 2.0,
        "ism": 1.5,
        "gdp": 0.75,
        "sahm": 1.0,
        "claims": 1.25,
        "unwind": 1.5,
        "inv2y": 0.75,
        "inv3m": 0.75,
        "hy": 1.5,
        "delin": 1.25,
        "misery": 1.0,
        "realw": 0.75,
    }

    for anchor in anchor_dates:
        # Use only observations at or before this anchor to avoid lookahead bias.
        s = {k: [o for o in v if o["date"] <= anchor] for k, v in series_map.items()}
        cpi_hist = [o for o in cpi_yoy if o["date"] <= anchor]
        wages_hist = [o for o in wages_yoy if o["date"] <= anchor]

        _, sahm_trig = sahm_rule(s.get("UNRATE", []))
        _, inv2y_trig = yield_curve_inverted(s.get("T10Y2Y", []))
        _, inv3m_trig = yield_curve_inverted(s.get("T10Y3M", []))
        _, unwind_trig = inversion_unwind_signal(s.get("T10Y2Y", []))
        _, hy_trig = hy_spread_signal(s.get("BAMLH0A0HYM2", []))
        ipman_yoy = yoy(s.get("IPMAN", []))
        _, ism_trig = manufacturing_momentum_signal(ipman_yoy)
        _, lei_trig = lei_signal(s.get("USALOLITONOSTSAM", []))
        _, gdp_trig = gdp_negative_signal(s.get("A191RL1Q225SBEA", []))
        _, misery_trig = misery_index_signal(s.get("UNRATE", []), cpi_hist)
        _, realwage_trig = real_wages_signal(wages_hist, cpi_hist)
        _, delin_trig = credit_delinquency_signal(s.get("DRCCLACBS", []))
        _, claims_trig = initial_claims_trend_signal(s.get("IC4WSA", []))

        score = recession_composite_weighted(
            [
                {"triggered": lei_trig, "weight": weights["lei"]},
                {"triggered": ism_trig, "weight": weights["ism"]},
                {"triggered": gdp_trig, "weight": weights["gdp"]},
                {"triggered": sahm_trig, "weight": weights["sahm"]},
                {"triggered": claims_trig, "weight": weights["claims"]},
                {"triggered": unwind_trig, "weight": weights["unwind"]},
                {"triggered": inv2y_trig, "weight": weights["inv2y"]},
                {"triggered": inv3m_trig, "weight": weights["inv3m"]},
                {"triggered": hy_trig, "weight": weights["hy"]},
                {"triggered": delin_trig, "weight": weights["delin"]},
                {"triggered": misery_trig, "weight": weights["misery"]},
                {"triggered": realwage_trig, "weight": weights["realw"]},
            ]
        )
        history.append({"date": anchor, "value": score})

    return history
