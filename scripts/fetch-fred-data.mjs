/**
 * Fetches all FRED series needed by Orator and writes them to public/data/.
 * Run locally:  FRED_API_KEY=your_key node scripts/fetch-fred-data.mjs
 * Run in CI:    FRED_API_KEY set as GitHub Secret, triggered by workflow.
 */

import { writeFileSync, mkdirSync } from 'fs'

const API_KEY = process.env.FRED_API_KEY
if (!API_KEY) { console.error('FRED_API_KEY not set'); process.exit(1) }

const BASE = 'https://api.stlouisfed.org/fred/series/observations'
const START = '1990-01-01'
const END   = new Date().toISOString().slice(0, 10)

const YIELD_IDS = ['DGS3MO','DGS6MO','DGS1','DGS2','DGS3','DGS5','DGS7','DGS10','DGS20','DGS30']
const MACRO_IDS = ['FEDFUNDS','CPIAUCSL','UNRATE','A191RL1Q225SBEA']

async function fetchSeries(id, extra = {}) {
  const p = new URLSearchParams({
    series_id: id, api_key: API_KEY, file_type: 'json',
    observation_start: START, observation_end: END, ...extra,
  })
  const res = await fetch(`${BASE}?${p}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${id}`)
  const json = await res.json()
  if (json.error_message) throw new Error(`FRED: ${json.error_message}`)
  return json.observations
    .filter(o => o.value !== '.')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))
}

mkdirSync('public/data', { recursive: true })

// Yield curve — request weekly end-of-period from FRED (5x less data than daily)
console.log('Fetching yield curve series...')
const yieldData = {}
for (const id of YIELD_IDS) {
  process.stdout.write(`  ${id}... `)
  yieldData[id] = await fetchSeries(id, { frequency: 'w', aggregation_method: 'eop' })
  console.log(`${yieldData[id].length} obs`)
}
writeFileSync('public/data/yield-curve.json', JSON.stringify({
  updated: new Date().toISOString(),
  series: yieldData,
}))
console.log('Wrote public/data/yield-curve.json')

// Macro series
console.log('Fetching macro series...')
const macroData = {}
for (const id of MACRO_IDS) {
  process.stdout.write(`  ${id}... `)
  macroData[id] = await fetchSeries(id)
  console.log(`${macroData[id].length} obs`)
}
writeFileSync('public/data/macro.json', JSON.stringify({
  updated: new Date().toISOString(),
  series: macroData,
}))
console.log('Wrote public/data/macro.json')
console.log('Done.')
