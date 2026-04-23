/**
 * customDashboards state — user-defined dashboards composed of indicator IDs
 * arranged in a free-form grid. Persisted to localStorage.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'

const STORAGE_KEY = 'orator.customDashboards'

export interface CustomDashboard {
  id: string
  name: string
  /** Ordered list of indicator IDs to render */
  indicators: string[]
  createdAt: number
}

interface DashboardsContextValue {
  dashboards: CustomDashboard[]
  activeId: string | null
  active: CustomDashboard | null
  setActive: (id: string | null) => void
  create: (name: string) => CustomDashboard
  rename: (id: string, name: string) => void
  remove: (id: string) => void
  addIndicator: (dashId: string, indicatorId: string) => void
  removeIndicator: (dashId: string, indicatorId: string) => void
  reorder: (dashId: string, from: number, to: number) => void
}

const Ctx = createContext<DashboardsContextValue | null>(null)

interface PersistedState {
  dashboards: CustomDashboard[]
  activeId: string | null
}

function read(): PersistedState {
  if (typeof window === 'undefined') return { dashboards: [], activeId: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { dashboards: [], activeId: null }
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.dashboards)) {
      return { dashboards: parsed.dashboards, activeId: parsed.activeId ?? null }
    }
  } catch {
    /* ignore */
  }
  return { dashboards: [], activeId: null }
}

function write(state: PersistedState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function CustomDashboardsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => read())

  useEffect(() => {
    write(state)
  }, [state])

  const setActive = useCallback((id: string | null) => {
    setState((p) => ({ ...p, activeId: id }))
  }, [])

  const create = useCallback((name: string) => {
    const dash: CustomDashboard = {
      id: `dash-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim() || 'Untitled Dashboard',
      indicators: [],
      createdAt: Date.now(),
    }
    setState((p) => ({ dashboards: [dash, ...p.dashboards], activeId: dash.id }))
    return dash
  }, [])

  const rename = useCallback((id: string, name: string) => {
    setState((p) => ({
      ...p,
      dashboards: p.dashboards.map((d) => (d.id === id ? { ...d, name: name.trim() || d.name } : d)),
    }))
  }, [])

  const remove = useCallback((id: string) => {
    setState((p) => ({
      dashboards: p.dashboards.filter((d) => d.id !== id),
      activeId: p.activeId === id ? null : p.activeId,
    }))
  }, [])

  const addIndicator = useCallback((dashId: string, indicatorId: string) => {
    setState((p) => ({
      ...p,
      dashboards: p.dashboards.map((d) =>
        d.id === dashId && !d.indicators.includes(indicatorId)
          ? { ...d, indicators: [...d.indicators, indicatorId] }
          : d,
      ),
    }))
  }, [])

  const removeIndicator = useCallback((dashId: string, indicatorId: string) => {
    setState((p) => ({
      ...p,
      dashboards: p.dashboards.map((d) =>
        d.id === dashId ? { ...d, indicators: d.indicators.filter((i) => i !== indicatorId) } : d,
      ),
    }))
  }, [])

  const reorder = useCallback((dashId: string, from: number, to: number) => {
    setState((p) => ({
      ...p,
      dashboards: p.dashboards.map((d) => {
        if (d.id !== dashId) return d
        const next = [...d.indicators]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        return { ...d, indicators: next }
      }),
    }))
  }, [])

  const active = useMemo(
    () => state.dashboards.find((d) => d.id === state.activeId) ?? null,
    [state],
  )

  const value = useMemo<DashboardsContextValue>(
    () => ({
      dashboards: state.dashboards,
      activeId: state.activeId,
      active,
      setActive,
      create,
      rename,
      remove,
      addIndicator,
      removeIndicator,
      reorder,
    }),
    [state, active, setActive, create, rename, remove, addIndicator, removeIndicator, reorder],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCustomDashboards(): DashboardsContextValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCustomDashboards must be used within <CustomDashboardsProvider>')
  return ctx
}
