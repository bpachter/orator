import { useCreditConditions } from '../hooks/useFredQueries'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function CreditConditionsPanel() {
  const q = useCreditConditions()
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Financial Conditions"
      title="Credit Conditions"
      subtitle="High-yield spreads, lending rates, and policy rate"
    />
  )
}
