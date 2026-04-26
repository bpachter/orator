import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  fetchActivity,
  fetchAllMacro,
  fetchConsumer,
  fetchCpiBreakdown,
  fetchCreditConditions,
  fetchEnergy,
  fetchFiscal,
  fetchGlobalMacro,
  fetchGdpBreakdown,
  fetchGlobalCredit,
  fetchGrocery,
  fetchHealth,
  fetchHousing,
  fetchInflation,
  fetchLabor,
  fetchMarketPrices,
  fetchMarkets,
  fetchRecessionSignals,
  fetchSpreads,
  fetchTrade,
  fetchVolatility,
  fetchYieldSurface,
  type ActivityResponse,
  type ConsumerResponse,
  type CpiBreakdownResponse,
  type CreditConditionsResponse,
  type EnergyResponse,
  type FiscalResponse,
  type GlobalMacroResponse,
  type GdpBreakdownResponse,
  type GlobalCreditResponse,
  type GroceryResponse,
  type HealthResponse,
  type HousingResponse,
  type InflationResponse,
  type LaborResponse,
  type MarketPricesResponse,
  type MacroResponse,
  type MarketsResponse,
  type RecessionSignalsResponse,
  type SpreadResponse,
  type TradeResponse,
  type VolatilityResponse,
} from '../api/fred'
import type { TimeRange, YieldSurface } from '../types'

const FIVE_MIN = 5 * 60 * 1000

export function useYieldSurface(
  range: TimeRange,
): UseQueryResult<YieldSurface & { updated?: string }> {
  return useQuery({
    queryKey: ['yield-curve', range],
    queryFn: () => fetchYieldSurface(range),
    staleTime: FIVE_MIN,
  })
}

export function useMacro(range: TimeRange = '10Y'): UseQueryResult<MacroResponse> {
  return useQuery({ queryKey: ['macro', range], queryFn: () => fetchAllMacro(range), staleTime: FIVE_MIN })
}

export function useCpiBreakdown(range: TimeRange = '10Y'): UseQueryResult<CpiBreakdownResponse> {
  return useQuery({ queryKey: ['cpi-breakdown', range], queryFn: () => fetchCpiBreakdown(range), staleTime: FIVE_MIN })
}

export function useSpreads(range: TimeRange = '10Y'): UseQueryResult<SpreadResponse> {
  return useQuery({ queryKey: ['spreads', range], queryFn: () => fetchSpreads(range), staleTime: FIVE_MIN })
}

export function useGrocery(range: TimeRange = '10Y'): UseQueryResult<GroceryResponse> {
  return useQuery({ queryKey: ['grocery', range], queryFn: () => fetchGrocery(range), staleTime: FIVE_MIN })
}

export function useHealth(): UseQueryResult<HealthResponse> {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useLabor(range: TimeRange = '10Y'): UseQueryResult<LaborResponse> {
  return useQuery({ queryKey: ['labor', range], queryFn: () => fetchLabor(range), staleTime: FIVE_MIN })
}

export function useHousing(range: TimeRange = '10Y'): UseQueryResult<HousingResponse> {
  return useQuery({ queryKey: ['housing', range], queryFn: () => fetchHousing(range), staleTime: FIVE_MIN })
}

export function useRecessionSignals(range: TimeRange = '10Y'): UseQueryResult<RecessionSignalsResponse> {
  return useQuery({
    queryKey: ['recession-signals', range],
    queryFn: () => fetchRecessionSignals(range),
    staleTime: FIVE_MIN,
  })
}

export function useInflation(range: TimeRange = '10Y'): UseQueryResult<InflationResponse> {
  return useQuery({ queryKey: ['inflation', range], queryFn: () => fetchInflation(range), staleTime: FIVE_MIN })
}

export function useCreditConditions(range: TimeRange = '10Y'): UseQueryResult<CreditConditionsResponse> {
  return useQuery({ queryKey: ['credit-conditions', range], queryFn: () => fetchCreditConditions(range), staleTime: FIVE_MIN })
}

export function useActivity(range: TimeRange = '10Y'): UseQueryResult<ActivityResponse> {
  return useQuery({ queryKey: ['activity', range], queryFn: () => fetchActivity(range), staleTime: FIVE_MIN })
}

export function useMarkets(range: TimeRange = '10Y'): UseQueryResult<MarketsResponse> {
  return useQuery({ queryKey: ['markets', range], queryFn: () => fetchMarkets(range), staleTime: FIVE_MIN })
}

export function useEnergy(range: TimeRange = '10Y'): UseQueryResult<EnergyResponse> {
  return useQuery({ queryKey: ['energy', range], queryFn: () => fetchEnergy(range), staleTime: FIVE_MIN })
}

export function useFiscal(range: TimeRange = '10Y'): UseQueryResult<FiscalResponse> {
  return useQuery({ queryKey: ['fiscal', range], queryFn: () => fetchFiscal(range), staleTime: FIVE_MIN })
}

export function useMarketPrices(range: TimeRange = '5Y'): UseQueryResult<MarketPricesResponse> {
  return useQuery({ queryKey: ['market-prices', range], queryFn: () => fetchMarketPrices(range), staleTime: FIVE_MIN })
}

export function useConsumer(range: TimeRange = '10Y'): UseQueryResult<ConsumerResponse> {
  return useQuery({ queryKey: ['consumer', range], queryFn: () => fetchConsumer(range), staleTime: FIVE_MIN })
}

export function useGlobalMacro(range: TimeRange = '10Y'): UseQueryResult<GlobalMacroResponse> {
  return useQuery({ queryKey: ['global-macro', range], queryFn: () => fetchGlobalMacro(range), staleTime: FIVE_MIN })
}

export function useVolatility(range: TimeRange = '10Y'): UseQueryResult<VolatilityResponse> {
  return useQuery({ queryKey: ['volatility', range], queryFn: () => fetchVolatility(range), staleTime: FIVE_MIN })
}

export function useGdpBreakdown(): UseQueryResult<GdpBreakdownResponse> {
  return useQuery({ queryKey: ['gdp-breakdown'], queryFn: fetchGdpBreakdown, staleTime: FIVE_MIN })
}

export function useGlobalCredit(): UseQueryResult<GlobalCreditResponse> {
  return useQuery({ queryKey: ['global-credit'], queryFn: fetchGlobalCredit, staleTime: FIVE_MIN })
}

export function useTrade(range: TimeRange = '10Y'): UseQueryResult<TradeResponse> {
  return useQuery({ queryKey: ['trade', range], queryFn: () => fetchTrade(range), staleTime: FIVE_MIN })
}
