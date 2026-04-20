/// <reference types="vite/client" />
import type { FredObs, TimeRange, YieldSurface } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

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

export async function fetchYieldSurface(range: TimeRange): Promise<YieldSurface> {
  const res = await fetch(`${API_BASE}/api/yield-curve?range=${range}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return {
    dates: data.dates,
    maturityLabels: data.maturityLabels,
    maturityYears: data.maturityYears,
    z: data.z,
  }
}

export async function fetchAllMacro(): Promise<Record<string, FredObs[]>> {
  const res = await fetch(`${API_BASE}/api/macro`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.series
}

export async function fetchCpiBreakdown(): Promise<{
  components: { id: string; label: string; color: string }[]
  series: Record<string, FredObs[]>
}> {
  const res = await fetch(`${API_BASE}/api/cpi-breakdown`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchSpreads(): Promise<{
  series: Record<string, FredObs[]>
}> {
  const res = await fetch(`${API_BASE}/api/spreads`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchGrocery(): Promise<{
  items: { id: string; label: string; unit: string; color: string }[]
  series: Record<string, FredObs[]>
}> {
  const res = await fetch(`${API_BASE}/api/grocery`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
