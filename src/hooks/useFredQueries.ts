import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  fetchAllMacro,
  fetchCpiBreakdown,
  fetchCreditConditions,
  fetchGrocery,
  fetchHealth,
  fetchHousing,
  fetchInflation,
  fetchISMPMI,
  fetchLabor,
  fetchRecessionSignals,
  fetchSpreads,
  fetchYieldSurface,
  type CpiBreakdownResponse,
  type CreditConditionsResponse,
  type GroceryResponse,
  type HealthResponse,
  type HousingResponse,
  type InflationResponse,
  type ISMPMIResponse,
  type LaborResponse,
  type MacroResponse,
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

export function useLabor(): UseQueryResult<LaborResponse> {
  return useQuery({ queryKey: ['labor'], queryFn: fetchLabor, staleTime: FIVE_MIN })
}

export function useHousing(): UseQueryResult<HousingResponse> {
  return useQuery({ queryKey: ['housing'], queryFn: fetchHousing, staleTime: FIVE_MIN })
}

export function useRecessionSignals(): UseQueryResult<RecessionSignalsResponse> {
  return useQuery({
    queryKey: ['recession-signals'],
    queryFn: fetchRecessionSignals,
    staleTime: FIVE_MIN,
  })
}

export function useInflation(): UseQueryResult<InflationResponse> {
  return useQuery({ queryKey: ['inflation'], queryFn: fetchInflation, staleTime: FIVE_MIN })
}

export function useCreditConditions(): UseQueryResult<CreditConditionsResponse> {
  return useQuery({ queryKey: ['credit-conditions'], queryFn: fetchCreditConditions, staleTime: FIVE_MIN })
}

export function useISMPMI(): UseQueryResult<ISMPMIResponse> {
  return useQuery({ queryKey: ['ism-pmi'], queryFn: fetchISMPMI, staleTime: FIVE_MIN })
}
