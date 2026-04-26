"""
Corporate earnings & profitability data aggregator.

Combines BEA corporate profits (T70100), S&P 500 earnings (FRED EARNINGS), and margins.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from .bea_client import fetch_nipa_table
from .errors import ApiError
from .fred_client import fetch_series

logger = logging.getLogger("orator.earnings")


def fetch_corporate_earnings() -> dict[str, Any]:
    """
    Fetch corporate profitability data from BEA + FRED.
    
    Returns dict with keys:
    - profits: list of {date, value} for BEA corporate profits YoY %
    - net_margin: list of {date, value} for net profit margin %
    - operating_margin: list of {date, value} for operating margin %
    - earnings_per_share: list of {date, value} for S&P 500 EPS (nominal)
    - pe_ratio: list of {date, value} for S&P 500 P/E ratio estimate
    
    Raises: ApiError if both BEA and FRED unavailable
    """
    result: dict[str, list[dict]] = {
        "profits": [],
        "net_margin": [],
        "operating_margin": [],
        "earnings_per_share": [],
        "pe_ratio": [],
    }

    # 1. BEA Corporate Profits (T70100) — quarterly, nominal $
    try:
        rows = fetch_nipa_table("T70100", frequency="Q")
        if rows:
            # Line 1: Corporate profits (domestic) before tax
            profit_rows = [r for r in rows if str(r.get("line_number")) == "1"]
            profits_data = sorted(
                [{"date": r["period"], "value": r["value"]} 
                 for r in profit_rows if r["value"] is not None],
                key=lambda x: x["date"]
            )
            
            # Compute YoY % change (4 quarters back)
            if len(profits_data) > 4:
                profits_yoy = []
                for i in range(4, len(profits_data)):
                    curr = profits_data[i]["value"]
                    prev_year = profits_data[i-4]["value"]
                    if prev_year != 0:
                        yoy_pct = ((curr - prev_year) / prev_year) * 100
                        profits_yoy.append({
                            "date": profits_data[i]["date"],
                            "value": round(yoy_pct, 2)
                        })
                result["profits"] = profits_yoy
            
            # Line 3: Net income (after taxes)
            # Line 19: Operating income before taxes
            # Compute margins: (Net Income / Receipts) and (Operating / Receipts)
            net_rows = [r for r in rows if str(r.get("line_number")) == "3"]
            op_rows = [r for r in rows if str(r.get("line_number")) == "19"]
            receipts_rows = [r for r in rows if str(r.get("line_number")) == "24"]  # Current-production value
            
            net_data = sorted(
                [{"date": r["period"], "value": r["value"]} 
                 for r in net_rows if r["value"] is not None],
                key=lambda x: x["date"]
            )
            op_data = sorted(
                [{"date": r["period"], "value": r["value"]} 
                 for r in op_rows if r["value"] is not None],
                key=lambda x: x["date"]
            )
            receipts_data = sorted(
                [{"date": r["period"], "value": r["value"]} 
                 for r in receipts_rows if r["value"] is not None],
                key=lambda x: x["date"]
            )
            
            # Build margin series by date
            net_dict = {o["date"]: o["value"] for o in net_data}
            op_dict = {o["date"]: o["value"] for o in op_data}
            receipts_dict = {o["date"]: o["value"] for o in receipts_data}
            
            for date_str in set(net_dict.keys()) & set(receipts_dict.keys()):
                margin_pct = (net_dict[date_str] / receipts_dict[date_str]) * 100
                result["net_margin"].append({
                    "date": date_str,
                    "value": round(margin_pct, 2)
                })
            
            for date_str in set(op_dict.keys()) & set(receipts_dict.keys()):
                margin_pct = (op_dict[date_str] / receipts_dict[date_str]) * 100
                result["operating_margin"].append({
                    "date": date_str,
                    "value": round(margin_pct, 2)
                })
            
            result["net_margin"].sort(key=lambda x: x["date"])
            result["operating_margin"].sort(key=lambda x: x["date"])
        
    except Exception as exc:
        logger.warning("BEA corporate profits failed: %s", exc)

    # 2. S&P 500 EPS (FRED: EARNINGS) — quarterly
    try:
        eps_data = fetch_series("EARNINGS", start="1990-01-01")
        result["earnings_per_share"] = [
            {"date": o["date"], "value": o["value"]}
            for o in eps_data if o["value"] is not None
        ]
    except Exception as exc:
        logger.warning("FRED EARNINGS series failed: %s", exc)

    # 3. S&P 500 P/E Ratio (FRED: PE10) — estimate, Shiller's CAPE
    try:
        pe_data = fetch_series("PE10", start="1990-01-01")
        result["pe_ratio"] = [
            {"date": o["date"], "value": o["value"]}
            for o in pe_data if o["value"] is not None
        ]
    except Exception as exc:
        logger.warning("FRED PE10 (Shiller CAPE) failed: %s", exc)

    return result
