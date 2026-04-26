import { useMarketPrices } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function MarketPricesPanel() {
  const { filters } = useFilters()
  const q = useMarketPrices(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Market Prices"
      title="Market Prices (Alpha Vantage)"
      subtitle="Major index and sector ETFs with weekly adjusted closes"
      formatHover={(unit) => `%{x}: ${unit ?? '$'}%{y:.2f}<extra></extra>`}
    />
  )
}
