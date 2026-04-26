# Orator Maximization Round — Implementation Roadmap

**Status:** Ready for development  
**Priority Focus:** Wave 1 (Immediate) + high-impact quick wins  
**Estimated Timeline:** 2-3 weeks for full Wave 1 + 2

---

## 🚀 Wave 1: Foundation Enhancements (This Week)

### **1.1 Data Extension: Corporate Earnings & Profitability**
**Endpoint:** `/api/corporate-earnings` (NEW)  
**Backend Work:**
- Create `server/earnings_client.py` — pull:
  - BEA corporate profits by industry (Table T70100, quarterly)
  - S&P 500 earnings per share (manually updated from FactSet or use Alpha Vantage for proxy)
  - Profit margin calculations (operating margin, net margin)
  - Earnings growth YoY
  - Share buybacks (if available from FRED or manual input)
- Add `CorporateEarningsResponse` schema
- Add `/api/corporate-earnings` route with caching (24h for daily data, 30d for quarterly)

**Frontend Work:**
- Add interfaces to `fred.ts`
- Create `useCorporateEarnings` hook
- Create `CorporateEarningsPanel.tsx` with:
  - Line chart: S&P 500 earnings (estimate + actual) with guidance bands
  - Bar chart: Profit margins by industry (BEA)
  - Earnings yield vs. 10Y Treasury (scatter/dual-axis)
  - P/E ratio trend + historical percentile
  - KPI chips: Current P/E, Earnings yield, Net margin %
- Add to registry + nav ("Markets" group)
- Cache: 24 hours

**Data Requirements:**
- S&P 500 earnings: Use macrotrends.net JSON export or add manual quarterly data to `.env`
- BEA API key: Usually included in `BEA_API_KEY`

---

### **1.2 Data Extension: Monetary Conditions**
**Endpoint:** `/api/monetary-conditions` (NEW)  
**Backend Work:**
- Route pulls from FRED (no new client needed):
  - M1, M2, M3 (FRED: `M1SL`, `M2SL`, `M3SL` — monthly)
  - Monetary base (FRED: `AMBNS` non-adjusted, `AMBSL` adjusted)
  - Bank reserves (FRED: `RESBALNS` — bank reserve balances)
  - Discount window borrowing (FRED: `DPCBCTSL`)
  - Fed reverse repos (FRED: `RRPONTSYD` — outstanding)
  - Lending standards (FRED `LMMNRNJ` — net % tight) via FRED
  - M2 velocity (M2V or calculated as GDP/M2)
  
- Add `MonetaryConditionsResponse` schema with series dict
- Route: GET `/api/monetary-conditions?range=5Y`
- Cache: 24 hours (weekly/monthly updates)

**Frontend Work:**
- Add `fetchMonetaryConditions` + hook
- Create `MonetaryConditionsPanel.tsx`:
  - Stacked area: M1 vs. M2 growth rates
  - Line: Monetary base + Fed reserves
  - Dual-axis: Reverse repos vs. Fed funds rate
  - Line: M2 velocity (GDP/M2)
  - Lending standards index (net % tight over time)
  - KPI chips: Current M2 growth %, monetary base, velocity
  - Color coding: Green (easy money), Red (tight)
- Add to registry + nav ("Rates & Yields" or new "Monetary" group)

**Justification:** Tracks Fed's transmission mechanism; complement to fiscal data

---

### **1.3 UI Redesign: Composite "Story" Dashboards**
**Problem Solved:** Users jumping between 26 panels; no connected narrative

**Implementation:**
1. **Add NEW nav group: "Dashboards"** (separate from detailed panels)
   ```
   Dashboards (composite views):
   - Fed Cycle Monitor
   - Recession Early Warning
   - Inflation Decomposition
   - Growth vs. Stagflation
   - Valuation Dashboard
   ```

2. **Create `src/components/dashboards/` folder** with 5 composite panels:
   - `FedCycleMonitor.tsx` — 6-8 key series synced + interpretation
   - `RecessionEarlyWarning.tsx` — signals + composite probability meter
   - `InflationDecomposition.tsx` — CPI breakdown + wages + expectations
   - `GrowthVsStagflation.tsx` — Real growth + inflation + employment
   - `ValuationDashboard.tsx` — Earnings + rates + multiples + credit

3. **Composite Panel Component Pattern:**
   ```tsx
   // New shared component: src/components/shared/CompositeDashboard.tsx
   interface DashboardSection {
     title: string
     subtitle?: string
     layout: '1col' | '2col' | '3col'
     charts: { title, data, traces, layout }[]
     interpretation?: string // Auto-generated insight
   }
   
   export function CompositeDashboard({ sections }: { sections: DashboardSection[] }) {
     // Renders sections with unified styling + linked ranges
   }
   ```

4. **Add Synchronized Range/Zoom:**
   - Global `selectedRange` state for entire dashboard
   - All sub-charts update when user adjusts range on ANY chart
   - Use compound query hook that fetches all needed endpoints once

5. **Add Interpretation Cards:**
   - After each section, auto-generated insight:
     - "Fed Cycle: Entering RESTRICTIVE phase (rates >5%, real rates +1.5%)"
     - "Recession Risk: MODERATE (65% probability by Q3 2026 based on ensemble)"
     - "Inflation: ELEVATED (5.2% core, above Fed 2% target; wages +3.2% real wage decline)"

---

### **1.4 Mobile Redesign**
**Current Problem:** Full sidebar + 26 panels = overwhelming on mobile

**Implementation:**
1. **Create Mobile Nav Component:**
   ```tsx
   // src/components/shared/MobileNav.tsx
   - Replace sidebar with bottom tab bar (iOS style)
   - OR horizontal scrolling chips at top (Android style)
   - Key items: Macro, Recession, Labor, Inflation, Rates, Energy, Markets
   - Hamburger → swipeable drawer with all 26 panels
   ```

2. **Mobile Dashboard Template:**
   - New simplified nav item: "📱 Mobile Dashboard"
   - Shows only 6-8 KPI chips + sparklines:
     - Unemployment rate + trend
     - Inflation (CPI YoY)
     - Fed Funds Rate
     - S&P 500 + change %
     - 10Y Treasury yield
     - VIX + regime
     - Initial claims
     - HY spread
   - Tap any chip → full panel view

3. **Responsive Chart Adjustments:**
   - On mobile: reduce legend, smaller fonts, condensed margins
   - Touch: long-press for details (no hover tooltip)
   - Pinch-zoom for time axis

---

### **1.5 Documentation & Coverage Audit**
**Deliverables:**
1. **Update EXPANSION_PLAN.md:**
   - Mark Phases 1-10 as COMPLETE
   - Add Wave 1-4 roadmap (from DEEP_DIVE_ANALYSIS.md)

2. **Create DATA_SOURCES_INVENTORY.md:**
   ```markdown
   # Data Sources Inventory
   
   | Client | Integration | Endpoints | Coverage % | Gaps |
   |--------|-------------|-----------|-----------|------|
   | FRED (St. Louis Fed) | ✅ Full | 14 routes | 80% | State/region detail |
   | EIA | ✅ Full | /api/energy | 70% | Futures curves |
   | Treasury Fiscal Data | ✅ Full | /api/fiscal | 40% | Forecasts |
   | World Bank | ✅ Full | /api/global-macro, /api/trade | 50% | Commodity detail |
   | BEA | ✅ Full | /api/gdp-breakdown | 40% | Corporate profits |
   | BIS | ✅ Full | /api/global-credit | 40% | Property prices |
   | Alpha Vantage | ✅ Full | /api/market-prices | 20% | Limited free tier |
   | CBOE | ✅ Full | /api/volatility | 70% | Options flow |
   | **NEW:** Corporate Earnings | 🔨 Building | TBD | — | — |
   | **NOT INTEGRATED:** Census Bureau | ❌ Planned | /api/regional-econ | — | Requires key |
   | **NOT INTEGRATED:** IMF | ❌ Planned | /api/imf-weo | — | No integration yet |
   | **NOT INTEGRATED:** OECD | ❌ Planned | /api/oecd-mei | — | No integration yet |
   ```

3. **Create MAXIMIZATION_PROGRESS.md:**
   - Tracks Wave 1/2/3/4 implementation status
   - Links to PRs / commits for each feature

---

## 🎯 Wave 1 Build Checklist

### **Backend Tasks:**
- [ ] Create `server/earnings_client.py` + S&P 500 earnings lookup
- [ ] Add `/api/corporate-earnings` route to main.py
- [ ] Add `CorporateEarningsResponse` schema
- [ ] Extend series.py with corporate-related series definitions
- [ ] Add monetary series (M1/M2/etc.) to FRED pulls
- [ ] Add `/api/monetary-conditions` route
- [ ] Test both endpoints with > 24h cache

### **Frontend Tasks:**
- [ ] Add types/interfaces for earnings + monetary
- [ ] Create `useCorporateEarnings` + `useMonetaryConditions` hooks
- [ ] Create `CorporateEarningsPanel.tsx` with 4-5 sub-charts
- [ ] Create `MonetaryConditionsPanel.tsx` with 5-6 sub-charts
- [ ] Create `src/components/shared/CompositeDashboard.tsx` (reusable)
- [ ] Create 5 composite dashboards (Dashboards group)
- [ ] Update `types.ts` with new view types
- [ ] Update `filters.tsx` VALID_VIEWS
- [ ] Update CommandBar + nav groups
- [ ] Register all series in registry
- [ ] Add to App.tsx lazy imports + render cases
- [ ] Mobile nav refactor + mobile dashboard

### **Documentation:**
- [ ] Update EXPANSION_PLAN.md
- [ ] Create DATA_SOURCES_INVENTORY.md
- [ ] Create MAXIMIZATION_PROGRESS.md
- [ ] Add comments to new route handlers

### **Testing:**
- [ ] npm run build (no errors)
- [ ] Manual test: each new endpoint returns valid data
- [ ] Manual test: composite dashboards load + sync correctly
- [ ] Mobile: test nav + dashboard on phone/tablet
- [ ] Cache: verify 24h TTL working

---

## 📊 Expected Outcomes After Wave 1

| Metric | Before | After | Improvement |
|--------|--------|-------|------------|
| Active Endpoints | 23 | 25 | +2 new sources |
| Panels Available | 26 | 31 | +5 composite dashboards |
| Data Sources Coverage | 65% | 75% | +10% utilization |
| Mobile Usability | Poor | Good | ⭐⭐⭐⭐ |
| User Story Capability | Weak | Strong | See Fed cycle, recessions, etc. |
| API Caching Efficiency | 70% | 80% | Fewer redundant calls |

---

## 🔄 Wave 2 Preview (Following Weeks)

Once Wave 1 ships and stabilizes:

### **2.1 Regional Economic Dashboard**
- `/api/regional-econ` pulling state-level employment, housing, earnings (via Census/FRED)
- New panel: Heatmap of state unemployment vs. national
- New panel: Regional housing divergence (permits by state)

### **2.2 Commodities Extension**
- Extend `/api/energy` to include metals (copper, gold, silver)
- Add agricultural commodities (wheat, corn, soy)
- Add commodity futures curve (contango/backwardation indicator)

### **2.3 Sentiment & Positioning**
- `/api/sentiment` pulling consumer confidence, small business optimism, Fed positioning
- AAII bull/bear ratio, IPO velocity

### **2.4 Enhanced Global Coverage**
- Expand `/api/global-macro` from 8→25 countries
- Add EM FX basket, EM equity flows

### **2.5 Options & Derivatives Dashboard**
- `/api/options-flow` with put/call ratios, open interest, positioning
- Visualize market structure (who's leveraged, who's hedging)

---

## ⚙️ Technical Notes

**Cache Strategy:**
- Daily data (rates, employment, etc.): 24h TTL
- Weekly data (energy, claims): 6h TTL (stale after 1 week)
- Monthly data (inflation, housing): 72h TTL
- Quarterly data (earnings, GDP): 30d TTL (released monthly anyway)
- Real-time (VIX, Treasury yields): 1h TTL

**Error Handling:**
- Missing BEA key: fall back to FRED T10105 levels for GDP components
- Earnings data missing: show "awaiting Q4 2025 earnings" with prior year
- Monetary client error: show "FRED data unavailable" + retry button

**Performance:**
- Composite dashboards should load <2s (parallel queries via Promise.all)
- SeriesGridPanel still fast (grid layout, lazy chart rendering)
- Mobile: load first 2-3 panels, lazy-load rest on scroll

---

## 📌 Success Criteria

Wave 1 considered successful if:
1. ✅ All 5 composite dashboards load + render correctly
2. ✅ Synchronized zoom works across charts (all update on range change)
3. ✅ Mobile nav + dashboard test OK on iOS Safari + Android Chrome
4. ✅ Build passes: `npm run build` (0 TS errors)
5. ✅ Data fresh: Each endpoint returns non-stale data within 24h cache window
6. ✅ User feedback: Survey shows "easier to understand macro narrative" (target: >70% satisfaction)

---

