import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createOratorTheme, darkPalette, lightPalette, type OratorPalette, type ThemeMode } from '../theme'

const STORAGE_KEY = 'orator.themeMode'

interface ThemeModeContextValue {
  mode: ThemeMode
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
  palette: OratorPalette
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }
  return 'dark'
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode())

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => setModeState(next), [])
  const toggleMode = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), [])

  const muiTheme = useMemo(() => createOratorTheme(mode), [mode])
  const activePalette: OratorPalette = mode === 'light' ? lightPalette : darkPalette

  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, toggleMode, setMode, palette: activePalette }),
    [mode, toggleMode, setMode, activePalette],
  )

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider')
  return ctx
}

/** Convenience hook for components that need the active palette object. */
export function useOratorPalette(): OratorPalette {
  return useThemeMode().palette
}
