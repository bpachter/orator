import { useInflation } from '../hooks/useFredQueries'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function InflationPanel() {
  const q = useInflation()
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Prices"
      title="Inflation Indicators"
      subtitle="Year-over-year growth across CPI, PCE, PPI, and trade prices"
    />
  )
}
