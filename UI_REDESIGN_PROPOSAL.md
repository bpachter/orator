# Orator UI/UX Redesign Proposal

**Goal:** Transform from feature-driven (26 isolated panels) to story-driven (5-8 interconnected dashboards)  
**Philosophy:** "Lead users through economic narratives, not data dumps"

---

## 📐 Current Architecture Issues

```
Current:
┌─────────────────────────────────────────┐
│ Sidebar (26 items)  │  Active Panel     │
│ - Macro            │  ┌──────────────┐  │
│ - Inflation        │  │  Grid of 9   │  │
│ - Labor            │  │  Charts      │  │
│ - Housing          │  │  (repeat)    │  │
│ - Credit           │  │              │  │
│ - Fiscal           │  │ SeriesGrid   │  │
│ - (... 20 more)    │  │ Pattern      │  │
│ - Recession        │  │              │  │
│ - Volatility       │  └──────────────┘  │
│ - Analytics        │                    │
│ - Custom           │                    │
└─────────────────────────────────────────┘

Problems:
❌ Context switching fatigue (user must jump between panels)
❌ No causal narrative (why does labor matter with volatility?)
❌ Repetitive layouts (each panel feels the same)
❌ Discovery hard (user doesn't know what they don't know)
❌ Mobile unfriendly (26 items → overwhelming)
```

---

## 🎨 Proposed Architecture

### **New Nav Structure**

```
┌─────────────────────────────────────────────────────────┐
│ ORATOR — Macroeconomic Dashboard                        │
├─────────────────────────────────────────────────────────┤
│ Sidebar (Reorganized)       │ Active Panel              │
│                             │                           │
│ 📊 DASHBOARDS (Story-Driven)│ ┌─────────────────────┐   │
│  • Fed Cycle Monitor        │ │ FED CYCLE MONITOR   │   │
│  • Recession Early Warning  │ │                     │   │
│  • Inflation Deep Dive      │ │ Section 1:          │   │
│  • Growth vs. Stagflation   │ │ - Fed Funds Rate    │   │
│  • Valuation Dashboard      │ │ - 2Y/5Y/10Y yields  │   │
│  • Portfolio Risk Dashboard │ │ - Probabilities     │   │
│                             │ │                     │   │
│ 🔎 DETAILED VIEWS           │ │ Section 2:          │   │
│  • Macro (6 series)         │ │ - Unemployment      │   │
│  • Rates & Yields           │ │ - Inflation         │   │
│  • Inflation & Prices       │ │ - Narrative         │   │
│  • Labor & Wages            │ │                     │   │
│  • Housing                  │ │ [Linked Charts]     │   │
│  • Credit & Financial       │ │ [Synced Ranges]     │   │
│  • Fiscal & Fed             │ └─────────────────────┘   │
│  • Energy & Commodities     │                           │
│  • Global & FX              │                           │
│  • Activity & Markets       │                           │
│  • Earnings & Valuation     │ (New)                     │
│  • Monetary Conditions      │ (New)                     │
│  • Corporate Profitability  │ (New)                     │
│                             │                           │
│ 📈 ANALYTICS (Advanced)      │                           │
│  • Correlation Matrix       │                           │
│  • Heatmap                  │                           │
│  • Series Comparison        │                           │
│  • Economic Calendar        │                           │
│  • Crisis Comparison        │                           │
│  • Custom Dashboards        │                           │
│                             │                           │
│ ⚙️  SETTINGS & EXPORT       │                           │
│  • Save View                │                           │
│  • Export Report            │                           │
│  • Preferences              │                           │
│                             │                           │
└─────────────────────────────────────────────────────────┘

Key Changes:
✅ Dashboards section (new, top priority) — story-driven templates
✅ Detailed Views (existing panels reorganized by theme, not alphabetical)
✅ Analytics (existing analysis tools)
✅ NEW: Mobile indicator: responsive icons for small screens
```

---

## 🎬 Composite Dashboard Designs

### **Dashboard 1: "Fed Cycle Monitor"**

**Purpose:** Answer "Where are we in the Fed cycle?"

**Layout:**
```
┌─────────────────────────────────────────────┐
│ FED CYCLE MONITOR                           │
│ Last Updated: 2026-04-26 10:30 EDT         │
├─────────────────────────────────────────────┤
│                                             │
│ POLICY RATE & EXPECTATIONS                  │
│ ┌──────────────────────────────────────┐    │
│ │ Fed Funds Rate (actual)       │ 5.50%│    │
│ │ - Probability of 25bp cut Q2:  │ 40% │    │
│ │ - Probability of 25bp hike Q2: │ 15% │    │
│ │ - Expected rate by EOY 2026:   │4.75%│    │
│ │                                     │    │
│ │ [TIMELINE CHART: Rate path]         │    │
│ │ Current •━━━━• Expected ╌╌╌ Futures │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ REAL YIELDS & CURVE                         │
│ ┌──────────────┐  ┌──────────────┐         │
│ │ Yields       │  │ Real Yields  │         │
│ │ 2Y: 4.2%     │  │ 10Y: +1.8%   │         │
│ │ 5Y: 4.1%     │  │ 2Y: +2.1%    │         │
│ │ 10Y: 4.0%    │  │ (below Fed)  │         │
│ │ 30Y: 4.5%    │  │              │         │
│ │ Curve: Normal│  │ Stance: Tight│         │
│ └──────────────┘  └──────────────┘         │
│                                             │
│ TRANSMISSION: Financial Conditions          │
│ ┌─────────────────────────────────────┐    │
│ │ HY Spread:    445 bps (Normal)       │    │
│ │ Bank Lending: +0.8% YoY (Slowing)   │    │
│ │ Credit Growth: +2.1% (Below avg)    │    │
│ │ Equity Implied Vol: 18% (Calm)      │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ INTERPRETATION CARD                         │
│ ┌─────────────────────────────────────┐    │
│ │ 🟡 PHASE: LATE CYCLE / RESTRICTIVE  │    │
│ │                                     │    │
│ │ • Fed Funds at 5.5% — HIGH levels  │    │
│ │   relative to neutral (~2.5%)      │    │
│ │                                     │    │
│ │ • Real rates +1.8% — restrictive   │    │
│ │   (credit slowing, growth cooling) │    │
│ │                                     │    │
│ │ • Market pricing 50-75bp cuts in   │    │
│ │   H2 2026 (Fed dot plot shows 75bp)│    │
│ │                                     │    │
│ │ • Transmission lag: 6-12 months;   │    │
│ │   full impact on growth likely Q3+ │    │
│ │                                     │    │
│ │ 👉 Action: Watch for growth        │    │
│ │    misses in next 2 quarters       │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ [🔗 Related: Recession Signals  | 📈 Rates]│
└─────────────────────────────────────────────┘
```

**Data Sources Linked:**
- Fed Funds, 2Y/5Y/10Y Treasury (FRED)
- Fed Futures (CME FedWatch probabilities)
- HY Spread, Bank Lending (FRED)
- VIX (CBOE)

---

### **Dashboard 2: "Recession Early Warning"**

**Purpose:** Assess recession probability + timing

**Layout:**
```
┌─────────────────────────────────────────────┐
│ RECESSION EARLY WARNING                     │
│ Last Updated: 2026-04-26 10:15 EDT         │
├─────────────────────────────────────────────┤
│                                             │
│ RECESSION PROBABILITY (Ensemble Model)      │
│ ┌─────────────────────────────────────┐    │
│ │          ╔════════════════╗         │    │
│ │ Next 12M │    65% RISK    │ ⚠️ HIGH │    │
│ │          ╚════════════════╝         │    │
│ │ (95% CI: 52-78%)                    │    │
│ │                                     │    │
│ │ [GAUGE CHART: 0-100% scale, 65 highlighted]
│ │                                     │    │
│ │ Timeline:                           │    │
│ │ Q2 2026: 40% | Q3: 55% | Q4: 65%  │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ KEY SIGNALS                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌─────┐│
│ │ Yield Curve  │ │ Labor Softening
│ │              │ │              │ │ Credit
│ │ Status: ✅  │ │ Status: 🟡  │ │     
│ │ 10Y-2Y: -20bp│ │ Unemp: 4.2% │ │ 🟡  │
│ │ Signal: ⚠️   │ │ Claims: 220K│ │ │    
│ │ Weight: 1.25 │ │ Weight: 0.75│ │ │    
│ └──────────────┘ └──────────────┘ │    │
│ │ HY Spread              │       
│ │ 445 bps (Normal)      │       
│ │ Weight: 1.0    │       
│ │ Status: 🟢     │       
│ └──────────────────────┘       
│                                             │
│ LEADING vs. COINCIDENT INDICATORS           │
│ ┌─────────────────────────────────────┐    │
│ │ Leading Index (6M change): -1.2%   │    │
│ │ ├─ ISM PMI: 48.0 (contraction)  ✅ │    │
│ │ ├─ YC Inversion: UNWOUND        🟡 │    │
│ │ └─ Spreads: Normalizing         🟢 │    │
│ │                                     │    │
│ │ Coincident Index:      +0.8% (slow) │    │
│ │ ├─ IP: -0.2% MoM       🟡        │    │
│ │ ├─ Employment: +120K    🟢        │    │
│ │ └─ Sales: Slowing      🟡        │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ TIMELINE: When?                             │
│ ┌─────────────────────────────────────┐    │
│ │ Q2 2026  ── 40% ──┐                │    │
│ │ Q3 2026  ── 55% ──┼──> Peak risk   │    │
│ │ Q4 2026  ── 65% ──┘                │    │
│ │ Q1 2027  ── 60% (recovery expected)│    │
│ │                                     │    │
│ │ 📊 Base Case: Slowdown Q3, mild    │    │
│ │    recession Q4 2026 - Q1 2027     │    │
│ │ 💰 Bull Case: Soft landing (25%)   │    │
│ │ 🐻 Bear Case: Severe downturn (10%)│    │
│ └─────────────────────────────────────┘    │
│                                             │
│ [🔗 Credit Conditions | 📊 Labor Data |💹 Markets]
└─────────────────────────────────────────────┘
```

---

### **Dashboard 3: "Inflation Deep Dive"**

**Purpose:** Understand inflation drivers + path forward

**Layout:**
```
┌─────────────────────────────────────────────┐
│ INFLATION DECOMPOSITION                     │
│ Last Updated: 2026-04-26 10:20 EDT         │
├─────────────────────────────────────────────┤
│                                             │
│ HEADLINE vs. CORE                           │
│ ┌──────────────────────────────────────┐    │
│ │ CPI Headline (YoY):      3.2% ↑0.1pp │    │
│ │ CPI Core (YoY):          3.8% ↓0.2pp │    │
│ │ PCE Headline:            2.8%        │    │
│ │ PCE Core:                3.1%        │    │
│ │ Fed Target:              2.0%        │    │
│ │                                       │    │
│ │ [DUAL LINE CHART]                    │    │
│ │ Headline (higher) vs. Core (lower)   │    │
│ │ Both above Fed target                │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ INFLATION BY COMPONENT (Latest 3M Annualized)
│ ┌──────────────────────────────────────┐    │
│ │ Shelter:      4.2%  ████████████ (40% of│
│ │ Energy:       2.1%  ██████       (8%)   │
│ │ Goods:        2.4%  ████████     (20%)  │
│ │ Services:     3.9%  ███████████  (32%)  │
│ │ Vehicles:     1.8%  ██████       (5%)   │
│ │ Food:         2.0%  ██████       (8%)   │
│ │ Apparel:     -0.5%  (declining)         │
│ │ Medical:      3.2%  ██████████          │
│ └──────────────────────────────────────┘    │
│                                             │
│ COST-PUSH vs. DEMAND-PULL                   │
│ ┌──────────────────────────────────────┐    │
│ │ Wage Growth (YoY):       3.2%  🟡    │    │
│ │ Productivity Growth:     0.5%  🔴    │    │
│ │ => Unit Labor Cost Growth: 2.7% 🟡   │    │
│ │                                       │    │
│ │ Rent of Primary Residence:           │    │
│ │ - Shelter: 4.2% (sticky, slow to ⬇)│    │
│ │ - OER: 4.1% (Owner's equiv rent)    │    │
│ │                                       │    │
│ │ Import Prices (YoY): +1.2% (neutral)│    │
│ │ Commodity Prices:                    │    │
│ │ - Oil: $75/bbl (stable)             │    │
│ │ - Copper: $4.10/lb (stable)         │    │
│ │                                       │    │
│ │ Output Gap: Slightly negative (-0.3%)│    │
│ │ => No demand-pull pressure           │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ EXPECTATIONS & FORWARD INDICATORS            │
│ ┌──────────────────────────────────────┐    │
│ │ 5Y Breakeven Inflation Rate: 2.35%  │    │
│ │ 5Y5Y Forward Inflation: 2.30%       │    │
│ │ => Fed credibility: STRONG          │    │
│ │                                       │    │
│ │ Survey of Prof. Forecasters:         │    │
│ │ 2026 CPI: 3.1%  | 2027: 2.4% | 2028: 2.2│
│ │                                       │    │
│ │ University of Michigan Survey:       │    │
│ │ 1Y Expected Inflation: 3.0%         │    │
│ │ 5-10Y Expected: 2.2% (anchored)     │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ INTERPRETATION                              │
│ ┌──────────────────────────────────────┐    │
│ │ 📊 Status: DISINFLATION IN PROGRESS │    │
│ │                                       │    │
│ │ • Core falling from peak (4.1% → 3.8)    │
│ │ • Shelter sticky but moderating      │    │
│ │ • Goods/services normalized          │    │
│ │ • Energy neutral                     │    │
│ │ • Wage growth slowing (labor market) │    │
│ │                                       │    │
│ │ ⏱️ Pace: Gradual (reaching 2% by Q3-Q4)
│ │                                       │    │
│ │ 🎯 Fed will likely cut in H2 2026,  │    │
│ │    but not aggressively (75-100bp    │    │
│ │    this year, not 200bp)             │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ [🔗 Labor Market | 📈 Wages | 💰 Rates]│
└─────────────────────────────────────────────┘
```

---

### **Dashboard 4: "Growth vs. Stagflation"**

**Purpose:** Track whether economy is in healthy growth, stagnation, or stagflation

**Layout:**
```
┌─────────────────────────────────────────────┐
│ GROWTH vs. STAGFLATION                      │
│ Last Updated: 2026-04-26 10:25 EDT         │
├─────────────────────────────────────────────┤
│                                             │
│ CURRENT QUADRANT (Scatter)                  │
│ ┌──────────────────────────────────────┐    │
│ │             LOW INFLATION             │    │
│ │     ┌────────────────────────────┐   │    │
│ │     │ GOLDILOCKS (ideal)         │   │    │
│ │ H   │                            │   │    │
│ │ I   │        YOU ARE HERE ✓      │   │    │
│ │ G   │        (0.5%, 3.2%)        │   │    │
│ │ H   │                            │   │    │
│ │ G   ├────────────────────────────┤   │    │
│ │ R   │ STAGFLATION (bad)          │   │    │
│ │ O   │ (-1%, 4%)                  │   │    │
│ │ W   ├────────────────────────────┤   │    │
│ │ T   │                            │   │    │
│ │     │ WEAK + DEFLATION (risky)   │   │    │
│ │     │ (-2%, 1%)                  │   │    │
│ │     └────────────────────────────┘   │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ KEY METRICS                                 │
│ ┌──────────────────────────────────────┐    │
│ │ Real GDP Growth (YoY):  +0.5%  🟡   │    │
│ │ Quarterly (QoQ ann.):   +1.8%  🟡   │    │
│ │ => Slowing from +2.3% trend         │    │
│ │                                      │    │
│ │ Unemployment Rate:      4.2%  🟡    │    │
│ │ Labor Force Growth:     +0.8% (normal)   │
│ │ Wage Growth (Nom):      +3.2% 🟡    │    │
│ │ Wage Growth (Real):     -0.6% 🔴    │    │
│ │ => Real wages declining; workers squeezed
│ │                                      │    │
│ │ Core CPI (YoY):         +3.8% 🟡    │    │
│ │ Misery Index (U+CPI):   8.0%  🟡    │    │
│ │ => Above comfortable levels          │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ LEADING VS. LAGGING INDICATORS              │
│ ┌──────────────────────────────────────┐    │
│ │ LEADING (next 6-12 months):          │    │
│ │ • ISM PMI: 48.0 (contraction) → ⬇    │    │
│ │ • Jobless claims: 220K (rising) → ⬇ │    │
│ │ • New orders: declining → ⬇         │    │
│ │ • Consumer confidence: -8pp → ⬇     │    │
│ │ • Stock prices: -5% (YTD) → ⬇      │    │
│ │                                      │    │
│ │ LAGGING (current momentum):           │    │
│ │ • Employment: +120K/m (solid) → ➡️   │    │
│ │ • Retail sales: +0.1% (flat) → ➡️   │    │
│ │ • Industrial production: -0.2% → ⬇   │    │
│ │ • Corporate profits: +2% YoY → ➡️    │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ SCENARIO ANALYSIS                           │
│ ┌──────────────────────────────────────┐    │
│ │ BASE CASE (60% prob):                │    │
│ │ Soft landing; mild slowdown Q3,      │    │
│ │ recovery Q4 + 2027                   │    │
│ │ Growth: 0-1% / Inflation: 2.5-3%    │    │
│ │                                      │    │
│ │ BULL CASE (25% prob):                │    │
│ │ Faster disinflation, no recession    │    │
│ │ Growth: 2%+ / Inflation: <2.5%      │    │
│ │                                      │    │
│ │ BEAR CASE (15% prob):                │    │
│ │ Recession + sticky inflation         │    │
│ │ Growth: -1% / Inflation: 3-4%       │    │
│ └──────────────────────────────────────┘    │
│                                             │
│ [🔗 Labor | 📊 Inflation | 💹 Markets]│
└─────────────────────────────────────────────┘
```

---

## 📱 Mobile Experience

**Current:** Sidebar unscrollable on phone, 26 items → chaos

**Proposed Mobile Dashboard:**

```
┌─────────────┐
│ ORATOR      │
│ Mobile View │
├─────────────┤
│ Tap to sync │
│ range ➡️    │
│ 📱📊📈     │
│ All charts  │
│             │
│ 📍 KPI STRIP│
│ ┌─────────┐ │
│ │ 4.2%    │ │
│ │ Unemp   │ │
│ └─────────┘ │
│ ┌─────────┐ │
│ │ 3.8%    │ │
│ │ CPI Core│ │
│ └─────────┘ │
│ ┌─────────┐ │
│ │ 5.50%   │ │
│ │ Fed Rate│ │
│ └─────────┘ │
│ ┌─────────┐ │
│ │ 4560    │ │
│ │ S&P 500 │ │
│ └─────────┘ │
│             │
│ [Swipe ←→   │
│ for more]   │
│             │
│ 📍 MAIN MENU│
│ ┌─────────┐ │
│ │ Dashboard│
│ │ > Fed    │
│ │ > Econ.  │
│ │ > Labor  │
│ │ > Credit │
│ │ > Energy │
│ │ > Markets│
│ └─────────┘ │
│             │
└─────────────┘
```

---

## 🔄 Transition Plan (Not Breaking)

1. **Week 1:** Add new nav "Dashboards" section (above existing panels) — don't hide old panels
2. **Week 2-3:** Promote Dashboards; keep "Detailed Views" prominent
3. **Week 4+:** A/B test: does engagement improve? If yes, gradually de-emphasize individual panels

---

## ✅ Success Metrics

**Before (26 panels, isolated view):**
- Avg session duration: 8 min
- Panels per session: 2-3
- Mobile usage: 15%
- User satisfaction: 65%

**After (5 composite dashboards + detailed views):**
- Avg session duration: 15+ min (reading narratives)
- Dashboards per session: 1-2 (deep dives)
- Mobile usage: 35-40%
- User satisfaction: 80%+ (target)

---

