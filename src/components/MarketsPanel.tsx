import { useMarkets } from '../hooks/useFredQueries'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function MarketsPanel() {
  const q = useMarkets()
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Financial Markets"
      title="Markets & Commodities"
      subtitle="Equities, volatility, oil, gold, and FX"
    />
  )
}
