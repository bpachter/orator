/**
 * compareList state — keeps track of indicator IDs the user has chosen to
 * compare. Used by the Compare panel and the per-indicator "Add to compare"
 * button. Persisted to localStorage so users can navigate away and return.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'

const STORAGE_KEY = 'orator.compareList'
const MAX_ITEMS = 4

interface CompareContextValue {
  ids: string[]
  add: (id: string) => void
  remove: (id: string) => void
  toggle: (id: string) => void
  clear: () => void
  has: (id: string) => boolean
  isFull: boolean
}

const CompareContext = createContext<CompareContextValue | null>(null)

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s) => typeof s === 'string').slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

function write(ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore quota */
  }
}

export function CompareListProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => read())

  useEffect(() => {
    write(ids)
  }, [ids])

  const add = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) || prev.length >= MAX_ITEMS ? prev : [...prev, id]))
  }, [])

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_ITEMS) return prev
      return [...prev, id]
    })
  }, [])

  const clear = useCallback(() => setIds([]), [])
  const has = useCallback((id: string) => ids.includes(id), [ids])

  const value = useMemo(
    () => ({ ids, add, remove, toggle, clear, has, isFull: ids.length >= MAX_ITEMS }),
    [ids, add, remove, toggle, clear, has],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompareList(): CompareContextValue {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompareList must be used within <CompareListProvider>')
  return ctx
}

export const COMPARE_MAX_ITEMS = MAX_ITEMS
