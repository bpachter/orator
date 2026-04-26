/// <reference types="vite/client" />
import type { FredObs, TimeRange, YieldSurface } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

interface ApiErrorBody {
  error?: { code?: string; message?: string }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as ApiErrorBody
      if (body?.error?.message) detail = body.error.message
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

export const YIELD_MATURITIES = [
  { id: 'DGS3MO', label: '3M', years: 0.25 },
  { id: 'DGS6MO', label: '6M', years: 0.5 },
  { id: 'DGS1', label: '1Y', years: 1 },
  { id: 'DGS2', label: '2Y', years: 2 },
  { id: 'DGS3', label: '3Y', years: 3 },
  { id: 'DGS5', label: '5Y', years: 5 },
  { id: 'DGS7', label: '7Y', years: 7 },
  { id: 'DGS10', label: '10Y', years: 10 },
  { id: 'DGS20', label: '20Y', years: 20 },
  { id: 'DGS30', label: '30Y', years: 30 },
] as const

export const MACRO_SERIES = [
  { id: 'FEDFUNDS', label: 'Fed Funds Rate', unit: '%', color: '#d7b46a' },
  { id: 'CPIAUCSL', label: 'CPI (YoY %)', unit: '%', color: '#c98f5a' },
  { id: 'UNRATE', label: 'Unemployment Rate', unit: '%', color: '#6d91c9' },
  { id: 'A191RL1Q225SBEA', label: 'Real GDP Growth (YoY)', unit: '%', color: '#6fa49a' },
] as const

export interface MacroResponse {
  updated: string
  series: Record<string, FredObs[]>
}

export interface CpiBreakdownResponse {
  updated: string
  components: { id: string; label: string; color: string }[]
  series: Record<string, FredObs[]>
}

export interface SpreadResponse {
  updated: string
  series: Record<string, FredObs[]>
}

export interface GroceryResponse {
  updated: string
  items: { id: string; label: string; unit: string; color: string }[]
  series: Record<string, FredObs[]>
}

export interface HealthResponse {
  status: string
  fred_key: boolean
  eia_key?: boolean
  alphavantage_key?: boolean
  bea_key?: boolean
  census_key?: boolean
  version?: string
}

export interface SeriesMetadata {
  id: string
  label: string
  color: string
  unit?: string | null
}

export interface LaborResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface HousingResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface InflationResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface CreditConditionsResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface ActivityResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface MarketsResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface EnergyResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface FiscalResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface MarketPricesResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface ConsumerResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface GlobalMacroResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface VolatilityResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface GdpComponent {
  id: string
  label: string
  color: string
  data: FredObs[]  // date field is "2024Q3" BEA period format
}

export interface GdpBreakdownResponse {
  updated: string
  components: GdpComponent[]
}

export interface GlobalCreditSeries {
  country: string
  label: string
  color: string
  data: FredObs[]
}

export interface GlobalCreditResponse {
  updated: string
  series: GlobalCreditSeries[]
}

export interface TradeResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface RecessionSignal {
  id: string
  label: string
  value: number | null
  triggered: boolean
  description: string
  category: string
  weight: number
  severity: string
}

export interface RecessionSignalsResponse {
  updated: string
  composite_score: number
  stagflation_score: number
  signals: RecessionSignal[]
  series: Record<string, FredObs[]>
}

export interface MetricsResponse {
  requests_total: number
  cache_hits: number
  cache_misses: number
  upstream_errors: number
  uptime_seconds: number
}

export function fetchYieldSurface(
  range: TimeRange,
): Promise<YieldSurface & { updated?: string }> {
  return request(`/api/yield-curve?range=${range}`)
}

export function fetchAllMacro(range: TimeRange = '10Y'): Promise<MacroResponse> {
  return request(`/api/macro?range=${range}`)
}

export function fetchCpiBreakdown(range: TimeRange = '10Y'): Promise<CpiBreakdownResponse> {
  return request(`/api/cpi-breakdown?range=${range}`)
}

export function fetchSpreads(range: TimeRange = '10Y'): Promise<SpreadResponse> {
  return request(`/api/spreads?range=${range}`)
}

export function fetchGrocery(range: TimeRange = '10Y'): Promise<GroceryResponse> {
  return request(`/api/grocery?range=${range}`)
}

export function fetchHealth(): Promise<HealthResponse> {
  return request('/api/health')
}

export function fetchLabor(range: TimeRange = '10Y'): Promise<LaborResponse> {
  return request(`/api/labor?range=${range}`)
}

export function fetchHousing(range: TimeRange = '10Y'): Promise<HousingResponse> {
  return request(`/api/housing?range=${range}`)
}

export function fetchRecessionSignals(range: TimeRange = '10Y'): Promise<RecessionSignalsResponse> {
  return request(`/api/recession-signals?range=${range}`)
}

export function fetchInflation(range: TimeRange = '10Y'): Promise<InflationResponse> {
  return request(`/api/inflation?range=${range}`)
}

export function fetchCreditConditions(range: TimeRange = '10Y'): Promise<CreditConditionsResponse> {
  return request(`/api/credit-conditions?range=${range}`)
}

export function fetchActivity(range: TimeRange = '10Y'): Promise<ActivityResponse> {
  return request(`/api/activity?range=${range}`)
}

export function fetchMarkets(range: TimeRange = '10Y'): Promise<MarketsResponse> {
  return request(`/api/markets?range=${range}`)
}

export function fetchEnergy(range: TimeRange = '10Y'): Promise<EnergyResponse> {
  return request(`/api/energy?range=${range}`)
}

export function fetchFiscal(range: TimeRange = '10Y'): Promise<FiscalResponse> {
  return request(`/api/fiscal?range=${range}`)
}

export function fetchMarketPrices(range: TimeRange = '5Y'): Promise<MarketPricesResponse> {
  return request(`/api/market-prices?range=${range}`)
}

export function fetchConsumer(range: TimeRange = '10Y'): Promise<ConsumerResponse> {
  return request(`/api/consumer?range=${range}`)
}

export function fetchGlobalMacro(range: TimeRange = '10Y'): Promise<GlobalMacroResponse> {
  return request(`/api/global-macro?range=${range}`)
}

export function fetchVolatility(range: TimeRange = '10Y'): Promise<VolatilityResponse> {
  return request(`/api/volatility?range=${range}`)
}

export function fetchGdpBreakdown(): Promise<GdpBreakdownResponse> {
  return request('/api/gdp-breakdown')
}

export function fetchGlobalCredit(): Promise<GlobalCreditResponse> {
  return request('/api/global-credit')
}

export function fetchTrade(range: TimeRange = '10Y'): Promise<TradeResponse> {
  return request(`/api/trade?range=${range}`)
}

export function fetchMetrics(): Promise<MetricsResponse> {
  return request('/api/metrics')
}
