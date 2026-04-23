import { useInflation } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function InflationPanel() {
  const { filters } = useFilters()
  const q = useInflation(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Prices"
      title="Inflation Indicators"
      subtitle="Year-over-year growth across CPI, PCE, PPI, and trade prices"
    />
  )
}
