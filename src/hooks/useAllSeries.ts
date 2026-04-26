/**
 * useAllSeries — fetches every endpoint in parallel and produces a flat
 * lookup of indicator id → observations + meta. Powers Heatmap, Correlation
 * Matrix, Compare, Custom Dashboard, Command Bar, etc.
 */
import { useMemo } from 'react'
import {
  useActivity,
  useConsumer,
  useCorporateEarnings,
  useCreditConditions,
  useEnergy,
  useFiscal,
  useGlobalMacro,
  useGdpBreakdown,
  useGlobalCredit,
  useHousing,
  useInflation,
  useLabor,
  useMarketPrices,
  useMacro,
  useMarkets,
  useMonetaryConditions,
  useRecessionSignals,
  useSpreads,
  useTrade,
  useVolatility,
} from './useFredQueries'
import type { FredObs, TimeRange } from '../types'
import { INDICATOR_REGISTRY, type IndicatorMeta, type EndpointKey } from '../utils/seriesRegistry'

export interface IndicatorBundle {
  meta: IndicatorMeta
  data: FredObs[]
}

export interface AllSeriesState {
  isLoading: boolean
  isError: boolean
  bundles: IndicatorBundle[]
  byId: Map<string, IndicatorBundle>
  /** Latest "updated" timestamp across all endpoints */
  updated?: string
  /** Map endpoint → series response dict; useful for one-off lookups */
  endpoints: Partial<Record<EndpointKey, Record<string, FredObs[]>>>
}

export function useAllSeries(range: TimeRange = '10Y'): AllSeriesState {
  const macro = useMacro(range)
  const labor = useLabor(range)
  const inflation = useInflation(range)
  const activity = useActivity(range)
  const spreads = useSpreads(range)
  const recession = useRecessionSignals(range)
  const housing = useHousing(range)
  const consumer = useConsumer(range)
  const credit = useCreditConditions(range)
  const markets = useMarkets(range)
  const marketPrices = useMarketPrices(range)
  const energy = useEnergy(range)
  const fiscal = useFiscal(range)
  const globalMacro = useGlobalMacro(range)
  const gdpBreakdown = useGdpBreakdown()
  const globalCredit = useGlobalCredit()
  const trade = useTrade(range)
  const volatility = useVolatility(range)
  const corporateEarnings = useCorporateEarnings()
  const monetaryConditions = useMonetaryConditions(range)

  return useMemo(() => {
    const endpoints: AllSeriesState['endpoints'] = {
      macro: macro.data?.series,
      labor: labor.data?.series,
      inflation: inflation.data?.series,
      activity: activity.data?.series,
      spreads: spreads.data?.series,
      recession: recession.data?.series,
      housing: housing.data?.series,
      consumer: consumer.data?.series,
      credit: credit.data?.series,
      markets: markets.data?.series,
      'market-prices': marketPrices.data?.series,
      energy: energy.data?.series,
      fiscal: fiscal.data?.series,
      'global-macro': globalMacro.data?.series,
      volatility: volatility.data?.series,
      // GDP Breakdown: components array → convert to series dict keyed by component id
      'gdp-breakdown': gdpBreakdown.data?.components
        ? Object.fromEntries(gdpBreakdown.data.components.map((c) => [c.id, c.data]))
        : undefined,
      // Global Credit: array of country series → convert to dict keyed by country iso
      'global-credit': globalCredit.data?.series
        ? Object.fromEntries(globalCredit.data.series.map((s) => [`BIS_CREDIT_${s.country}`, s.data]))
        : undefined,
      trade: trade.data?.series,
      // Corporate Earnings: flat series from endpoint
      'corporate-earnings': {
        PROFITS: corporateEarnings.data?.profits ?? [],
        NET_MARGIN: corporateEarnings.data?.net_margin ?? [],
        OP_MARGIN: corporateEarnings.data?.operating_margin ?? [],
        EARNINGS: corporateEarnings.data?.earnings_per_share ?? [],
        PE10: corporateEarnings.data?.pe_ratio ?? [],
      },
      // Monetary Conditions: series dict from endpoint
      'monetary-conditions': monetaryConditions.data?.series,
    }

    const bundles: IndicatorBundle[] = INDICATOR_REGISTRY.map((meta) => {
      const dict = endpoints[meta.endpoint]
      const data = dict?.[meta.id] ?? []
      return { meta, data }
    })

    const byId = new Map(bundles.map((b) => [b.meta.id, b]))

    const updated = [
      macro.data?.updated,
      labor.data?.updated,
      inflation.data?.updated,
      activity.data?.updated,
      spreads.data?.updated,
      housing.data?.updated,
      consumer.data?.updated,
      credit.data?.updated,
      markets.data?.updated,
      marketPrices.data?.updated,
      energy.data?.updated,
      fiscal.data?.updated,
      globalMacro.data?.updated,
      volatility.data?.updated,
      gdpBreakdown.data?.updated,
      globalCredit.data?.updated,
      trade.data?.updated,
      corporateEarnings.data?.updated,
      monetaryConditions.data?.updated,
    ]
      .filter(Boolean)
      .sort()
      .pop()

    return {
      isLoading:
        macro.isLoading || labor.isLoading || inflation.isLoading || activity.isLoading ||
        spreads.isLoading || recession.isLoading || housing.isLoading || consumer.isLoading ||
        credit.isLoading || markets.isLoading || marketPrices.isLoading || energy.isLoading || fiscal.isLoading ||
        globalMacro.isLoading || volatility.isLoading ||
        gdpBreakdown.isLoading || globalCredit.isLoading || trade.isLoading ||
        corporateEarnings.isLoading || monetaryConditions.isLoading,
      isError:
        macro.isError || labor.isError || inflation.isError || activity.isError ||
        spreads.isError || housing.isError || consumer.isError || credit.isError || markets.isError || marketPrices.isError || energy.isError || fiscal.isError ||
        globalMacro.isError || volatility.isError || trade.isError ||
        corporateEarnings.isError || monetaryConditions.isError,
      bundles,
      byId,
      updated,
      endpoints,
    }
  }, [macro, labor, inflation, activity, spreads, recession, housing, consumer, credit, markets, marketPrices, energy, fiscal, globalMacro, volatility, gdpBreakdown, globalCredit, trade, corporateEarnings, monetaryConditions])
}
