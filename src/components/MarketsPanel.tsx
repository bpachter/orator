import { useMarkets } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function MarketsPanel() {
  const { filters } = useFilters()
  const q = useMarkets(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Financial Markets"
      title="Markets & Commodities"
      subtitle="Equities, volatility, oil, gold, and FX"
    />
  )
}
