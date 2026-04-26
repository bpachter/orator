"""BEA (Bureau of Economic Analysis) NIPA API client.

Documentation: https://apps.bea.gov/API/docs/index.htm
Table T10101 = Real GDP and Components, Percent Change from Preceding Period, Annual.
Table T10105 = Real GDP and Components, Levels (Billions of Chained $).
"""
from __future__ import annotations

import os
import httpx

BEA_BASE = "https://apps.bea.gov/api/data"
_API_KEY = os.environ.get("BEA_API_KEY", "")


def _get(params: dict) -> dict:
    params["UserID"] = _API_KEY
    params["ResultFormat"] = "JSON"
    resp = httpx.get(BEA_BASE, params=params, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    if "BEAAPI" not in data:
        raise ValueError("Unexpected BEA response structure")
    if "Error" in data["BEAAPI"]:
        err = data["BEAAPI"]["Error"]
        raise ValueError(f"BEA API error: {err.get('APIErrorDescription', err)}")
    return data["BEAAPI"]["Results"]


def fetch_nipa_table(table_name: str, frequency: str = "Q", year: str = "ALL") -> list[dict]:
    """Return a flat list of {line_number, line_desc, period, value} rows from a NIPA table.

    Args:
        table_name: BEA table name, e.g. "T10101" or "T10105".
        frequency: "A" (annual) or "Q" (quarterly).
        year: Comma-separated years or "ALL".
    """
    results = _get(
        {
            "method": "GetData",
            "DataSetName": "NIPA",
            "TableName": table_name,
            "Frequency": frequency,
            "Year": year,
        }
    )
    rows = results.get("Data", [])
    out = []
    for r in rows:
        try:
            raw_val = r.get("DataValue", "").replace(",", "")
            value = float(raw_val) if raw_val not in ("", "(NA)") else None
        except (ValueError, AttributeError):
            value = None
        out.append(
            {
                "line_number": r.get("LineNumber"),
                "line_desc": r.get("LineDescription", "").strip(),
                "period": r.get("TimePeriod"),  # e.g. "2024Q3" or "2024"
                "value": value,
                "series_code": r.get("SeriesCode", ""),
            }
        )
    return out
