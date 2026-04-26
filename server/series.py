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
    {"id": "FEDFUNDS", "label": "Fed Funds Rate", "color": "#d7b46a"},
    {"id": "CPIAUCSL", "label": "CPI (YoY %)", "color": "#c98f5a", "yoy": True},
    {"id": "UNRATE", "label": "Unemployment Rate", "color": "#6d91c9"},
    {"id": "A191RL1Q225SBEA", "label": "Real GDP Growth (YoY)", "color": "#6fa49a"},
]

CPI_COMPONENTS: list[SeriesDef] = [
    {"id": "CPIAUCSL", "label": "All Items", "color": "#c98f5a"},
    {"id": "CPILFESL", "label": "Core (ex Food & Energy)", "color": "#b7834c"},
    {"id": "CPIENGSL", "label": "Energy", "color": "#d7b46a"},
    {"id": "CPIFABSL", "label": "Food & Beverages", "color": "#6fa49a"},
    {"id": "CPIHOSSL", "label": "Shelter", "color": "#82aec2"},
    {"id": "CPITRNSL", "label": "Transportation", "color": "#7b89b4"},
    {"id": "CPIMEDSL", "label": "Medical Care", "color": "#a7a9bc"},
    {"id": "CPIRECSL", "label": "Recreation", "color": "#5f8f97"},
    {"id": "CPIEDUSL", "label": "Education & Comm.", "color": "#cfa75a"},
    {"id": "CPIAPPSL", "label": "Apparel", "color": "#b0b9d4"},
    {"id": "CPIOGSSL", "label": "Other Goods & Services", "color": "#74869b"},
]

SPREAD_SERIES: list[SeriesDef] = [
    {"id": "T10Y2Y", "label": "10Y–2Y Spread", "color": "#6d91c9"},
    {"id": "T10Y3M", "label": "10Y–3M Spread", "color": "#6fa49a"},
    {"id": "FEDFUNDS", "label": "Fed Funds Rate", "color": "#d7b46a"},
    {"id": "CPILFESL", "label": "Core CPI (YoY %)", "color": "#c98f5a", "yoy": True},
    {"id": "USREC", "label": "Recession", "color": "#c98f5a40"},
]

# BLS Average Price series — actual dollars per unit, YoY % computed server-side
GROCERY_SERIES: list[SeriesDef] = [
    {"id": "APU0000708111", "label": "Eggs", "unit": "/doz", "color": "#cfa75a"},
    {"id": "APU0000703112", "label": "Ground Beef", "unit": "/lb", "color": "#c98f5a"},
    {"id": "APU0000706111", "label": "Chicken", "unit": "/lb", "color": "#b7834c"},
    {"id": "APU0000709112", "label": "Whole Milk", "unit": "/gal", "color": "#82aec2"},
    {"id": "APU0000702111", "label": "White Bread", "unit": "/lb", "color": "#d7b46a"},
    {"id": "APU0000704111", "label": "Bacon", "unit": "/lb", "color": "#a7a9bc"},
    {"id": "APU0000719311", "label": "Orange Juice", "unit": "/16oz", "color": "#fb923c"},
    {"id": "APU0000717311", "label": "Coffee", "unit": "/lb", "color": "#b0b9d4"},
    {"id": "APU0000711415", "label": "Bananas", "unit": "/lb", "color": "#d7b46a"},
    {"id": "APU0000712311", "label": "Tomatoes", "unit": "/lb", "color": "#6fa49a"},
]

LABOR_SERIES: list[SeriesDef] = [
    {"id": "UNRATE", "label": "Unemployment Rate", "color": "#6d91c9", "unit": "%"},
    {"id": "PAYEMS", "label": "Nonfarm Payrolls (YoY %)", "color": "#6fa49a", "unit": "%", "yoy": True},
    {"id": "CIVPART", "label": "Labor Force Participation", "color": "#d7b46a", "unit": "%"},
    {"id": "ICSA", "label": "Initial Jobless Claims", "color": "#c98f5a", "unit": "claims"},
    {"id": "AHETPI", "label": "Avg Hourly Earnings (YoY %)", "color": "#b0b9d4", "unit": "%", "yoy": True},
    {"id": "JTSJOL", "label": "Job Openings", "color": "#82aec2", "unit": "thousands"},
]

HOUSING_SERIES: list[SeriesDef] = [
    {"id": "CSUSHPISA", "label": "Case-Shiller Home Price (YoY %)", "color": "#d7b46a", "unit": "%", "yoy": True},
    {"id": "MORTGAGE30US", "label": "30Y Fixed Mortgage", "color": "#c98f5a", "unit": "%"},
    {"id": "HOUST", "label": "Housing Starts", "color": "#6fa49a", "unit": "thousands"},
    {"id": "PERMIT", "label": "Building Permits", "color": "#82aec2", "unit": "thousands"},
    {"id": "MSACSR", "label": "Months' Supply of Houses", "color": "#b0b9d4", "unit": "months"},
    {"id": "RRVRUSQ156N", "label": "Rental Vacancy Rate", "color": "#b7834c", "unit": "%"},
    {"id": "HSN1F", "label": "New Home Sales", "color": "#5f8f97", "unit": "thousands"},
]

# Inputs to the recession-signals composite
RECESSION_INPUT_SERIES: list[SeriesDef] = [
    # Yield curve & spreads
    {"id": "UNRATE",         "label": "Unemployment Rate",               "color": "#6d91c9"},
    {"id": "T10Y2Y",         "label": "10Y–2Y Spread",                   "color": "#6fa49a"},
    {"id": "T10Y3M",         "label": "10Y–3M Spread",                   "color": "#d7b46a"},
    {"id": "USREC",          "label": "NBER Recession",                  "color": "#c98f5a40"},
    # Credit / financial conditions
    {"id": "BAMLH0A0HYM2",   "label": "High-Yield Spread (ICE BofA)",    "color": "#c98f5a"},
    {"id": "DRCCLACBS",      "label": "Credit Card Delinquency Rate",    "color": "#b7834c"},
    # Business cycle proxies (legacy series were discontinued)
    {"id": "IPMAN",          "label": "Manufacturing Output (IPMAN)",     "color": "#7b89b4"},
    {"id": "USALOLITONOSTSAM","label": "US Leading Index (OECD CLI)",     "color": "#82aec2"},
    {"id": "A191RL1Q225SBEA","label": "Real GDP Growth (QoQ ann.)",      "color": "#6fa49a"},
    # Labor
    {"id": "IC4WSA",         "label": "Initial Claims 4W MA",            "color": "#a7a9bc"},
    # Inflation / stagflation inputs (raw levels — YoY computed server-side)
    {"id": "CPIAUCSL",       "label": "CPI All Items",                   "color": "#c98f5a"},
    {"id": "AHETPI",         "label": "Avg Hourly Earnings",             "color": "#b0b9d4"},
]

INFLATION_SERIES: list[SeriesDef] = [
    {"id": "CPIAUCSL", "label": "CPI (All Items, YoY %)", "color": "#c98f5a", "unit": "%", "yoy": True},
    {"id": "CPILFESL", "label": "Core CPI (ex Food & Energy, YoY %)", "color": "#b7834c", "unit": "%", "yoy": True},
    {"id": "PPIACO", "label": "PPI (All Commodities, YoY %)", "color": "#d7b46a", "unit": "%", "yoy": True},
    {"id": "PCEPI", "label": "PCE (Headline, YoY %)", "color": "#82aec2", "unit": "%", "yoy": True},
    {"id": "PCEPILFE", "label": "PCE Core (ex Food & Energy, YoY %)", "color": "#7b89b4", "unit": "%", "yoy": True},
    {"id": "IR", "label": "Import Price Index (YoY %)", "color": "#6fa49a", "unit": "%", "yoy": True},
    {"id": "IQ", "label": "Export Price Index (YoY %)", "color": "#b0b9d4", "unit": "%", "yoy": True},
]

CREDIT_CONDITIONS_SERIES: list[SeriesDef] = [
    {"id": "BAMLH0A0HYM2", "label": "High-Yield Spread (ICE BofA)", "color": "#c98f5a", "unit": "bps"},
    {"id": "PRIME", "label": "Prime Lending Rate", "color": "#6d91c9", "unit": "%"},
    {"id": "TERMCBCCALLNS", "label": "Credit Card Charge-Off Rate", "color": "#b7834c", "unit": "%"},
    {"id": "FEDFUNDS", "label": "Fed Funds Rate", "color": "#d7b46a", "unit": "%"},
]

ACTIVITY_SERIES: list[SeriesDef] = [
    {"id": "INDPRO", "label": "Industrial Production Index", "color": "#6d91c9", "unit": "index"},
    {"id": "IPMAN", "label": "Industrial Production: Manufacturing", "color": "#6fa49a", "unit": "index"},
    {"id": "TCU", "label": "Capacity Utilization", "color": "#d7b46a", "unit": "%"},
    {"id": "NEWORDER", "label": "New Orders: Nondefense Capital Goods (ex Aircraft)", "color": "#b7834c", "unit": "$M"},
    {"id": "DGORDER", "label": "Durable Goods: New Orders", "color": "#b0b9d4", "unit": "$M"},
    {"id": "AWHNONAG", "label": "Avg Weekly Hours: Production & Nonsupervisory", "color": "#82aec2", "unit": "hours"},
]

MARKETS_SERIES: list[SeriesDef] = [
    {"id": "SP500", "label": "S&P 500 Index", "color": "#6fa49a", "unit": "index"},
    {"id": "VIXCLS", "label": "VIX Volatility Index", "color": "#c98f5a", "unit": "index"},
    {"id": "DCOILWTICO", "label": "Crude Oil (WTI)", "color": "#d7b46a", "unit": "$/bbl"},
    {"id": "GOLDS", "label": "Gold Spot Price ($/oz)", "color": "#cfa75a", "unit": "$/oz"},
    {"id": "DEXUSEU", "label": "USD / EUR Exchange Rate", "color": "#6d91c9", "unit": "USD"},
    {"id": "DTWEXBGS", "label": "Trade-Weighted USD (Broad)", "color": "#b0b9d4", "unit": "index"},
]

FISCAL_SERIES: list[SeriesDef] = [
    {"id": "FYFSD", "label": "Federal Surplus or Deficit", "color": "#c98f5a", "unit": "$B"},
    {"id": "GFDEBTN", "label": "Gross Federal Debt", "color": "#d7b46a", "unit": "$M"},
    {"id": "FGRECPT", "label": "Federal Receipts", "color": "#6fa49a", "unit": "$B"},
    {"id": "FGEXPND", "label": "Federal Expenditures", "color": "#6d91c9", "unit": "$B"},
    {"id": "WALCL", "label": "Fed Balance Sheet Total Assets", "color": "#b0b9d4", "unit": "$M"},
    {"id": "TREAST", "label": "Fed Treasury Securities Holdings", "color": "#82aec2", "unit": "$M"},
    {"id": "MBST", "label": "Fed MBS Holdings", "color": "#b7834c", "unit": "$M"},
]

MARKET_PRICES_SERIES: list[SeriesDef] = [
    {"id": "SPY", "label": "SPDR S&P 500 ETF", "color": "#6fa49a", "unit": "$"},
    {"id": "QQQ", "label": "Invesco QQQ", "color": "#6d91c9", "unit": "$"},
    {"id": "IWM", "label": "iShares Russell 2000", "color": "#b0b9d4", "unit": "$"},
    {"id": "DIA", "label": "SPDR Dow Jones ETF", "color": "#cfa75a", "unit": "$"},
    {"id": "XLE", "label": "Energy Select Sector SPDR", "color": "#c98f5a", "unit": "$"},
    {"id": "GLD", "label": "SPDR Gold Shares", "color": "#d7b46a", "unit": "$"},
]

ENERGY_SERIES: list[SeriesDef] = [
    {"id": "PET.RWTC.W", "label": "WTI Crude (Spot)", "color": "#d7b46a", "unit": "$/bbl"},
    {"id": "PET.RBRTE.W", "label": "Brent Crude (Spot)", "color": "#c98f5a", "unit": "$/bbl"},
    {"id": "NG.RNGWHHD.W", "label": "Henry Hub Natural Gas", "color": "#6d91c9", "unit": "$/MMBtu"},
    {"id": "PET.WCESTUS1.W", "label": "U.S. Crude Inventories", "color": "#6fa49a", "unit": "thousand barrels"},
    {"id": "PET.WGTSTUS1.W", "label": "U.S. Gasoline Inventories", "color": "#82aec2", "unit": "thousand barrels"},
    {"id": "PET.WPULEUS3.W", "label": "Refinery Utilization", "color": "#b0b9d4", "unit": "%"},
    {"id": "ELEC.PRICE.US-RES.M", "label": "Residential Electricity Price", "color": "#b7834c", "unit": "cents/kWh"},
]

CONSUMER_SERIES: list[SeriesDef] = [
    {"id": "RSXFS", "label": "Retail Sales (ex Food Services, YoY %)", "color": "#6fa49a", "unit": "%", "yoy": True},
    {"id": "UMCSENT", "label": "U. Michigan Consumer Sentiment", "color": "#6d91c9", "unit": "index"},
    {"id": "PSAVERT", "label": "Personal Saving Rate", "color": "#d7b46a", "unit": "%"},
    {"id": "PCE", "label": "Personal Consumption Expenditures (YoY %)", "color": "#b7834c", "unit": "%", "yoy": True},
    {"id": "DSPIC96", "label": "Real Disposable Personal Income (YoY %)", "color": "#b0b9d4", "unit": "%", "yoy": True},
    {"id": "TOTALSL", "label": "Total Consumer Credit Outstanding (YoY %)", "color": "#82aec2", "unit": "%", "yoy": True},
]

# ---------------------------------------------------------------------------
# Phase 4: Global Macro Divergence (FRED-proxied OECD CLI + sovereign data)
# ---------------------------------------------------------------------------

class WbCountryDef(TypedDict):
    iso: str
    label: str
    color: str


GLOBAL_MACRO_SERIES: list[SeriesDef] = [
    # OECD Composite Leading Indicators (via FRED)
    {"id": "USALOLITONOSTSAM", "label": "US CLI (OECD)", "color": "#6d91c9", "unit": "index"},
    {"id": "DEULORSGPNOSTSAM", "label": "Germany CLI (OECD)", "color": "#d7b46a", "unit": "index"},
    {"id": "FRALORSGPNOSTSAM", "label": "France CLI (OECD)", "color": "#6fa49a", "unit": "index"},
    {"id": "JPNLORSGPNOSTSAM", "label": "Japan CLI (OECD)", "color": "#c98f5a", "unit": "index"},
    {"id": "GBRLORSGPNOSTSAM", "label": "UK CLI (OECD)", "color": "#82aec2", "unit": "index"},
    {"id": "CHNLORSGPNOSTSAM", "label": "China CLI (OECD)", "color": "#b7834c", "unit": "index"},
    {"id": "CANLORSGPNOSTSAM", "label": "Canada CLI (OECD)", "color": "#b0b9d4", "unit": "index"},
    # Central bank policy rates
    {"id": "FEDFUNDS", "label": "Fed Funds Rate (US)", "color": "#6d91c9", "unit": "%"},
    {"id": "ECBDFR", "label": "ECB Deposit Rate", "color": "#d7b46a", "unit": "%"},
    # 10Y sovereign yields
    {"id": "DGS10", "label": "US 10Y Treasury", "color": "#6fa49a", "unit": "%"},
    {"id": "IRLTLT01DEM156N", "label": "Germany 10Y Bund", "color": "#c98f5a", "unit": "%"},
    {"id": "IRLTLT01GBM156N", "label": "UK 10Y Gilt", "color": "#82aec2", "unit": "%"},
    {"id": "IRLTLT01JPM156N", "label": "Japan 10Y JGB", "color": "#b7834c", "unit": "%"},
    # Major FX pairs
    {"id": "DEXUSEU", "label": "EUR/USD", "color": "#b0b9d4", "unit": "USD"},
    {"id": "DEXJPUS", "label": "JPY/USD", "color": "#cfa75a", "unit": "JPY"},
    {"id": "DEXUSUK", "label": "GBP/USD", "color": "#7b89b4", "unit": "USD"},
]

# World Bank annual GDP YoY countries
WB_GDP_COUNTRIES: list[WbCountryDef] = [
    {"iso": "US", "label": "US GDP YoY (WB)", "color": "#6d91c9"},
    {"iso": "DE", "label": "Germany GDP YoY (WB)", "color": "#d7b46a"},
    {"iso": "FR", "label": "France GDP YoY (WB)", "color": "#6fa49a"},
    {"iso": "JP", "label": "Japan GDP YoY (WB)", "color": "#c98f5a"},
    {"iso": "GB", "label": "UK GDP YoY (WB)", "color": "#82aec2"},
    {"iso": "CN", "label": "China GDP YoY (WB)", "color": "#b7834c"},
    {"iso": "CA", "label": "Canada GDP YoY (WB)", "color": "#b0b9d4"},
    {"iso": "IT", "label": "Italy GDP YoY (WB)", "color": "#cfa75a"},
]

# ---------------------------------------------------------------------------
# Phase 9: CBOE Volatility Suite
# ---------------------------------------------------------------------------

VOLATILITY_SERIES: list[SeriesDef] = [
    {"id": "VIX", "label": "CBOE VIX (30-day Implied Vol)", "color": "#c98f5a", "unit": "index"},
    {"id": "VIX3M", "label": "CBOE VIX3M (3-month Implied Vol)", "color": "#6d91c9", "unit": "index"},
    {"id": "SKEW", "label": "CBOE SKEW Index (Tail Risk)", "color": "#d7b46a", "unit": "index"},
]

