/**
 * Unified Series Registry — single source of truth for every macro indicator
 * surfaced in Orator. Used by Heatmap, Compare, Correlation, Command Bar,
 * Custom Dashboard Builder, and other cross-cutting features.
 *
 * Keys here MUST match the response.series keys returned by the backend.
 * For yoy:true series the backend keeps the same id (no suffix).
 */
import type { ActiveView } from '../types'
import { palette } from '../theme'

export type EndpointKey =
  | 'macro'
  | 'labor'
  | 'inflation'
  | 'activity'
  | 'spreads'
  | 'recession'
  | 'housing'
  | 'consumer'
  | 'credit'
  | 'markets'
  | 'market-prices'
  | 'energy'
  | 'fiscal'
  | 'cpi'
  | 'grocery'

export type IndicatorCategory = 'leading' | 'coincident' | 'lagging'

export interface IndicatorMeta {
  /** FRED / backend series id; matches key in response.series */
  id: string
  /** Human label */
  label: string
  /** Short label for compact UI (heatmap, command bar) */
  short: string
  /** Display unit suffix (e.g., '%', 'index', 'bps') */
  unit: string
  /** Color from palette.series */
  color: string
  /** Backend endpoint that delivers this series */
  endpoint: EndpointKey
  /** Tab that should be opened when user clicks this indicator */
  view: ActiveView
  /** Which dashboard section it belongs to (for grouping in Heatmap) */
  section: string
  /** Leading / coincident / lagging classification */
  category: IndicatorCategory
  /** Search keywords */
  keywords: string[]
  /**
   * For YoY-transformed series, the value already represents % change.
   * Use this hint when computing further % deltas in the heatmap.
   */
  isYoy?: boolean
  /** If true, lower values are positive (e.g., unemployment, jobless claims, VIX) */
  inverted?: boolean
}

const s = palette.series

/* eslint-disable @typescript-eslint/comma-dangle -- registry table preferred to be compact */
export const INDICATOR_REGISTRY: IndicatorMeta[] = [
  // -------- Monetary Policy & Rates --------
  { id: 'FEDFUNDS', label: 'Federal Funds Rate', short: 'Fed Funds', unit: '%', color: s.yellow, endpoint: 'macro', view: 'macro', section: 'Monetary Policy', category: 'lagging', keywords: ['fed', 'rates', 'monetary', 'policy', 'interest'] },
  { id: 'T10Y2Y', label: '10Y-2Y Treasury Spread', short: '10Y-2Y', unit: 'pp', color: s.blue, endpoint: 'spreads', view: 'spreads', section: 'Monetary Policy', category: 'leading', keywords: ['spread', 'yield curve', 'recession', 'inversion'] },
  { id: 'T10Y3M', label: '10Y-3M Treasury Spread', short: '10Y-3M', unit: 'pp', color: s.green, endpoint: 'spreads', view: 'spreads', section: 'Monetary Policy', category: 'leading', keywords: ['spread', 'yield curve', 'recession', 'inversion'] },

  // -------- Employment & Labor --------
  { id: 'UNRATE', label: 'Unemployment Rate', short: 'Unemp.', unit: '%', color: s.red, endpoint: 'labor', view: 'labor', section: 'Labor', category: 'lagging', keywords: ['unemployment', 'jobless', 'labor'], inverted: true },
  { id: 'PAYEMS', label: 'Nonfarm Payrolls (YoY)', short: 'Payrolls', unit: '%', color: s.green, endpoint: 'labor', view: 'labor', section: 'Labor', category: 'coincident', keywords: ['payrolls', 'jobs', 'employment'], isYoy: true },
  { id: 'CIVPART', label: 'Labor Force Participation', short: 'LFP', unit: '%', color: s.yellow, endpoint: 'labor', view: 'labor', section: 'Labor', category: 'coincident', keywords: ['participation', 'workforce'] },
  { id: 'ICSA', label: 'Initial Jobless Claims', short: 'Claims', unit: 'k', color: s.pink, endpoint: 'labor', view: 'labor', section: 'Labor', category: 'leading', keywords: ['claims', 'unemployment'], inverted: true },
  { id: 'AHETPI', label: 'Avg Hourly Earnings (YoY)', short: 'Wages', unit: '%', color: s.amber, endpoint: 'labor', view: 'labor', section: 'Labor', category: 'lagging', keywords: ['wages', 'earnings'], isYoy: true },
  { id: 'JTSJOL', label: 'Job Openings (JOLTS)', short: 'Openings', unit: 'k', color: s.cyan, endpoint: 'labor', view: 'labor', section: 'Labor', category: 'leading', keywords: ['jobs', 'openings', 'jolts'] },

  // -------- Inflation & Prices --------
  { id: 'CPIAUCSL', label: 'CPI (YoY)', short: 'CPI', unit: '%', color: s.red, endpoint: 'inflation', view: 'inflation', section: 'Inflation', category: 'lagging', keywords: ['inflation', 'cpi', 'prices'], isYoy: true },
  { id: 'CPILFESL', label: 'Core CPI (YoY)', short: 'Core CPI', unit: '%', color: s.orange, endpoint: 'inflation', view: 'inflation', section: 'Inflation', category: 'lagging', keywords: ['inflation', 'core cpi'], isYoy: true },
  { id: 'PPIACO', label: 'Producer Price Index (YoY)', short: 'PPI', unit: '%', color: s.yellow, endpoint: 'inflation', view: 'inflation', section: 'Inflation', category: 'leading', keywords: ['ppi', 'producer prices'], isYoy: true },
  { id: 'PCEPI', label: 'PCE Price Index (YoY)', short: 'PCE', unit: '%', color: s.cyan, endpoint: 'inflation', view: 'inflation', section: 'Inflation', category: 'lagging', keywords: ['pce', 'inflation'], isYoy: true },
  { id: 'PCEPILFE', label: 'Core PCE (YoY)', short: 'Core PCE', unit: '%', color: s.purple, endpoint: 'inflation', view: 'inflation', section: 'Inflation', category: 'lagging', keywords: ['pce', 'core', 'inflation', 'fed target'], isYoy: true },
  { id: 'IR', label: 'Import Price Index (YoY)', short: 'Imports', unit: '%', color: s.green, endpoint: 'inflation', view: 'inflation', section: 'Inflation', category: 'leading', keywords: ['imports', 'prices'], isYoy: true },
  { id: 'IQ', label: 'Export Price Index (YoY)', short: 'Exports', unit: '%', color: s.violet, endpoint: 'inflation', view: 'inflation', section: 'Inflation', category: 'leading', keywords: ['exports', 'prices'], isYoy: true },

  // -------- Economic Activity --------
  { id: 'A191RL1Q225SBEA', label: 'Real GDP Growth (YoY)', short: 'GDP', unit: '%', color: s.green, endpoint: 'macro', view: 'macro', section: 'Activity', category: 'coincident', keywords: ['gdp', 'growth', 'output'] },
  { id: 'INDPRO', label: 'Industrial Production', short: 'IP', unit: 'idx', color: s.blue, endpoint: 'activity', view: 'activity', section: 'Activity', category: 'coincident', keywords: ['industrial', 'production', 'output'] },
  { id: 'IPMAN', label: 'Manufacturing Output', short: 'Mfg', unit: 'idx', color: s.cyan, endpoint: 'activity', view: 'activity', section: 'Activity', category: 'coincident', keywords: ['manufacturing', 'output'] },
  { id: 'TCU', label: 'Capacity Utilization', short: 'CapU', unit: '%', color: s.purple, endpoint: 'activity', view: 'activity', section: 'Activity', category: 'coincident', keywords: ['capacity', 'utilization'] },
  { id: 'NEWORDER', label: 'New Orders: Capital Goods', short: 'CapEx Ord.', unit: '$M', color: s.orange, endpoint: 'activity', view: 'activity', section: 'Activity', category: 'leading', keywords: ['orders', 'capital goods', 'investment'] },
  { id: 'DGORDER', label: 'Durable Goods Orders', short: 'Durables', unit: '$M', color: s.amber, endpoint: 'activity', view: 'activity', section: 'Activity', category: 'leading', keywords: ['durable goods', 'orders'] },
  { id: 'AWHNONAG', label: 'Avg Weekly Hours', short: 'Hours', unit: 'hrs', color: s.teal, endpoint: 'activity', view: 'activity', section: 'Activity', category: 'leading', keywords: ['hours worked'] },

  // -------- Consumer --------
  { id: 'RSXFS', label: 'Retail Sales (YoY)', short: 'Retail', unit: '%', color: s.green, endpoint: 'consumer', view: 'consumer', section: 'Consumer', category: 'coincident', keywords: ['retail', 'sales', 'spending'], isYoy: true },
  { id: 'UMCSENT', label: 'U. Michigan Consumer Sentiment', short: 'Sentiment', unit: 'idx', color: s.blue, endpoint: 'consumer', view: 'consumer', section: 'Consumer', category: 'leading', keywords: ['sentiment', 'consumer', 'confidence'] },
  { id: 'PSAVERT', label: 'Personal Saving Rate', short: 'Savings', unit: '%', color: s.amber, endpoint: 'consumer', view: 'consumer', section: 'Consumer', category: 'coincident', keywords: ['savings', 'household'] },
  { id: 'PCE', label: 'Personal Consumption (YoY)', short: 'PCE Spend', unit: '%', color: s.orange, endpoint: 'consumer', view: 'consumer', section: 'Consumer', category: 'coincident', keywords: ['consumption', 'spending', 'pce'], isYoy: true },
  { id: 'DSPIC96', label: 'Real Disposable Income (YoY)', short: 'Real DPI', unit: '%', color: s.cyan, endpoint: 'consumer', view: 'consumer', section: 'Consumer', category: 'coincident', keywords: ['income', 'disposable', 'real'], isYoy: true },
  { id: 'TOTALSL', label: 'Consumer Credit Outstanding (YoY)', short: 'Credit', unit: '%', color: s.violet, endpoint: 'consumer', view: 'consumer', section: 'Consumer', category: 'lagging', keywords: ['credit', 'consumer', 'debt'], isYoy: true },

  // -------- Housing --------
  { id: 'HOUST', label: 'Housing Starts', short: 'Starts', unit: 'k', color: s.green, endpoint: 'housing', view: 'housing', section: 'Housing', category: 'leading', keywords: ['housing starts', 'construction'] },
  { id: 'PERMIT', label: 'Building Permits', short: 'Permits', unit: 'k', color: s.cyan, endpoint: 'housing', view: 'housing', section: 'Housing', category: 'leading', keywords: ['permits', 'building'] },
  { id: 'CSUSHPISA', label: 'Case-Shiller Home Price (YoY)', short: 'Home Prices', unit: '%', color: s.yellow, endpoint: 'housing', view: 'housing', section: 'Housing', category: 'lagging', keywords: ['home prices', 'case shiller'], isYoy: true },
  { id: 'MORTGAGE30US', label: '30Y Fixed Mortgage Rate', short: '30Y Mtg', unit: '%', color: s.red, endpoint: 'housing', view: 'housing', section: 'Housing', category: 'coincident', keywords: ['mortgage', 'rates'], inverted: true },
  { id: 'MSACSR', label: 'Months Supply of Houses', short: 'Mo. Supply', unit: 'mo', color: s.amber, endpoint: 'housing', view: 'housing', section: 'Housing', category: 'leading', keywords: ['supply', 'inventory', 'housing'], inverted: true },
  { id: 'RRVRUSQ156N', label: 'Rental Vacancy Rate', short: 'Vacancy', unit: '%', color: s.orange, endpoint: 'housing', view: 'housing', section: 'Housing', category: 'lagging', keywords: ['rental', 'vacancy'] },

  // -------- Credit Conditions --------
  { id: 'BAMLH0A0HYM2', label: 'High-Yield Spread (BofA)', short: 'HY Spread', unit: 'bps', color: s.red, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'leading', keywords: ['credit', 'high yield', 'spread', 'risk'], inverted: true },
  { id: 'PRIME', label: 'Prime Lending Rate', short: 'Prime', unit: '%', color: s.blue, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'lagging', keywords: ['prime', 'lending'] },
  { id: 'TERMCBCCALLNS', label: 'Credit Card Charge-Off Rate', short: 'CC Charge', unit: '%', color: s.orange, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'lagging', keywords: ['credit card', 'delinquency'], inverted: true },

  // -------- Markets --------
  { id: 'SP500', label: 'S&P 500 Index', short: 'S&P 500', unit: 'idx', color: s.green, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'leading', keywords: ['sp500', 'stocks', 'equity'] },
  { id: 'VIXCLS', label: 'VIX Volatility Index', short: 'VIX', unit: 'idx', color: s.red, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'leading', keywords: ['vix', 'volatility', 'fear'], inverted: true },
  { id: 'DCOILWTICO', label: 'Crude Oil (WTI)', short: 'WTI', unit: '$/bbl', color: s.yellow, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'leading', keywords: ['oil', 'crude', 'energy', 'wti'] },
  { id: 'GOLDS', label: 'Gold Spot Price', short: 'Gold', unit: '$/oz', color: s.amber, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'leading', keywords: ['gold', 'commodities', 'safe haven'] },
  { id: 'DEXUSEU', label: 'USD / EUR FX Rate', short: 'EUR/USD', unit: '', color: s.blue, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'coincident', keywords: ['fx', 'currency', 'euro', 'dollar'] },
  { id: 'DTWEXBGS', label: 'Trade-Weighted USD (Broad)', short: 'USD Idx', unit: 'idx', color: s.violet, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'coincident', keywords: ['dollar', 'usd', 'trade weighted'] },

  // -------- Energy --------
  { id: 'PET.RWTC.W', label: 'WTI Crude (Spot)', short: 'WTI', unit: '$/bbl', color: s.yellow, endpoint: 'energy', view: 'energy', section: 'Energy', category: 'leading', keywords: ['wti', 'crude', 'oil', 'energy'] },
  { id: 'PET.RBRTE.W', label: 'Brent Crude (Spot)', short: 'Brent', unit: '$/bbl', color: s.red, endpoint: 'energy', view: 'energy', section: 'Energy', category: 'leading', keywords: ['brent', 'crude', 'oil', 'energy'] },
  { id: 'NG.RNGWHHD.W', label: 'Henry Hub Natural Gas', short: 'Nat Gas', unit: '$/MMBtu', color: s.blue, endpoint: 'energy', view: 'energy', section: 'Energy', category: 'leading', keywords: ['natural gas', 'henry hub', 'energy'] },
  { id: 'PET.WCESTUS1.W', label: 'U.S. Crude Inventories', short: 'Crude Stocks', unit: 'k bbl', color: s.green, endpoint: 'energy', view: 'energy', section: 'Energy', category: 'coincident', keywords: ['inventory', 'stocks', 'crude', 'energy'] },
  { id: 'PET.WGTSTUS1.W', label: 'U.S. Gasoline Inventories', short: 'Gasoline Stocks', unit: 'k bbl', color: s.cyan, endpoint: 'energy', view: 'energy', section: 'Energy', category: 'coincident', keywords: ['inventory', 'gasoline', 'stocks', 'energy'] },
  { id: 'PET.WPULEUS3.W', label: 'Refinery Utilization', short: 'Refinery Util', unit: '%', color: s.violet, endpoint: 'energy', view: 'energy', section: 'Energy', category: 'coincident', keywords: ['refinery', 'utilization', 'energy'] },
  { id: 'ELEC.PRICE.US-RES.M', label: 'Residential Electricity Price', short: 'Power Price', unit: 'c/kWh', color: s.orange, endpoint: 'energy', view: 'energy', section: 'Energy', category: 'lagging', keywords: ['electricity', 'power', 'utility', 'price'] },

  // -------- Fiscal --------
  { id: 'FYFSD', label: 'Federal Surplus or Deficit', short: 'Deficit', unit: '$B', color: s.red, endpoint: 'fiscal', view: 'fiscal', section: 'Fiscal', category: 'lagging', keywords: ['deficit', 'surplus', 'federal budget'] },
  { id: 'GFDEBTN', label: 'Gross Federal Debt', short: 'Debt', unit: '$M', color: s.yellow, endpoint: 'fiscal', view: 'fiscal', section: 'Fiscal', category: 'lagging', keywords: ['debt', 'federal', 'treasury'] },
  { id: 'FGRECPT', label: 'Federal Receipts', short: 'Receipts', unit: '$B', color: s.green, endpoint: 'fiscal', view: 'fiscal', section: 'Fiscal', category: 'coincident', keywords: ['receipts', 'taxes', 'federal'] },
  { id: 'FGEXPND', label: 'Federal Expenditures', short: 'Outlays', unit: '$B', color: s.blue, endpoint: 'fiscal', view: 'fiscal', section: 'Fiscal', category: 'coincident', keywords: ['expenditures', 'outlays', 'federal'] },
  { id: 'WALCL', label: 'Fed Balance Sheet Assets', short: 'Fed Assets', unit: '$M', color: s.violet, endpoint: 'fiscal', view: 'fiscal', section: 'Fiscal', category: 'lagging', keywords: ['fed balance sheet', 'walcl', 'qe', 'qt'] },
  { id: 'TREASURY_DEBT_PUBLIC', label: 'Treasury Debt Held by Public', short: 'Debt Public', unit: '$', color: s.teal, endpoint: 'fiscal', view: 'fiscal', section: 'Fiscal', category: 'lagging', keywords: ['treasury', 'debt held by public'] },

  // -------- Market Prices --------
  { id: 'SPY', label: 'SPDR S&P 500 ETF', short: 'SPY', unit: '$', color: s.green, endpoint: 'market-prices', view: 'market-prices', section: 'Market Prices', category: 'leading', keywords: ['spy', 'sp500', 'etf', 'equity'] },
  { id: 'QQQ', label: 'Invesco QQQ', short: 'QQQ', unit: '$', color: s.blue, endpoint: 'market-prices', view: 'market-prices', section: 'Market Prices', category: 'leading', keywords: ['qqq', 'nasdaq', 'tech'] },
  { id: 'IWM', label: 'iShares Russell 2000', short: 'IWM', unit: '$', color: s.violet, endpoint: 'market-prices', view: 'market-prices', section: 'Market Prices', category: 'leading', keywords: ['iwm', 'small cap', 'russell'] },
  { id: 'DIA', label: 'SPDR Dow Jones ETF', short: 'DIA', unit: '$', color: s.amber, endpoint: 'market-prices', view: 'market-prices', section: 'Market Prices', category: 'leading', keywords: ['dia', 'dow', 'etf'] },
  { id: 'XLE', label: 'Energy Select Sector SPDR', short: 'XLE', unit: '$', color: s.orange, endpoint: 'market-prices', view: 'market-prices', section: 'Market Prices', category: 'leading', keywords: ['xle', 'energy', 'sector'] },
  { id: 'GLD', label: 'SPDR Gold Shares', short: 'GLD', unit: '$', color: s.yellow, endpoint: 'market-prices', view: 'market-prices', section: 'Market Prices', category: 'leading', keywords: ['gld', 'gold', 'commodity'] },
]
/* eslint-enable */

export const INDICATOR_BY_ID: Record<string, IndicatorMeta> = Object.fromEntries(
  INDICATOR_REGISTRY.map((ind) => [ind.id, ind]),
)

export const SECTIONS = Array.from(new Set(INDICATOR_REGISTRY.map((i) => i.section)))

export function indicatorsBySection(section: string): IndicatorMeta[] {
  return INDICATOR_REGISTRY.filter((i) => i.section === section)
}

export function indicatorsByCategory(cat: IndicatorCategory): IndicatorMeta[] {
  return INDICATOR_REGISTRY.filter((i) => i.category === cat)
}
