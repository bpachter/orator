/**
 * Statistical utilities for macro analysis: mean, stdev, z-score, percentile
 * rank, Pearson correlation, period-over-period % change.
 *
 * All functions are pure and accept FredObs[] (date/value) or number[].
 */
import type { FredObs } from '../types'

export function values(series: FredObs[]): number[] {
  return series.map((o) => o.value).filter((v) => Number.isFinite(v))
}

export function mean(arr: number[]): number {
  if (!arr.length) return NaN
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export function stdev(arr: number[]): number {
  if (arr.length < 2) return NaN
  const m = mean(arr)
  const sq = arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(sq)
}

export function min(arr: number[]): number {
  if (!arr.length) return NaN
  return Math.min(...arr)
}

export function max(arr: number[]): number {
  if (!arr.length) return NaN
  return Math.max(...arr)
}

export function zScore(value: number, arr: number[]): number {
  const sd = stdev(arr)
  if (!Number.isFinite(sd) || sd === 0) return 0
  return (value - mean(arr)) / sd
}

/** Returns percentile rank (0-100) of `value` within `arr`. */
export function percentileRank(value: number, arr: number[]): number {
  if (!arr.length) return NaN
  const below = arr.filter((v) => v < value).length
  const equal = arr.filter((v) => v === value).length
  return ((below + 0.5 * equal) / arr.length) * 100
}

/** Pearson correlation coefficient. Returns NaN if arrays differ in length or are < 2. */
export function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 2) return NaN
  const xs = x.slice(0, n)
  const ys = y.slice(0, n)
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx2 = 0
  let dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    const dy = ys[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  if (denom === 0) return 0
  return num / denom
}

/**
 * Align two FredObs series on their shared dates and return parallel value arrays.
 * Useful for correlation / scatter-plot analysis.
 */
export function alignSeries(a: FredObs[], b: FredObs[]): { x: number[]; y: number[]; dates: string[] } {
  const mapA = new Map(a.map((o) => [o.date, o.value]))
  const xs: number[] = []
  const ys: number[] = []
  const dates: string[] = []
  for (const o of b) {
    const va = mapA.get(o.date)
    if (va !== undefined && Number.isFinite(va) && Number.isFinite(o.value)) {
      xs.push(va)
      ys.push(o.value)
      dates.push(o.date)
    }
  }
  return { x: xs, y: ys, dates }
}

/**
 * Simple period-over-period change finder. For each lookback in days,
 * walks back to the closest observation N days before the latest point
 * and computes absolute and percentage change.
 */
export function changeOverDays(series: FredObs[], days: number): { abs: number; pct: number } | null {
  if (series.length < 2) return null
  const last = series[series.length - 1]
  const targetMs = new Date(last.date).getTime() - days * 86400000
  // Walk backwards to find the closest observation at-or-before target date
  let prev: FredObs | null = null
  for (let i = series.length - 2; i >= 0; i--) {
    const t = new Date(series[i].date).getTime()
    if (t <= targetMs) {
      prev = series[i]
      break
    }
  }
  if (!prev) prev = series[0]
  const abs = last.value - prev.value
  const pct = prev.value !== 0 ? (abs / Math.abs(prev.value)) * 100 : 0
  return { abs, pct }
}

/** Convenience: rolling change buckets (1W, 1M, 3M, 1Y) for a series. */
export function rollingChanges(series: FredObs[]): {
  '1W': number | null
  '1M': number | null
  '3M': number | null
  '1Y': number | null
} {
  return {
    '1W': changeOverDays(series, 7)?.pct ?? null,
    '1M': changeOverDays(series, 30)?.pct ?? null,
    '3M': changeOverDays(series, 90)?.pct ?? null,
    '1Y': changeOverDays(series, 365)?.pct ?? null,
  }
}

export interface SeriesStats {
  count: number
  latest: number | null
  latestDate: string | null
  mean: number
  stdev: number
  min: number
  max: number
  zscore: number
  percentile: number
}

export function summarize(series: FredObs[]): SeriesStats {
  const v = values(series)
  if (!v.length) {
    return { count: 0, latest: null, latestDate: null, mean: NaN, stdev: NaN, min: NaN, max: NaN, zscore: NaN, percentile: NaN }
  }
  const last = v[v.length - 1]
  return {
    count: v.length,
    latest: last,
    latestDate: series[series.length - 1].date,
    mean: mean(v),
    stdev: stdev(v),
    min: min(v),
    max: max(v),
    zscore: zScore(last, v),
    percentile: percentileRank(last, v),
  }
}

/**
 * Normalize a series to a 0-100 scale (min=0, max=100). Used by the
 * Compare panel to bring two series with very different units onto a
 * shared visual axis.
 */
export function normalize01(arr: number[]): number[] {
  const lo = min(arr)
  const hi = max(arr)
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi === lo) return arr.map(() => 50)
  return arr.map((v) => ((v - lo) / (hi - lo)) * 100)
}
