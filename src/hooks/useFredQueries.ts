import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  fetchAllMacro,
  fetchCpiBreakdown,
  fetchGrocery,
  fetchHealth,
  fetchSpreads,
  fetchYieldSurface,
  type CpiBreakdownResponse,
  type GroceryResponse,
  type HealthResponse,
  type MacroResponse,
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

export function useMacro(): UseQueryResult<MacroResponse> {
  return useQuery({ queryKey: ['macro'], queryFn: fetchAllMacro, staleTime: FIVE_MIN })
}

export function useCpiBreakdown(): UseQueryResult<CpiBreakdownResponse> {
  return useQuery({ queryKey: ['cpi-breakdown'], queryFn: fetchCpiBreakdown, staleTime: FIVE_MIN })
}

export function useSpreads(): UseQueryResult<SpreadResponse> {
  return useQuery({ queryKey: ['spreads'], queryFn: fetchSpreads, staleTime: FIVE_MIN })
}

export function useGrocery(): UseQueryResult<GroceryResponse> {
  return useQuery({ queryKey: ['grocery'], queryFn: fetchGrocery, staleTime: FIVE_MIN })
}

export function useHealth(): UseQueryResult<HealthResponse> {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}
