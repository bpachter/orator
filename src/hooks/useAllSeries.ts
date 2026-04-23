/**
 * useAllSeries — fetches every endpoint in parallel and produces a flat
 * lookup of indicator id → observations + meta. Powers Heatmap, Correlation
 * Matrix, Compare, Custom Dashboard, Command Bar, etc.
 */
import { useMemo } from 'react'
import {
  useActivity,
  useConsumer,
  useCreditConditions,
  useHousing,
  useInflation,
  useLabor,
  useMacro,
  useMarkets,
  useRecessionSignals,
  useSpreads,
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
    ]
      .filter(Boolean)
      .sort()
      .pop()

    return {
      isLoading:
        macro.isLoading || labor.isLoading || inflation.isLoading || activity.isLoading ||
        spreads.isLoading || recession.isLoading || housing.isLoading || consumer.isLoading ||
        credit.isLoading || markets.isLoading,
      isError:
        macro.isError || labor.isError || inflation.isError || activity.isError ||
        spreads.isError || housing.isError || consumer.isError || credit.isError || markets.isError,
      bundles,
      byId,
      updated,
      endpoints,
    }
  }, [macro, labor, inflation, activity, spreads, recession, housing, consumer, credit, markets])
}
