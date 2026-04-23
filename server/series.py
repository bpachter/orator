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

LABOR_SERIES: list[SeriesDef] = [
    {"id": "UNRATE", "label": "Unemployment Rate", "color": "#4a9eff", "unit": "%"},
    {"id": "PAYEMS", "label": "Nonfarm Payrolls (YoY %)", "color": "#22c55e", "unit": "%", "yoy": True},
    {"id": "CIVPART", "label": "Labor Force Participation", "color": "#e8b84b", "unit": "%"},
    {"id": "ICSA", "label": "Initial Jobless Claims", "color": "#ef4444", "unit": "claims"},
    {"id": "AHETPI", "label": "Avg Hourly Earnings (YoY %)", "color": "#a78bfa", "unit": "%", "yoy": True},
    {"id": "JTSJOL", "label": "Job Openings", "color": "#06b6d4", "unit": "thousands"},
]

HOUSING_SERIES: list[SeriesDef] = [
    {"id": "CSUSHPISA", "label": "Case-Shiller Home Price (YoY %)", "color": "#e8b84b", "unit": "%", "yoy": True},
    {"id": "MORTGAGE30US", "label": "30Y Fixed Mortgage", "color": "#ef4444", "unit": "%"},
    {"id": "HOUST", "label": "Housing Starts", "color": "#22c55e", "unit": "thousands"},
    {"id": "PERMIT", "label": "Building Permits", "color": "#06b6d4", "unit": "thousands"},
    {"id": "MSACSR", "label": "Months' Supply of Houses", "color": "#a78bfa", "unit": "months"},
    {"id": "RRVRUSQ156N", "label": "Rental Vacancy Rate", "color": "#f97316", "unit": "%"},
]

# Inputs to the recession-signals composite
RECESSION_INPUT_SERIES: list[SeriesDef] = [
    {"id": "UNRATE", "label": "Unemployment Rate", "color": "#4a9eff"},
    {"id": "T10Y2Y", "label": "10Y–2Y Spread", "color": "#22c55e"},
    {"id": "T10Y3M", "label": "10Y–3M Spread", "color": "#e8b84b"},
    {"id": "USREC", "label": "NBER Recession", "color": "#ef444440"},
]

INFLATION_SERIES: list[SeriesDef] = [
    {"id": "CPIAUCSL", "label": "CPI (All Items, YoY %)", "color": "#ef4444", "unit": "%", "yoy": True},
    {"id": "CPILFESL", "label": "Core CPI (ex Food & Energy, YoY %)", "color": "#f97316", "unit": "%", "yoy": True},
    {"id": "PPIACO", "label": "PPI (All Commodities, YoY %)", "color": "#e8b84b", "unit": "%", "yoy": True},
    {"id": "PCEPI", "label": "PCE (Headline, YoY %)", "color": "#06b6d4", "unit": "%", "yoy": True},
    {"id": "PCEPILFE", "label": "PCE Core (ex Food & Energy, YoY %)", "color": "#8b5cf6", "unit": "%", "yoy": True},
    {"id": "IR", "label": "Import Price Index (YoY %)", "color": "#22c55e", "unit": "%", "yoy": True},
    {"id": "IQ", "label": "Export Price Index (YoY %)", "color": "#a78bfa", "unit": "%", "yoy": True},
]

CREDIT_CONDITIONS_SERIES: list[SeriesDef] = [
    {"id": "BAMLH0A0HYM2", "label": "High-Yield Spread (ICE BofA)", "color": "#ef4444", "unit": "bps"},
    {"id": "PRIME", "label": "Prime Lending Rate", "color": "#4a9eff", "unit": "%"},
    {"id": "TERMCBCCALLNS", "label": "Credit Card Charge-Off Rate", "color": "#f97316", "unit": "%"},
    {"id": "FEDFUNDS", "label": "Fed Funds Rate", "color": "#e8b84b", "unit": "%"},
]

ACTIVITY_SERIES: list[SeriesDef] = [
    {"id": "INDPRO", "label": "Industrial Production Index", "color": "#4a9eff", "unit": "index"},
    {"id": "IPMAN", "label": "Industrial Production: Manufacturing", "color": "#22c55e", "unit": "index"},
    {"id": "TCU", "label": "Capacity Utilization", "color": "#e8b84b", "unit": "%"},
    {"id": "NEWORDER", "label": "New Orders: Nondefense Capital Goods (ex Aircraft)", "color": "#f97316", "unit": "$M"},
    {"id": "DGORDER", "label": "Durable Goods: New Orders", "color": "#a78bfa", "unit": "$M"},
    {"id": "AWHNONAG", "label": "Avg Weekly Hours: Production & Nonsupervisory", "color": "#06b6d4", "unit": "hours"},
]

MARKETS_SERIES: list[SeriesDef] = [
    {"id": "SP500", "label": "S&P 500 Index", "color": "#22c55e", "unit": "index"},
    {"id": "VIXCLS", "label": "VIX Volatility Index", "color": "#ef4444", "unit": "index"},
    {"id": "DCOILWTICO", "label": "Crude Oil (WTI)", "color": "#e8b84b", "unit": "$/bbl"},
    {"id": "GOLDAMGBD228NLBM", "label": "Gold Fixing Price (London AM)", "color": "#f59e0b", "unit": "$/oz"},
    {"id": "DEXUSEU", "label": "USD / EUR Exchange Rate", "color": "#4a9eff", "unit": "USD"},
    {"id": "DTWEXBGS", "label": "Trade-Weighted USD (Broad)", "color": "#a78bfa", "unit": "index"},
]

CONSUMER_SERIES: list[SeriesDef] = [
    {"id": "RSXFS", "label": "Retail Sales (ex Food Services, YoY %)", "color": "#22c55e", "unit": "%", "yoy": True},
    {"id": "UMCSENT", "label": "U. Michigan Consumer Sentiment", "color": "#4a9eff", "unit": "index"},
    {"id": "PSAVERT", "label": "Personal Saving Rate", "color": "#e8b84b", "unit": "%"},
    {"id": "PCE", "label": "Personal Consumption Expenditures (YoY %)", "color": "#f97316", "unit": "%", "yoy": True},
    {"id": "DSPIC96", "label": "Real Disposable Personal Income (YoY %)", "color": "#a78bfa", "unit": "%", "yoy": True},
    {"id": "TOTALSL", "label": "Total Consumer Credit Outstanding (YoY %)", "color": "#06b6d4", "unit": "%", "yoy": True},
]
