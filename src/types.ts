export interface FredObs {
  date: string
  value: number
}

export type TimeRange = '6M' | '1Y' | '3Y' | '5Y' | '10Y' | '20Y' | '30Y' | 'MAX'

export type ActiveView =
  | 'yield-curve'
  | 'fed-futures-proxy'
  | 'macro'
  | 'cpi'
  | 'spreads'
  | 'grocery'
  | 'labor'
  | 'housing'
  | 'recession'
  | 'inflation'
  | 'credit'
  | 'activity'
  | 'markets'
  | 'market-prices'
  | 'energy'
  | 'fiscal'
  | 'consumer'
  | 'global-macro'
  | 'volatility'
  | 'gdp-breakdown'
  | 'global-credit'
  | 'trade'
  | 'corporate-earnings'
  | 'monetary-conditions'
  | 'heatmap'
  | 'compare'
  | 'correlation'
  | 'calendar'
  | 'crisis'
  | 'custom'
  | 'fed-cycle'
  | 'recession-early-warning'
  | 'inflation-decomposition'
  | 'growth-stagflation'
  | 'valuation'

export interface YieldSurface {
  dates: string[]
  maturityLabels: string[]
  maturityYears: number[]
  z: number[][]
}

export interface MacroSeries {
  id: string
  label: string
  unit: string
  color: string
}

export interface CpiComponent {
  id: string
  label: string
  color: string
}
