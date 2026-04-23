import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  fetchActivity,
  fetchAllMacro,
  fetchConsumer,
  fetchCpiBreakdown,
  fetchCreditConditions,
  fetchGrocery,
  fetchHealth,
  fetchHousing,
  fetchInflation,
  fetchLabor,
  fetchMarkets,
  fetchRecessionSignals,
  fetchSpreads,
  fetchYieldSurface,
  type ActivityResponse,
  type ConsumerResponse,
  type CpiBreakdownResponse,
  type CreditConditionsResponse,
  type GroceryResponse,
  type HealthResponse,
  type HousingResponse,
  type InflationResponse,
  type LaborResponse,
  type MacroResponse,
  type MarketsResponse,
  type RecessionSignalsResponse,
  type SpreadResponse,
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

export function useConsumer(range: TimeRange = '10Y'): UseQueryResult<ConsumerResponse> {
  return useQuery({ queryKey: ['consumer', range], queryFn: () => fetchConsumer(range), staleTime: FIVE_MIN })
}
