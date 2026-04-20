export interface FredObs {
  date: string
  value: number
}

export type TimeRange = '1Y' | '2Y' | '5Y' | '10Y' | 'MAX'

export type ActiveView = 'yield-curve' | 'macro' | 'cpi' | 'spreads'

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
