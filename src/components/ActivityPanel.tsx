import { useActivity } from '../hooks/useFredQueries'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function ActivityPanel() {
  const q = useActivity()
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Business Activity"
      title="Industrial & Business Activity"
      subtitle="Production, capacity, durable goods, and capex orders"
    />
  )
}
