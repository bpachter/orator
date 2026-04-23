/**
 * Historical recession & crisis period definitions used for the
 * Crisis Comparison panel. Bookends are NBER recession start/end dates
 * augmented with informal "crisis" windows (1973-75, 1980-82, 1990-91,
 * 2001 dot-com, 2007-09 GFC, 2020 COVID).
 */
export interface CrisisPeriod {
  id: string
  name: string
  start: string
  end: string
  /** Short label for chart annotations */
  short: string
  description: string
  color: string
}

export const CRISIS_PERIODS: CrisisPeriod[] = [
  {
    id: 'oilshock-1973',
    name: '1973-75 Oil Shock Recession',
    short: "'73 Oil",
    start: '1973-11-01',
    end: '1975-03-31',
    description: 'OPEC oil embargo and stagflation',
    color: '#ef4444',
  },
  {
    id: 'volcker-1980',
    name: '1980 Volcker Recession',
    short: "'80 Volcker",
    start: '1980-01-01',
    end: '1980-07-31',
    description: 'Short, Fed-induced recession to break inflation',
    color: '#f97316',
  },
  {
    id: 'doubledip-1981',
    name: '1981-82 Double-Dip Recession',
    short: "'81-82",
    start: '1981-07-01',
    end: '1982-11-30',
    description: 'Severe recession from continued tight monetary policy',
    color: '#f59e0b',
  },
  {
    id: 'gulfwar-1990',
    name: '1990-91 Gulf War Recession',
    short: "'90-91",
    start: '1990-07-01',
    end: '1991-03-31',
    description: 'Oil price spike and S&L crisis fallout',
    color: '#eab308',
  },
  {
    id: 'dotcom-2001',
    name: '2001 Dot-Com Recession',
    short: "'01 Dotcom",
    start: '2001-03-01',
    end: '2001-11-30',
    description: 'Tech bubble burst',
    color: '#22c55e',
  },
  {
    id: 'gfc-2008',
    name: '2007-09 Global Financial Crisis',
    short: "'08 GFC",
    start: '2007-12-01',
    end: '2009-06-30',
    description: 'Subprime mortgage collapse and financial crisis',
    color: '#06b6d4',
  },
  {
    id: 'covid-2020',
    name: '2020 COVID-19 Recession',
    short: "'20 COVID",
    start: '2020-02-01',
    end: '2020-04-30',
    description: 'Pandemic-induced shutdown',
    color: '#8b5cf6',
  },
]

/**
 * Slice a series to a crisis window with a configurable lead-in (months
 * before start) and tail-out (months after end). Re-bases the date axis to
 * "months from period start" so multiple crises can be aligned.
 */
import type { FredObs } from '../types'

export interface AlignedCrisisSeries {
  crisis: CrisisPeriod
  /** months from start (negative = pre-crisis, 0 = crisis start, positive = into/after crisis) */
  monthOffsets: number[]
  values: number[]
  dates: string[]
}

export function alignToCrisis(
  series: FredObs[],
  crisis: CrisisPeriod,
  leadMonths = 6,
  tailMonths = 12,
): AlignedCrisisSeries {
  const start = new Date(crisis.start)
  const end = new Date(crisis.end)
  const fromMs = new Date(start.getFullYear(), start.getMonth() - leadMonths, 1).getTime()
  const toMs = new Date(end.getFullYear(), end.getMonth() + tailMonths, 1).getTime()
  const monthOffsets: number[] = []
  const values: number[] = []
  const dates: string[] = []
  for (const o of series) {
    const t = new Date(o.date).getTime()
    if (t < fromMs || t > toMs) continue
    const d = new Date(o.date)
    const offset =
      (d.getFullYear() - start.getFullYear()) * 12 +
      (d.getMonth() - start.getMonth()) +
      d.getDate() / 30
    monthOffsets.push(offset)
    values.push(o.value)
    dates.push(o.date)
  }
  return { crisis, monthOffsets, values, dates }
}
