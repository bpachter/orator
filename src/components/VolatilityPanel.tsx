import { useVolatility } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function VolatilityPanel() {
  const { filters } = useFilters()
  const q = useVolatility(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Volatility Suite"
      title="CBOE Volatility Indices"
      subtitle="VIX (30-day), VIX3M (3-month), and SKEW (tail-risk) sourced from CBOE daily data"
    />
  )
}
