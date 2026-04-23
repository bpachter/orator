import { useCreditConditions } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function CreditConditionsPanel() {
  const { filters } = useFilters()
  const q = useCreditConditions(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Financial Conditions"
      title="Credit Conditions"
      subtitle="High-yield spreads, lending rates, and policy rate"
    />
  )
}
