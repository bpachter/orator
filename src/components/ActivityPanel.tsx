import { useActivity } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function ActivityPanel() {
  const { filters } = useFilters()
  const q = useActivity(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Business Activity"
      title="Industrial & Business Activity"
      subtitle="Production, capacity, durable goods, and capex orders"
    />
  )
}
