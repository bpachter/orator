# Orator — World-Class Econometrics Expansion Plan

Generated: 2026-04-26  
Current data: FRED + BLS (via FRED proxy)  
Goal: Full multi-source macroeconomic + energy + market + fiscal + global platform

---

## API Key Registration Checklist

| Service | Registration URL | Env Var Name | Free Limit | Key Required |
|---|---|---|---|---|
| FRED | Already registered | `FRED_API_KEY` | 120 req/min | ✅ Done |
| BEA | https://apps.bea.gov/API/signup/ | `BEA_API_KEY` | ~100 req/min | ☐ Register |
| Census Bureau | https://api.census.gov/data/key_signup.html | `CENSUS_API_KEY` | Unlimited w/ key | ☐ Register |
| EIA | https://www.eia.gov/opendata/register.php | `EIA_API_KEY` | 5,000/hour | ☐ Register |
| Alpha Vantage | https://www.alphavantage.co/support/#api-key | `ALPHAVANTAGE_API_KEY` | 25/day free | ☐ Register |
| Treasury FiscalData | No registration | — | Unlimited | ✅ None needed |
| FRB Data Releases | No registration | — | Unlimited | ✅ None needed |
| OECD.Stat | No registration | — | Unlimited | ✅ None needed |
| ECB SDW | No registration | — | Unlimited | ✅ None needed |
| World Bank | No registration | — | Unlimited | ✅ None needed |
| BIS | No registration | — | Unlimited | ✅ None needed |
| CBOE | No registration | — | Unlimited | ✅ None needed |
| IMF | No registration | — | Unlimited | ✅ None needed |

### Where to drop keys
**Railway (production):**  
`Railway Dashboard → Project → service → Variables tab`

**Local dev** — add to `server/.env` (git-ignored):
```env
BEA_API_KEY=
CENSUS_API_KEY=
EIA_API_KEY=
ALPHAVANTAGE_API_KEY=
```

---

## Implementation Phases

Each phase builds on the last. Backend work listed first (Python server),
then frontend (React/TypeScript panels). All backend clients follow the
established pattern: thin client module → series defs → schemas → routes
→ frontend hook → panel.

---

### Phase 1 — Infrastructure & Clients (no new UI yet)
*Outcome: all API clients wired in, keys loaded, health endpoint extended*

- [ ] **1.1** Create `server/bea_client.py` — BEA NIPA/regional API client with retry + key guard
- [ ] **1.2** Create `server/census_client.py` — Census MARTS, Trade, Building Permits client
- [ ] **1.3** Create `server/eia_client.py` — EIA API v2 client (petroleum, natural gas, electricity)
- [ ] **1.4** Create `server/treasury_client.py` — FiscalData REST client (no key)
- [ ] **1.5** Create `server/frb_client.py` — FRB H.4.1 / H.8 / Z.1 CSV parser
- [ ] **1.6** Create `server/oecd_client.py` — OECD SDMX-JSON client (CLI, MEI)
- [ ] **1.7** Create `server/ecb_client.py` — ECB SDW SDMX-JSON client
- [ ] **1.8** Create `server/worldbank_client.py` — World Bank API v2 client
- [ ] **1.9** Create `server/bis_client.py` — BIS REST API client
- [ ] **1.10** Create `server/cboe_client.py` — CBOE CSV fetcher (VIX, SKEW, VIX3M)
- [ ] **1.11** Create `server/alphavantage_client.py` — AV daily/weekly client with 25-call budget tracker
- [ ] **1.12** Create `server/imf_client.py` — IMF JSON REST API (WEO, IFS, BOP)
- [ ] **1.13** Extend `server/errors.py` with source-specific error codes for each new client
- [ ] **1.14** Extend `/api/health` to report key presence for all 5 keyed sources
- [ ] **1.15** Add `python-dotenv` load to `server/__init__.py` for local `.env` support

---

### Phase 2 — Energy Dashboard (EIA)
*New panel: `EnergyPanel` — WTI, Brent, nat gas, petroleum inventories, refinery utilization, rig count*

**Backend:**
- [ ] **2.1** Add `ENERGY_SERIES` to `server/series.py` (EIA series IDs: PET.RWTC.W, NG.RNGWHHD.W, etc.)
- [ ] **2.2** Add `EnergyResponse` to `server/schemas.py`
- [ ] **2.3** Add `/api/energy` route to `server/main.py`
  - WTI crude weekly (PET.RWTC.W)
  - Brent crude weekly (PET.RBRTE.W)
  - Henry Hub natural gas weekly (NG.RNGWHHD.W)
  - U.S. crude oil inventories weekly (PET.WCESTUS1.W)
  - U.S. gasoline inventories weekly (PET.WGTSTUS1.W)
  - Refinery utilization rate weekly (PET.WPULEUS3.W)
  - Electricity price — residential monthly (ELEC.PRICE.US-RES.M)
  - Baker Hughes rig count via EIA (fallback: FRED OILPRICE)
- [ ] **2.4** Add energy series to `server/series.py`
- [ ] **2.5** Cache TTL: 6 hours for energy (weekly data)

**Frontend:**
- [ ] **2.6** Add `fetchEnergy` + `EnergyResponse` types to `src/api/fred.ts`
- [ ] **2.7** Add `useEnergy` hook to `src/hooks/useFredQueries.ts`
- [ ] **2.8** Create `src/components/EnergyPanel.tsx`
  - WTI vs. Brent spread chart
  - Natural gas price chart
  - Crude + gasoline inventory bar (vs. 5-year average)
  - Refinery utilization gauge
  - Residential electricity price trend
- [ ] **2.9** Add `EnergyPanel` to `App.tsx` nav (new group: "Energy")
- [ ] **2.10** Register energy series in `src/utils/seriesRegistry.ts`

---

### Phase 3 — Fiscal Monitor (Treasury FiscalData + FRB H.4.1)
*New panel: `FiscalPanel` — federal deficit, debt, Fed balance sheet QE/QT*

**Backend:**
- [ ] **3.1** Add `/api/fiscal` route
  - Monthly Treasury Statement: receipts vs. outlays (FiscalData `mts_table_4`)
  - Federal debt to the penny daily (FiscalData `debt_to_penny`)
  - Debt held by the public vs. intragovernmental (FiscalData `debt_outstanding_dsod`)
  - Fed balance sheet total assets weekly (FRB H.4.1 via FRED `WALCL` — already accessible)
  - Fed securities held: Treasuries (FRED `TREAST`), MBS (FRED `MBST`)
  - Debt ceiling status note (static + manual update trigger)
- [ ] **3.2** Add `FiscalResponse` schema
- [ ] **3.3** FiscalData client returns normalized `{date, value}` observations

**Frontend:**
- [ ] **3.4** Add `useFiscal` hook
- [ ] **3.5** Create `src/components/FiscalPanel.tsx`
  - Stacked area: federal receipts vs. outlays (monthly, trailing 5Y)
  - Line: federal debt as % of GDP (overlay GDP from FRED)
  - Area: Fed balance sheet total assets (QE/QT visual)
  - Composition donut: debt held by public vs. intragovernmental
  - KPI chips: current deficit (trailing 12m), debt/GDP %, Fed assets ($T)
- [ ] **3.6** Add to nav under new "Fiscal & Monetary" group
- [ ] **3.7** Add fiscal series to registry

---

### Phase 4 — Global Macro Divergence (OECD + ECB + World Bank)
*New panel: `GlobalMacroPanel` — G7 policy rate divergence, cross-country inflation, yield differentials*

**Backend:**
- [ ] **4.1** Add `/api/global-macro` route
  - OECD MEI: policy rates for US, EU, UK, JP, CA, AU (IR3TIB01 series)
  - OECD MEI: CPI YoY for G7 countries (CPALTT01 series)
  - OECD MEI: unemployment rate for G7 (LRUNTTTT series)
  - ECB: ECB deposit facility rate (FM.B.U2.EUR.4F.KR.DFR.LEV)
  - ECB: EURIBOR 3M (FM.B.U2.EUR.RT.MM.EURIBOR3MD_.HSTA)
  - ECB: BTP-Bund 10Y spread (FM.M.IT.EUR.BL.BB.IT10YT_RR.YLDA — Italy 10Y minus DE 10Y)
  - World Bank: Debt/GDP for G20 (GC.DOD.TOTL.GD.ZS)
  - World Bank: Current account balance % GDP for G20 (BN.CAB.XOKA.GD.ZS)
  - FRED: 10Y JGB (IRLTLT01JPM156N), Bund (IRLTLT01DEM156N), Gilt (IRLTLT01GBM156N)
- [ ] **4.2** Add `GlobalMacroResponse` schema
- [ ] **4.3** Cache TTL: 12 hours (mostly monthly/quarterly data)

**Frontend:**
- [ ] **4.4** Add `useGlobalMacro` hook
- [ ] **4.5** Create `src/components/GlobalMacroPanel.tsx`
  - Multi-line: G7 central bank policy rates on one chart
  - Multi-line: G7 CPI YoY inflation rates
  - Bar chart: 10Y sovereign yield comparison (US, DE, JP, UK, IT)
  - BTP-Bund spread chart (euro area risk barometer)
  - Table: G20 debt/GDP and current account rankings
- [ ] **4.6** Add to nav under new "Global" group
- [ ] **4.7** Add global series to registry

---

### Phase 5 — FRB Balance Sheet & Bank Lending (FRB H.4.1 / H.8 / G.19)
*Extension of FiscalPanel + new CreditConditionsPanel data*

**Backend:**
- [ ] **5.1** Extend `/api/credit` to include:
  - H.8: Commercial bank total loans and leases (via FRED `LOANS`)
  - H.8: Bank credit — real estate loans (FRED `RREACBW027SBOG`)
  - H.8: C&I loans (FRED `BUSLOANS`)
  - H.8: Consumer loans (FRED `CONSUMER`)
  - G.19: Total consumer credit outstanding (FRED `TOTALSL`)
  - G.19: Revolving credit (FRED `REVOLSL`) vs. nonrevolving (FRED `NONREVSL`)
- [ ] **5.2** These are all already accessible via FRED — just add series IDs to `CREDIT_CONDITIONS_SERIES`

**Frontend:**
- [ ] **5.3** Extend `CreditConditionsPanel.tsx` with:
  - Bank lending segmentation: C&I, real estate, consumer
  - Revolving vs. nonrevolving consumer credit
  - YoY growth rate of total bank credit

---

### Phase 6 — BEA GDP Breakdown (BEA API)
*Extension of MacroPanel + new GDP detail view*

**Backend:**
- [ ] **6.1** Add `/api/gdp-breakdown` route using BEA API
  - Table T10101: GDP by expenditure component (C, I, G, NX) — quarterly
  - Table T70100: Corporate profits by industry
  - Table T20100: Personal income components
  - Table T50100: Saving and investment
- [ ] **6.2** Add `GdpBreakdownResponse` schema
- [ ] **6.3** BEA returns XML/JSON via `?UserID=&method=GetData&DataSetName=NIPA&TableName=&Frequency=Q&Year=`

**Frontend:**
- [ ] **6.4** Add `useGdpBreakdown` hook
- [ ] **6.5** Create `src/components/GdpBreakdownPanel.tsx`
  - Waterfall / stacked bar: GDP components contribution to growth
  - Line: Corporate profits vs. GDP growth
  - Line: Personal saving rate trend
  - KPI chips: latest quarter C/I/G/NX contributions
- [ ] **6.6** Add to nav under "Activity & Markets"
- [ ] **6.7** Add to registry

---

### Phase 7 — Trade & Census Data (Census Bureau)
*New panel: `TradePanel` — goods trade deficit, retail sales, building permits granularity*

**Backend:**
- [ ] **7.1** Add `/api/trade` route
  - FRED `BOPGSTB`: goods trade balance (already via FRED)
  - Census International Trade API: top import/export categories
  - FRED `RETAILSMNSA`: advance retail sales (already FRED)
  - Census MARTS: retail by sector (electronics, food, clothing, auto)
  - FRED `PERMIT`: new privately-owned housing units authorized (already FRED)
  - Census Building Permits: by region (Northeast, Midwest, South, West)
- [ ] **7.2** Most series accessible via FRED — add series IDs
- [ ] **7.3** Census API for import/export breakdown by NAICS

**Frontend:**
- [ ] **7.4** Create `src/components/TradePanel.tsx`
  - Area: goods trade balance trend
  - Grouped bar: retail sales by sector (MoM % change)
  - Stacked bar: housing permits by region
  - Bar: top import vs. export categories
- [ ] **7.5** Add to nav under "Activity & Markets"

---

### Phase 8 — Market Prices (Alpha Vantage)
*Extension of MarketsPanel with real equity + commodity prices*

**Backend:**
- [ ] **8.1** Add `/api/market-prices` route using Alpha Vantage
  - Weekly: SPY, QQQ, IWM, DIA (indices proxy)
  - Weekly: XLF, XLE, XLK, XLV, XLI, XLY, XLP, XLB, XLRE, XLU (sector ETFs)
  - Weekly: GLD (gold), USO (oil), UNG (nat gas), DBA (agriculture)
  - Daily: DXY via `FOREX_DAILY` EUR/USD (invert for dollar index proxy)
  - Budget: 25 calls/day — fetch weekly data, cache 24h
- [ ] **8.2** Add `MarketPricesResponse` schema
- [ ] **8.3** Alpha Vantage rate-limit budget manager: track daily call count in SQLite cache

**Frontend:**
- [ ] **8.4** Add `useMarketPrices` hook
- [ ] **8.5** Extend `MarketsPanel.tsx` with:
  - Sector ETF performance heatmap (1W, 1M, 3M, YTD % change)
  - Commodity price dashboard: gold, oil, nat gas, agriculture
  - Dollar index trend (from EUR/USD inverse)
  - Index comparison chart: SPY vs. QQQ vs. IWM (normalized to 100)

---

### Phase 9 — CBOE Volatility Suite
*Extension of MarketsPanel + RecessionSignalsPanel*

**Backend:**
- [ ] **9.1** Add `/api/volatility` route
  - CBOE VIX history CSV: `https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv`
  - CBOE SKEW CSV: `https://cdn.cboe.com/api/global/us_indices/daily_prices/SKEW_History.csv`
  - FRED `VIXCLS`: VIX daily (backup, already in FRED)
  - FRED `VXVCLS`: VIX 3M (CBOE Volatility of Volatility — via FRED)
  - Compute VIX term structure: spot vs. 3M contango/backwardation
- [ ] **9.2** Add `VolatilityResponse` schema

**Frontend:**
- [ ] **9.3** Add `useVolatility` hook
- [ ] **9.4** Create `src/components/VolatilityPanel.tsx`
  - VIX daily chart with regime bands (< 15 calm, 15–25 normal, > 25 elevated, > 35 crisis)
  - SKEW index chart with interpretation tooltip
  - VIX term structure bar (spot vs. 3M — contango = calm, backwardation = fear)
  - VIX percentile gauge (where is today's VIX vs. historical distribution)
- [ ] **9.5** Add VIX/SKEW as recession signal inputs in `RecessionSignalsPanel`
- [ ] **9.6** Add to nav under "Activity & Markets"

---

### Phase 10 — BIS Global Debt & Credit
*New section in CreditConditionsPanel + new GlobalMacroPanel data*

**Backend:**
- [ ] **10.1** Add `/api/global-credit` route using BIS API
  - BIS: Private non-financial sector credit/GDP by country (C.GDPC)
  - BIS: Cross-border bank claims (LBS — locational banking stats)
  - BIS: Effective exchange rates (EER) — broad and narrow for USD, EUR, JPY
  - BIS: Property prices (Q.CN.N.628.A.M.770.A — select countries)
- [ ] **10.2** Add `GlobalCreditResponse` schema

**Frontend:**
- [ ] **10.3** Add `useGlobalCredit` hook
- [ ] **10.4** Create `src/components/GlobalCreditPanel.tsx`
  - Bar: private debt/GDP ranking (top 20 countries)
  - Line: USD, EUR, JPY real effective exchange rates
  - Line: residential property price index (US, UK, DE, JP, CN)
  - KPI: cross-border bank claims trend
- [ ] **10.5** Add to nav under "Global"

---

### Phase 11 — IMF World Economic Outlook
*Adds forecast/projection layer to GlobalMacroPanel*

**Backend:**
- [ ] **11.1** Add `/api/imf-outlook` route
  - IMF WEO API: GDP growth forecasts (current year + 2 ahead) for G20
  - IMF IFS: Current account balances for G20
  - IMF: FX reserve levels by country
- [ ] **11.2** Cache TTL: 24h (WEO updates twice/year, IFS monthly)
- [ ] **11.3** Add `ImfOutlookResponse` schema

**Frontend:**
- [ ] **11.4** Add `useImfOutlook` hook
- [ ] **11.5** Extend `GlobalMacroPanel.tsx` with:
  - Bar: IMF GDP growth forecasts vs. actuals (G20)
  - Bubble chart: current account balance vs. debt/GDP by country
  - FX reserves bar chart

---

### Phase 12 — OECD Leading Indicators (Real, not FRED proxy)
*Replaces RecessionSignalsPanel OECD CLI proxy with actual OECD data*

**Backend:**
- [ ] **12.1** Add `/api/oecd-cli` route
  - OECD SDMX-JSON: CLI (Composite Leading Indicator) for OECD total, US, EU, JP, CN
  - OECD: Business confidence index (BCI)
  - OECD: Consumer confidence index (CCI)
  - OECD: Industrial production index for major economies
- [ ] **12.2** Add `OecdCliResponse` schema

**Frontend:**
- [ ] **12.3** Add `useOecdCli` hook
- [ ] **12.4** Update `RecessionSignalsPanel.tsx` to use real OECD CLI instead of proxy
- [ ] **12.5** Extend `GlobalMacroPanel.tsx` with OECD BCI + CCI charts

---

### Phase 13 — Registry, Heatmap, Compare, Correlation Updates
*Wire all new series into cross-cutting features*

- [ ] **13.1** Add all new series to `src/utils/seriesRegistry.ts`
- [ ] **13.2** Update `HeatmapPanel.tsx` to include energy, fiscal, global sections
- [ ] **13.3** Update `ComparePanel.tsx` to support cross-source series
- [ ] **13.4** Update `CorrelationPanel.tsx` with new series
- [ ] **13.5** Update `useAllSeries.ts` to aggregate all new hooks
- [ ] **13.6** Update `SeriesSearch` to surface new indicators with source badges

---

### Phase 14 — Navigation & UX
*Reorganize nav for scale*

- [ ] **14.1** Add nav groups to `App.tsx`:
  - "Energy" → EnergyPanel
  - "Fiscal & Monetary" → FiscalPanel
  - "Global" → GlobalMacroPanel, GlobalCreditPanel
  - "Volatility" → VolatilityPanel
  - "Trade & Commerce" → TradePanel, GdpBreakdownPanel
- [ ] **14.2** Add source attribution badges to panels (e.g., "BEA · FRED · Census")
- [ ] **14.3** Update `KeyboardShortcutsDialog` with new Alt+ shortcuts
- [ ] **14.4** Update `CommandBar` to surface new panels and series

---

### Phase 15 — Testing
- [ ] **15.1** Add backend tests for each new client (`server/tests/test_*.py`)
- [ ] **15.2** Mock external APIs in tests (no live calls in CI)
- [ ] **15.3** Add frontend unit tests for new hooks
- [ ] **15.4** Add integration smoke test for each new `/api/*` endpoint

---

## New Panels Summary

| Panel | Source(s) | Nav Group | Phase |
|---|---|---|---|
| `EnergyPanel` | EIA | Energy | 2 |
| `FiscalPanel` | Treasury FiscalData + FRED | Fiscal & Monetary | 3 |
| `GlobalMacroPanel` | OECD + ECB + World Bank + FRED | Global | 4 |
| `GdpBreakdownPanel` | BEA + FRED | Activity & Markets | 6 |
| `TradePanel` | Census + FRED | Trade & Commerce | 7 |
| `VolatilityPanel` | CBOE + FRED | Volatility | 9 |
| `GlobalCreditPanel` | BIS + FRED | Global | 10 |

## Extended Panels Summary

| Panel | What Gets Added | Phase |
|---|---|---|
| `CreditConditionsPanel` | H.8 bank lending breakdown, revolving credit | 5 |
| `MarketsPanel` | Sector ETFs, commodities, DXY, index comparison | 8 |
| `RecessionSignalsPanel` | VIX/SKEW signals, real OECD CLI | 9, 12 |
| `HeatmapPanel` | Energy, fiscal, global macro sections | 13 |
| `ComparePanel` / `CorrelationPanel` | All new series | 13 |

---

## Total New Series (estimated)
- EIA energy: ~8 series
- Treasury/FRB fiscal: ~8 series
- OECD/ECB/World Bank global: ~20 series
- BEA GDP: ~8 series
- Census trade: ~6 series
- Alpha Vantage markets: ~20 series
- CBOE volatility: ~4 series
- BIS global credit: ~6 series
- IMF outlook: ~6 series
- OECD CLI: ~6 series

**Total new series: ~92 additional indicators**  
Combined with existing ~40 FRED series → **~132 total indicators**

---

## Implementation Order Recommendation

Start with Phase 1 (clients) → Phase 2 (EIA/Energy, highest user demand) →
Phase 3 (Fiscal, unique differentiator) → Phase 8 (market prices, broadest appeal) →
Phase 4 (Global, institutional quality) → remaining phases in order.

Each phase is independently deployable — new routes are additive, existing
routes are not modified until Phase 5/12 extensions.
