import type { FredObs, TimeRange, YieldSurface } from '../types'

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'
// allorigins.win handles CORS reliably; avoid concurrent bursting (max ~2/s)
const PROXY = (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

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
  { id: 'FEDFUNDS',         label: 'Fed Funds Rate',        unit: '%', color: '#e8b84b' },
  { id: 'CPIAUCSL',         label: 'CPI (YoY %)',            unit: '%', color: '#ef4444' },
  { id: 'UNRATE',           label: 'Unemployment Rate',      unit: '%', color: '#4a9eff' },
  { id: 'A191RL1Q225SBEA',  label: 'Real GDP Growth (YoY)', unit: '%', color: '#22c55e' },
] as const

export function getStartDate(range: TimeRange): string {
  if (range === 'MAX') return '1990-01-01'
  const d = new Date()
  const years = { '1Y': 1, '2Y': 2, '5Y': 5, '10Y': 10 }[range]
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().slice(0, 10)
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function fetchSeries(
  id: string,
  start: string,
  end: string,
  apiKey: string
): Promise<FredObs[]> {
  const fredUrl =
    `${FRED_BASE}?series_id=${id}&api_key=${apiKey}&file_type=json` +
    `&observation_start=${start}&observation_end=${end}`

  const res = await fetch(PROXY(fredUrl))

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as Record<string, string>).error_message ?? `HTTP ${res.status} fetching ${id}`)
  }
  const data = await res.json() as { error_message?: string; observations?: { date: string; value: string }[] }
  if (data.error_message) throw new Error(data.error_message)
  if (!data.observations) throw new Error(`No observations returned for ${id}`)

  return data.observations
    .filter(o => o.value !== '.')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))
}

function resampleWeekly(obs: FredObs[]): FredObs[] {
  const weeks = new Map<string, FredObs>()
  for (const o of obs) {
    const d = new Date(o.date + 'T12:00:00Z')
    const thu = new Date(d)
    thu.setUTCDate(d.getUTCDate() + (4 - d.getUTCDay() + 7) % 7)
    const key = thu.toISOString().slice(0, 10)
    weeks.set(key, o)
  }
  return Array.from(weeks.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export async function fetchYieldSurface(
  range: TimeRange,
  apiKey: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<YieldSurface> {
  const start = getStartDate(range)
  const end = getTodayStr()
  const total = YIELD_MATURITIES.length

  // Sequential with 300ms gap — allorigins.win rate-limits concurrent bursts
  const allSeries: FredObs[][] = []
  for (let i = 0; i < total; i++) {
    if (i > 0) await sleep(300)
    const data = await fetchSeries(YIELD_MATURITIES[i].id, start, end, apiKey)
    allSeries.push(data)
    onProgress?.(i + 1, total)
  }

  const weekly = allSeries.map(resampleWeekly)
  const sets = weekly.map(s => new Set(s.map(o => o.date)))
  const commonDates = weekly[0]
    .map(o => o.date)
    .filter(d => sets.every(s => s.has(d)))
    .sort()

  const maps = weekly.map(s => {
    const m = new Map<string, number>()
    s.forEach(o => m.set(o.date, o.value))
    return m
  })

  const z = commonDates.map(d => maps.map(m => m.get(d) ?? NaN))

  return {
    dates: commonDates,
    maturityLabels: YIELD_MATURITIES.map(m => m.label),
    maturityYears: YIELD_MATURITIES.map(m => m.years),
    z,
  }
}
