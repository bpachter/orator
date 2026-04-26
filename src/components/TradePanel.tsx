import { useFilters } from '../state/filters'
import { useTrade } from '../hooks/useFredQueries'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function TradePanel() {
  const { filters } = useFilters()
  const q = useTrade(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Trade & Flows"
      title="Trade Balance & International Flows"
      subtitle="Goods & services trade balance, exports, imports, and oil — FRED / BEA / BLS"
    />
  )
}
