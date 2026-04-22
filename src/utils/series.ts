import type { FredObs, TimeRange } from '../types'

const RANGE_YEARS: Record<Exclude<TimeRange, 'MAX'>, number> = {
  '1Y': 1,
  '2Y': 2,
  '5Y': 5,
  '10Y': 10,
}

export function rangeStartDate(range: TimeRange, today: Date = new Date()): Date {
  if (range === 'MAX') return new Date('1990-01-01')
  const years = RANGE_YEARS[range]
  const d = new Date(today)
  d.setFullYear(d.getFullYear() - years)
  return d
}

/** Filter an observation array to the requested range, client-side. */
export function clipRange<T extends FredObs>(series: T[], range: TimeRange): T[] {
  if (!series.length || range === 'MAX') return series
  const start = rangeStartDate(range)
  const startStr = start.toISOString().slice(0, 10)
  return series.filter((o) => o.date >= startStr)
}

export function latest<T extends FredObs>(series: T[]): T | undefined {
  return series.length ? series[series.length - 1] : undefined
}

export function pctChangeFromYearAgo(series: FredObs[]): number | null {
  if (series.length < 13) return null
  const last = series[series.length - 1].value
  const prev = series[series.length - 13].value
  if (!prev) return null
  return ((last - prev) / Math.abs(prev)) * 100
}

export function trendDirection(series: FredObs[], lookback = 6): 'up' | 'down' | 'flat' | null {
  if (series.length < lookback + 1) return null
  const last = series[series.length - 1].value
  const prev = series[series.length - 1 - lookback].value
  if (last === prev) return 'flat'
  return last > prev ? 'up' : 'down'
}
