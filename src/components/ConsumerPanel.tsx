import { useConsumer } from '../hooks/useFredQueries'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function ConsumerPanel() {
  const q = useConsumer()
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Households"
      title="Consumer Spending & Sentiment"
      subtitle="Retail sales, sentiment, savings, and personal income"
    />
  )
}
