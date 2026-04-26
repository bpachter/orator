import { useEnergy } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function EnergyPanel() {
  const { filters } = useFilters()
  const q = useEnergy(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Energy Markets"
      title="Energy Dashboard"
      subtitle="Crude, natural gas, inventories, refinery utilization, and power prices"
    />
  )
}
