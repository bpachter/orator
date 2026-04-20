import type { FredObs, TimeRange, YieldSurface } from '../types'

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

type FredApiResponse = {
  error_message?: string
  observations?: { date: string; value: string }[]
}

// FRED supports JSONP via &callback= — no CORS proxy needed, no rate limits.
function fredJsonp(fredUrl: string, timeoutMs = 15000): Promise<FredApiResponse> {
  return new Promise((resolve, reject) => {
    const cbName = `_fredCb${Date.now()}${Math.floor(Math.random() * 1e6)}`
    let settled = false

    const cleanup = () => {
      settled = true
      clearTimeout(timer)
      delete (window as unknown as Record<string, unknown>)[cbName]
      document.getElementById(cbName)?.remove()
    }

    const timer = setTimeout(() => {
      if (!settled) { cleanup(); reject(new Error('FRED request timed out')) }
    }, timeoutMs)

    ;(window as unknown as Record<string, unknown>)[cbName] = (data: FredApiResponse) => {
      cleanup(); resolve(data)
    }

    const script = document.createElement('script')
    script.id = cbName
    script.src = `${fredUrl}&callback=${cbName}`
    script.onerror = () => { cleanup(); reject(new Error('Failed to reach FRED API')) }
    document.head.appendChild(script)
  })
}

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

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function fetchSeries(
  id: string,
  start: string,
  end: string,
  apiKey: string,
  extraParams: Record<string, string> = {}
): Promise<FredObs[]> {
  const params = new URLSearchParams({
    series_id: id,
    api_key: apiKey,
    file_type: 'json',
    observation_start: start,
    observation_end: end,
    ...extraParams,
  })
  const data = await fredJsonp(`${FRED_BASE}?${params.toString()}`)
  if (data.error_message) throw new Error(data.error_message)
  if (!data.observations) throw new Error(`No observations for ${id}`)

  return data.observations
    .filter(o => o.value !== '.')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))
}

export async function fetchYieldSurface(
  range: TimeRange,
  apiKey: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<YieldSurface> {
  const start = getStartDate(range)
  const end = getTodayStr()
  const total = YIELD_MATURITIES.length

  // Request weekly end-of-period directly — 5x less data than daily.
  // Small delay between calls to be a good API citizen.
  const allSeries: FredObs[][] = []
  for (let i = 0; i < total; i++) {
    if (i > 0) await sleep(200)
    const data = await fetchSeries(
      YIELD_MATURITIES[i].id, start, end, apiKey,
      { frequency: 'w', aggregation_method: 'eop' }
    )
    allSeries.push(data)
    onProgress?.(i + 1, total)
  }

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
