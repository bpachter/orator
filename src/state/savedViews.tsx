import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import type { ActiveView, TimeRange } from '../types'

const STORAGE_KEY = 'orator.savedViews'

export interface SavedView {
  id: string
  name: string
  view: ActiveView
  range: TimeRange
  createdAt: number
}

interface SavedViewsContextValue {
  views: SavedView[]
  saveView: (input: { name: string; view: ActiveView; range: TimeRange }) => SavedView
  removeView: (id: string) => void
  renameView: (id: string, name: string) => void
}

const SavedViewsContext = createContext<SavedViewsContextValue | null>(null)

function readFromStorage(): SavedView[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (v): v is SavedView =>
        v &&
        typeof v === 'object' &&
        typeof v.id === 'string' &&
        typeof v.name === 'string' &&
        typeof v.view === 'string' &&
        typeof v.range === 'string' &&
        typeof v.createdAt === 'number',
    )
  } catch {
    return []
  }
}

function writeToStorage(views: SavedView[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views))
  } catch {
    /* ignore quota */
  }
}

export function SavedViewsProvider({ children }: { children: ReactNode }) {
  const [views, setViews] = useState<SavedView[]>(() => readFromStorage())

  useEffect(() => {
    writeToStorage(views)
  }, [views])

  const saveView = useCallback<SavedViewsContextValue['saveView']>(({ name, view, range }) => {
    const entry: SavedView = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || `${view} · ${range}`,
      view,
      range,
      createdAt: Date.now(),
    }
    setViews((prev) => [entry, ...prev].slice(0, 30))
    return entry
  }, [])

  const removeView = useCallback((id: string) => {
    setViews((prev) => prev.filter((v) => v.id !== id))
  }, [])

  const renameView = useCallback((id: string, name: string) => {
    setViews((prev) => prev.map((v) => (v.id === id ? { ...v, name: name.trim() || v.name } : v)))
  }, [])

  const value = useMemo<SavedViewsContextValue>(
    () => ({ views, saveView, removeView, renameView }),
    [views, saveView, removeView, renameView],
  )

  return <SavedViewsContext.Provider value={value}>{children}</SavedViewsContext.Provider>
}

export function useSavedViews(): SavedViewsContextValue {
  const ctx = useContext(SavedViewsContext)
  if (!ctx) throw new Error('useSavedViews must be used within SavedViewsProvider')
  return ctx
}
