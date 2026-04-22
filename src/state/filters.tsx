import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ActiveView, TimeRange } from '../types'

export interface DashboardFilters {
  view: ActiveView
  range: TimeRange
}

export const DEFAULT_FILTERS: DashboardFilters = {
  view: 'yield-curve',
  range: '5Y',
}

const VALID_VIEWS: ActiveView[] = ['yield-curve', 'macro', 'cpi', 'spreads', 'grocery']
const VALID_RANGES: TimeRange[] = ['1Y', '2Y', '5Y', '10Y', 'MAX']

function readFromUrl(): DashboardFilters {
  if (typeof window === 'undefined') return DEFAULT_FILTERS
  const sp = new URLSearchParams(window.location.search)
  const view = sp.get('view') as ActiveView | null
  const range = sp.get('range') as TimeRange | null
  return {
    view: view && VALID_VIEWS.includes(view) ? view : DEFAULT_FILTERS.view,
    range: range && VALID_RANGES.includes(range) ? range : DEFAULT_FILTERS.range,
  }
}

function writeToUrl(filters: DashboardFilters) {
  if (typeof window === 'undefined') return
  const sp = new URLSearchParams(window.location.search)
  sp.set('view', filters.view)
  sp.set('range', filters.range)
  const url = `${window.location.pathname}?${sp.toString()}${window.location.hash}`
  window.history.replaceState(null, '', url)
}

interface FilterContextValue {
  filters: DashboardFilters
  setView: (v: ActiveView) => void
  setRange: (r: TimeRange) => void
  setFilters: (f: Partial<DashboardFilters>) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<DashboardFilters>(() => readFromUrl())

  useEffect(() => {
    writeToUrl(filters)
  }, [filters])

  useEffect(() => {
    const onPop = () => setFiltersState(readFromUrl())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const setView = useCallback(
    (view: ActiveView) => setFiltersState((prev) => ({ ...prev, view })),
    [],
  )
  const setRange = useCallback(
    (range: TimeRange) => setFiltersState((prev) => ({ ...prev, range })),
    [],
  )
  const setFilters = useCallback(
    (next: Partial<DashboardFilters>) =>
      setFiltersState((prev) => ({ ...prev, ...next })),
    [],
  )

  const value = useMemo(
    () => ({ filters, setView, setRange, setFilters }),
    [filters, setView, setRange, setFilters],
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within <FilterProvider>')
  return ctx
}
