import { useGlobalMacro } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function GlobalMacroPanel() {
  const { filters } = useFilters()
  const q = useGlobalMacro(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Global Macro Divergence"
      title="International Macro Dashboard"
      subtitle="G7 leading indicators, policy rates, 10Y sovereign yields, FX rates, and annual GDP growth (World Bank)"
    />
  )
}
