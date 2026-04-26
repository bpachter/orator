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
  | 'global-macro'
  | 'volatility'
  | 'gdp-breakdown'
  | 'global-credit'
  | 'trade'
  | 'corporate-earnings'
  | 'monetary-conditions'
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
  { id: 'DRCCLACBS', label: 'Credit Card Delinquency Rate', short: 'CC Delin.', unit: '%', color: s.amber, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'lagging', keywords: ['delinquency', 'consumer', 'credit card'], inverted: true },
  { id: 'LOANS', label: 'Total Bank Loans & Leases (YoY)', short: 'Bank Loans', unit: '%', color: s.cyan, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'coincident', keywords: ['bank loans', 'h8', 'lending'], isYoy: true },
  { id: 'BUSLOANS', label: 'C&I Loans (YoY)', short: 'C&I Loans', unit: '%', color: s.violet, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'coincident', keywords: ['c&i', 'commercial', 'industrial loans', 'h8'], isYoy: true },
  { id: 'RREACBW027SBOG', label: 'Real Estate Loans (YoY)', short: 'RE Loans', unit: '%', color: s.purple, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'coincident', keywords: ['real estate', 'mortgage', 'bank', 'h8'], isYoy: true },
  { id: 'CONSUMER', label: 'Consumer Loans (YoY)', short: 'Consumer Loans', unit: '%', color: s.teal, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'coincident', keywords: ['consumer', 'loans', 'h8'], isYoy: true },
  { id: 'REVOLSL', label: 'Revolving Credit (YoY)', short: 'Revolving', unit: '%', color: s.pink, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'lagging', keywords: ['revolving', 'credit card', 'g19'], isYoy: true },
  { id: 'NONREVSL', label: 'Nonrevolving Credit (YoY)', short: 'Nonrevolving', unit: '%', color: s.green, endpoint: 'credit', view: 'credit', section: 'Credit', category: 'lagging', keywords: ['nonrevolving', 'auto', 'student', 'g19'], isYoy: true },

  // -------- Markets --------
  { id: 'SP500', label: 'S&P 500 Index', short: 'S&P 500', unit: 'idx', color: s.green, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'leading', keywords: ['sp500', 'stocks', 'equity'] },
  { id: 'VIXCLS', label: 'VIX Volatility Index', short: 'VIX', unit: 'idx', color: s.red, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'leading', keywords: ['vix', 'volatility', 'fear'], inverted: true },
  { id: 'DCOILWTICO', label: 'Crude Oil (WTI)', short: 'WTI', unit: '$/bbl', color: s.yellow, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'leading', keywords: ['oil', 'crude', 'energy', 'wti'] },
  { id: 'GOLDAMGBD228NLBM', label: 'Gold Spot Price', short: 'Gold', unit: '$/oz', color: s.amber, endpoint: 'markets', view: 'markets', section: 'Markets', category: 'leading', keywords: ['gold', 'commodities', 'safe haven'] },
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

  // -------- Global Macro --------
  { id: 'USALOLITONOSTSAM', label: 'US CLI (OECD)', short: 'US CLI', unit: 'idx', color: s.blue, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'leading', keywords: ['cli', 'leading indicator', 'oecd', 'us'] },
  { id: 'DEULORSGPNOSTSAM', label: 'Germany CLI (OECD)', short: 'DE CLI', unit: 'idx', color: s.yellow, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'leading', keywords: ['cli', 'leading indicator', 'oecd', 'germany'] },
  { id: 'FRALORSGPNOSTSAM', label: 'France CLI (OECD)', short: 'FR CLI', unit: 'idx', color: s.green, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'leading', keywords: ['cli', 'leading indicator', 'oecd', 'france'] },
  { id: 'JPNLORSGPNOSTSAM', label: 'Japan CLI (OECD)', short: 'JP CLI', unit: 'idx', color: s.orange, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'leading', keywords: ['cli', 'leading indicator', 'oecd', 'japan'] },
  { id: 'GBRLORSGPNOSTSAM', label: 'UK CLI (OECD)', short: 'UK CLI', unit: 'idx', color: s.cyan, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'leading', keywords: ['cli', 'leading indicator', 'oecd', 'uk', 'britain'] },
  { id: 'CHNLORSGPNOSTSAM', label: 'China CLI (OECD)', short: 'CN CLI', unit: 'idx', color: s.red, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'leading', keywords: ['cli', 'leading indicator', 'oecd', 'china'] },
  { id: 'CANLORSGPNOSTSAM', label: 'Canada CLI (OECD)', short: 'CA CLI', unit: 'idx', color: s.violet, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'leading', keywords: ['cli', 'leading indicator', 'oecd', 'canada'] },
  { id: 'ECBDFR', label: 'ECB Deposit Rate', short: 'ECB Rate', unit: '%', color: s.amber, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'lagging', keywords: ['ecb', 'euro', 'policy rate', 'europe'] },
  { id: 'IRLTLT01DEM156N', label: 'Germany 10Y Bund', short: 'DE 10Y', unit: '%', color: s.yellow, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['bund', 'germany', '10y', 'sovereign yield'] },
  { id: 'IRLTLT01GBM156N', label: 'UK 10Y Gilt', short: 'UK 10Y', unit: '%', color: s.teal, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['gilt', 'uk', '10y', 'sovereign yield'] },
  { id: 'IRLTLT01JPM156N', label: 'Japan 10Y JGB', short: 'JP 10Y', unit: '%', color: s.orange, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['jgb', 'japan', '10y', 'sovereign yield'] },
  { id: 'DEXJPUS', label: 'JPY/USD FX Rate', short: 'JPY/USD', unit: 'JPY', color: s.pink, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['yen', 'jpy', 'fx', 'currency'] },
  { id: 'DEXUSUK', label: 'GBP/USD FX Rate', short: 'GBP/USD', unit: 'USD', color: s.purple, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['pound', 'gbp', 'fx', 'currency'] },
  { id: 'WB_GDP_US', label: 'US GDP YoY (World Bank)', short: 'US GDP', unit: '%', color: s.blue, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['gdp', 'growth', 'us', 'world bank'], isYoy: true },
  { id: 'WB_GDP_DE', label: 'Germany GDP YoY (World Bank)', short: 'DE GDP', unit: '%', color: s.yellow, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['gdp', 'growth', 'germany', 'world bank'], isYoy: true },
  { id: 'WB_GDP_JP', label: 'Japan GDP YoY (World Bank)', short: 'JP GDP', unit: '%', color: s.orange, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['gdp', 'growth', 'japan', 'world bank'], isYoy: true },
  { id: 'WB_GDP_CN', label: 'China GDP YoY (World Bank)', short: 'CN GDP', unit: '%', color: s.red, endpoint: 'global-macro', view: 'global-macro', section: 'Global Macro', category: 'coincident', keywords: ['gdp', 'growth', 'china', 'world bank'], isYoy: true },

  // -------- Volatility --------
  { id: 'VIX', label: 'CBOE VIX (30-day Implied Vol)', short: 'VIX', unit: 'idx', color: s.red, endpoint: 'volatility', view: 'volatility', section: 'Volatility', category: 'leading', keywords: ['vix', 'volatility', 'fear', 'cboe', 'options'], inverted: true },
  { id: 'VIX3M', label: 'CBOE VIX3M (3-month Implied Vol)', short: 'VIX3M', unit: 'idx', color: s.blue, endpoint: 'volatility', view: 'volatility', section: 'Volatility', category: 'leading', keywords: ['vix3m', 'volatility', 'cboe', 'term structure'], inverted: true },
  { id: 'SKEW', label: 'CBOE SKEW Index (Tail Risk)', short: 'SKEW', unit: 'idx', color: s.yellow, endpoint: 'volatility', view: 'volatility', section: 'Volatility', category: 'leading', keywords: ['skew', 'tail risk', 'cboe', 'crash risk', 'options'] },

  // -------- GDP Breakdown (BEA) --------
  { id: 'A191RL1Q225SBEA', label: 'Real GDP (Total)', short: 'Real GDP', unit: '%', color: s.blue, endpoint: 'gdp-breakdown', view: 'gdp-breakdown', section: 'GDP Breakdown', category: 'coincident', keywords: ['gdp', 'growth', 'real', 'bea', 'nipa'] },
  { id: 'DPCERE1Q156NBEA', label: 'Personal Consumption (C)', short: 'PCE', unit: '%', color: s.green, endpoint: 'gdp-breakdown', view: 'gdp-breakdown', section: 'GDP Breakdown', category: 'coincident', keywords: ['consumption', 'pce', 'gdp', 'consumer spending'] },
  { id: 'A006RL1Q225SBEA', label: 'Gross Private Investment (I)', short: 'Investment', unit: '%', color: s.amber, endpoint: 'gdp-breakdown', view: 'gdp-breakdown', section: 'GDP Breakdown', category: 'leading', keywords: ['investment', 'capex', 'gdp', 'private'] },
  { id: 'A822RL1Q225SBEA', label: 'Government Spending (G)', short: 'Gov Spending', unit: '%', color: s.violet, endpoint: 'gdp-breakdown', view: 'gdp-breakdown', section: 'GDP Breakdown', category: 'lagging', keywords: ['government', 'spending', 'gdp', 'fiscal'] },
  { id: 'A019RL1Q225SBEA', label: 'Net Exports (NX)', short: 'Net Exports', unit: '%', color: s.orange, endpoint: 'gdp-breakdown', view: 'gdp-breakdown', section: 'GDP Breakdown', category: 'coincident', keywords: ['net exports', 'trade', 'gdp', 'nx'] },

  // -------- Global Credit (BIS) --------
  { id: 'BIS_CREDIT_US', label: 'US Private Credit (% GDP)', short: 'US Credit', unit: '%GDP', color: s.blue, endpoint: 'global-credit', view: 'global-credit', section: 'Global Credit', category: 'lagging', keywords: ['bis', 'credit', 'debt', 'private', 'us', 'gdp'] },
  { id: 'BIS_CREDIT_CN', label: 'China Private Credit (% GDP)', short: 'CN Credit', unit: '%GDP', color: s.red, endpoint: 'global-credit', view: 'global-credit', section: 'Global Credit', category: 'lagging', keywords: ['bis', 'credit', 'china', 'debt', 'gdp'] },
  { id: 'BIS_CREDIT_JP', label: 'Japan Private Credit (% GDP)', short: 'JP Credit', unit: '%GDP', color: s.amber, endpoint: 'global-credit', view: 'global-credit', section: 'Global Credit', category: 'lagging', keywords: ['bis', 'credit', 'japan', 'debt', 'gdp'] },
  { id: 'BIS_CREDIT_DE', label: 'Germany Private Credit (% GDP)', short: 'DE Credit', unit: '%GDP', color: s.green, endpoint: 'global-credit', view: 'global-credit', section: 'Global Credit', category: 'lagging', keywords: ['bis', 'credit', 'germany', 'debt', 'gdp'] },

  // -------- Trade & Flows --------
  { id: 'BOPGSTB', label: 'Goods Trade Balance', short: 'Goods Balance', unit: '$B', color: s.orange, endpoint: 'trade', view: 'trade', section: 'Trade', category: 'coincident', keywords: ['trade balance', 'goods', 'exports', 'imports', 'bop'] },
  { id: 'NETEXP', label: 'Net Exports of Goods & Services', short: 'Net Exports', unit: '$B', color: s.blue, endpoint: 'trade', view: 'trade', section: 'Trade', category: 'coincident', keywords: ['net exports', 'trade', 'nx'] },
  { id: 'EXPGS', label: 'Exports of Goods & Services', short: 'Exports', unit: '$B', color: s.green, endpoint: 'trade', view: 'trade', section: 'Trade', category: 'coincident', keywords: ['exports', 'trade', 'goods', 'services'] },
  { id: 'IMPGS', label: 'Imports of Goods & Services', short: 'Imports', unit: '$B', color: s.red, endpoint: 'trade', view: 'trade', section: 'Trade', category: 'coincident', keywords: ['imports', 'trade', 'goods', 'services'] },
  { id: 'BOPGSB', label: 'Services Trade Balance', short: 'Services Balance', unit: '$B', color: s.violet, endpoint: 'trade', view: 'trade', section: 'Trade', category: 'coincident', keywords: ['trade balance', 'services', 'bop'] },
  { id: 'DCOILWTICO', label: 'WTI Crude Oil Price', short: 'WTI Oil', unit: '$/bbl', color: s.amber, endpoint: 'trade', view: 'trade', section: 'Trade', category: 'leading', keywords: ['oil', 'wti', 'crude', 'energy', 'commodity'] },

  // -------- Corporate Earnings & Profitability --------
  { id: 'PROFITS', label: 'Corporate Profits (YoY %)', short: 'Profits YoY', unit: '%', color: s.orange, endpoint: 'corporate-earnings', view: 'corporate-earnings', section: 'Earnings', category: 'coincident', keywords: ['profits', 'corporate', 'earnings'], isYoy: true },
  { id: 'NET_MARGIN', label: 'Net Profit Margin', short: 'Net Margin', unit: '%', color: s.blue, endpoint: 'corporate-earnings', view: 'corporate-earnings', section: 'Earnings', category: 'lagging', keywords: ['margin', 'profitability', 'earnings'] },
  { id: 'OP_MARGIN', label: 'Operating Margin', short: 'Op Margin', unit: '%', color: s.cyan, endpoint: 'corporate-earnings', view: 'corporate-earnings', section: 'Earnings', category: 'lagging', keywords: ['margin', 'operating', 'profitability'] },
  { id: 'EARNINGS', label: 'S&P 500 Earnings Per Share', short: 'S&P EPS', unit: '$', color: s.green, endpoint: 'corporate-earnings', view: 'corporate-earnings', section: 'Earnings', category: 'lagging', keywords: ['earnings', 'eps', 'stocks', 's&p 500'] },
  { id: 'PE10', label: 'Shiller CAPE Ratio', short: 'CAPE', unit: 'x', color: s.red, endpoint: 'corporate-earnings', view: 'corporate-earnings', section: 'Earnings', category: 'lagging', keywords: ['valuation', 'pe', 'cape', 'multiples'] },

  // -------- Monetary Conditions --------
  { id: 'M1SL', label: 'M1 Money Supply (YoY %)', short: 'M1 YoY', unit: '%', color: s.blue, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'leading', keywords: ['m1', 'money supply', 'monetary'], isYoy: true },
  { id: 'M2SL', label: 'M2 Money Supply (YoY %)', short: 'M2 YoY', unit: '%', color: s.cyan, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'leading', keywords: ['m2', 'money supply', 'monetary'], isYoy: true },
  { id: 'M3SL', label: 'M3 Money Supply (YoY %)', short: 'M3 YoY', unit: '%', color: s.teal, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'leading', keywords: ['m3', 'money supply', 'monetary'], isYoy: true },
  { id: 'AMBSL', label: 'Monetary Base (YoY %)', short: 'MonBase YoY', unit: '%', color: s.yellow, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'leading', keywords: ['monetary base', 'fed'], isYoy: true },
  { id: 'RESBALNS', label: 'Bank Reserves (Outstanding)', short: 'Reserves', unit: '$B', color: s.orange, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'coincident', keywords: ['reserves', 'banks', 'fed'] },
  { id: 'DPCBCTSL', label: 'Discount Window Borrowing', short: 'Disc Window', unit: '$M', color: s.amber, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'leading', keywords: ['discount window', 'fed', 'borrowing'] },
  { id: 'RRPONTSYD', label: 'Fed Reverse Repos Outstanding', short: 'Rev Repos', unit: '$B', color: s.purple, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'coincident', keywords: ['reverse repo', 'fed', 'overnight'] },
  { id: 'LMMNRNJ', label: 'Net % Banks Tightening Lending', short: 'Tighten %', unit: '%', color: s.red, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'coincident', keywords: ['lending standards', 'credit', 'tightening'], inverted: true },
  { id: 'M2V', label: 'M2 Velocity (GDP/M2)', short: 'M2V', unit: 'x', color: s.violet, endpoint: 'monetary-conditions', view: 'monetary-conditions', section: 'Monetary', category: 'coincident', keywords: ['velocity', 'money', 'm2'] },
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
