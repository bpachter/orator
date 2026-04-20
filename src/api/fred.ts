import type { FredObs, TimeRange, YieldSurface } from '../types'

export const YIELD_MATURITIES = [
  { id: 'DGS3MO', label: '3M',  years: 0.25 },
  { id: 'DGS6MO', label: '6M',  years: 0.5  },
  { id: 'DGS1',   label: '1Y',  years: 1    },
  { id: 'DGS2',   label: '2Y',  years: 2    },
  { id: 'DGS3',   label: '3Y',  years: 3    },
  { id: 'DGS5',   label: '5Y',  years: 5    },
  { id: 'DGS7',   label: '7Y',  years: 7    },
  { id: 'DGS10',  label: '10Y', years: 10   },
  { id: 'DGS20',  label: '20Y', years: 20   },
  { id: 'DGS30',  label: '30Y', years: 30   },
] as const

export const MACRO_SERIES = [
  { id: 'FEDFUNDS',        label: 'Fed Funds Rate',       unit: '%', color: '#e8b84b' },
  { id: 'CPIAUCSL',        label: 'CPI (YoY %)',           unit: '%', color: '#ef4444' },
  { id: 'UNRATE',          label: 'Unemployment Rate',     unit: '%', color: '#4a9eff' },
  { id: 'A191RL1Q225SBEA', label: 'Real GDP Growth (YoY)', unit: '%', color: '#22c55e' },
] as const

export function getStartDate(range: TimeRange): string {
  if (range === 'MAX') return '1990-01-01'
  const d = new Date()
  const years = { '1Y': 1, '2Y': 2, '5Y': 5, '10Y': 10 }[range]
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().slice(0, 10)
}

type StaticYieldFile = {
  updated: string
  series: Record<string, FredObs[]>
}

type StaticMacroFile = {
  updated: string
  series: Record<string, FredObs[]>
}

const DATA_BASE = import.meta.env.BASE_URL + 'data/'

export async function fetchYieldSurface(
  range: TimeRange,
  onProgress?: (loaded: number, total: number) => void
): Promise<YieldSurface> {
  const res = await fetch(DATA_BASE + 'yield-curve.json')
  if (!res.ok) throw new Error(`Failed to load yield data (HTTP ${res.status})`)
  const file: StaticYieldFile = await res.json()

  const startDate = getStartDate(range)
  const total = YIELD_MATURITIES.length

  const allSeries = YIELD_MATURITIES.map((m, i) => {
    const raw = file.series[m.id] ?? []
    onProgress?.(i + 1, total)
    return raw.filter(o => o.date >= startDate)
  })

  const sets = allSeries.map(s => new Set(s.map(o => o.date)))
  const commonDates = allSeries[0]
    .map(o => o.date)
    .filter(d => sets.every(s => s.has(d)))
    .sort()

  const maps = allSeries.map(s => {
    const m = new Map<string, number>()
    s.forEach(o => m.set(o.date, o.value))
    return m
  })

  return {
    dates: commonDates,
    maturityLabels: YIELD_MATURITIES.map(m => m.label),
    maturityYears: YIELD_MATURITIES.map(m => m.years),
    z: commonDates.map(d => maps.map(m => m.get(d) ?? NaN)),
  }
}

export async function fetchAllMacro(): Promise<Record<string, FredObs[]>> {
  const res = await fetch(DATA_BASE + 'macro.json')
  if (!res.ok) throw new Error(`Failed to load macro data (HTTP ${res.status})`)
  const file: StaticMacroFile = await res.json()
  return file.series
}
