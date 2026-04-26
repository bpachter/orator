import { useFiscal } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { SeriesGridPanel } from './shared/SeriesGridPanel'

export function FiscalPanel() {
  const { filters } = useFilters()
  const q = useFiscal(filters.range)
  return (
    <SeriesGridPanel
      query={q}
      eyebrow="Fiscal & Monetary"
      title="Fiscal Monitor"
      subtitle="Deficit, debt, federal receipts/outlays, and Fed balance sheet holdings"
    />
  )
}
