"""Series metadata for Orator — single source of truth used by all routes."""

from __future__ import annotations

from typing import TypedDict


class MaturityDef(TypedDict):
    id: str
    label: str
    years: float


class SeriesDef(TypedDict, total=False):
    id: str
    label: str
    color: str
    yoy: bool
    unit: str


YIELD_MATURITIES: list[MaturityDef] = [
    {"id": "DGS3MO", "label": "3M", "years": 0.25},
    {"id": "DGS6MO", "label": "6M", "years": 0.5},
    {"id": "DGS1", "label": "1Y", "years": 1},
    {"id": "DGS2", "label": "2Y", "years": 2},
    {"id": "DGS3", "label": "3Y", "years": 3},
    {"id": "DGS5", "label": "5Y", "years": 5},
    {"id": "DGS7", "label": "7Y", "years": 7},
    {"id": "DGS10", "label": "10Y", "years": 10},
    {"id": "DGS20", "label": "20Y", "years": 20},
    {"id": "DGS30", "label": "30Y", "years": 30},
]

MACRO_SERIES: list[SeriesDef] = [
    {"id": "FEDFUNDS", "label": "Fed Funds Rate", "color": "#e8b84b"},
    {"id": "CPIAUCSL", "label": "CPI (YoY %)", "color": "#ef4444", "yoy": True},
    {"id": "UNRATE", "label": "Unemployment Rate", "color": "#4a9eff"},
    {"id": "A191RL1Q225SBEA", "label": "Real GDP Growth (YoY)", "color": "#22c55e"},
]

CPI_COMPONENTS: list[SeriesDef] = [
    {"id": "CPIAUCSL", "label": "All Items", "color": "#ef4444"},
    {"id": "CPILFESL", "label": "Core (ex Food & Energy)", "color": "#f97316"},
    {"id": "CPIENGSL", "label": "Energy", "color": "#eab308"},
    {"id": "CPIFABSL", "label": "Food & Beverages", "color": "#22c55e"},
    {"id": "CPIHOSSL", "label": "Shelter", "color": "#06b6d4"},
    {"id": "CPITRNSL", "label": "Transportation", "color": "#8b5cf6"},
    {"id": "CPIMEDSL", "label": "Medical Care", "color": "#ec4899"},
    {"id": "CPIRECSL", "label": "Recreation", "color": "#14b8a6"},
    {"id": "CPIEDUSL", "label": "Education & Comm.", "color": "#f59e0b"},
    {"id": "CPIAPPSL", "label": "Apparel", "color": "#a78bfa"},
    {"id": "CPIOGSSL", "label": "Other Goods & Services", "color": "#64748b"},
]

SPREAD_SERIES: list[SeriesDef] = [
    {"id": "T10Y2Y", "label": "10Y–2Y Spread", "color": "#4a9eff"},
    {"id": "T10Y3M", "label": "10Y–3M Spread", "color": "#22c55e"},
    {"id": "FEDFUNDS", "label": "Fed Funds Rate", "color": "#e8b84b"},
    {"id": "CPILFESL", "label": "Core CPI (YoY %)", "color": "#ef4444", "yoy": True},
    {"id": "USREC", "label": "Recession", "color": "#ef444440"},
]

# BLS Average Price series — actual dollars per unit, YoY % computed server-side
GROCERY_SERIES: list[SeriesDef] = [
    {"id": "APU0000708111", "label": "Eggs", "unit": "/doz", "color": "#f59e0b"},
    {"id": "APU0000703112", "label": "Ground Beef", "unit": "/lb", "color": "#ef4444"},
    {"id": "APU0000706111", "label": "Chicken", "unit": "/lb", "color": "#f97316"},
    {"id": "APU0000709112", "label": "Whole Milk", "unit": "/gal", "color": "#06b6d4"},
    {"id": "APU0000702111", "label": "White Bread", "unit": "/lb", "color": "#e8b84b"},
    {"id": "APU0000704111", "label": "Bacon", "unit": "/lb", "color": "#ec4899"},
    {"id": "APU0000719311", "label": "Orange Juice", "unit": "/16oz", "color": "#fb923c"},
    {"id": "APU0000717311", "label": "Coffee", "unit": "/lb", "color": "#a78bfa"},
    {"id": "APU0000711415", "label": "Bananas", "unit": "/lb", "color": "#eab308"},
    {"id": "APU0000712311", "label": "Tomatoes", "unit": "/lb", "color": "#22c55e"},
]
