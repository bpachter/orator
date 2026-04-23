import { useConsumer } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function ConsumerPanel() {
  const { filters } = useFilters()
  const q = useConsumer(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Households"
      title="Consumer Spending & Sentiment"
      subtitle="Retail sales, sentiment, savings, and personal income"
    />
  )
}
