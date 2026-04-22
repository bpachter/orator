import { describe, expect, it } from 'vitest'
import { clipRange, latest, pctChangeFromYearAgo, trendDirection } from '../utils/series'

const monthly = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    date: `2020-${String((i % 12) + 1).padStart(2, '0')}-01`,
    value: i + 1,
  }))

describe('series utils', () => {
  it('latest returns the last observation', () => {
    expect(latest([{ date: '2024-01-01', value: 1 }])?.value).toBe(1)
    expect(latest([])).toBeUndefined()
  })

  it('pctChangeFromYearAgo returns null for short series', () => {
    expect(pctChangeFromYearAgo(monthly(5))).toBeNull()
  })

  it('pctChangeFromYearAgo computes YoY for 13+ point series', () => {
    const v = pctChangeFromYearAgo(monthly(13))
    expect(v).not.toBeNull()
    // 13 vs 1 -> 1200%
    expect(v).toBeCloseTo(1200, 0)
  })

  it('trendDirection detects up/down/flat', () => {
    const up = monthly(10)
    expect(trendDirection(up, 6)).toBe('up')
    const down = up.slice().reverse().map((o, i) => ({ ...o, value: -i }))
    expect(trendDirection(down, 6)).toBe('down')
  })

  it('clipRange returns input unchanged for MAX', () => {
    const series = monthly(3)
    expect(clipRange(series, 'MAX')).toEqual(series)
  })
})
