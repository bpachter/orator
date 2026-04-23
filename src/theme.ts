import { createTheme, alpha } from '@mui/material/styles'

export type ThemeMode = 'dark' | 'light'

// ---------------------------------------------------------------------------
// Series colors — universal across both modes (work on dark + light backgrounds)
// ---------------------------------------------------------------------------
const seriesColors = {
  yellow: '#e8b84b',
  blue: '#4a9eff',
  green: '#22c55e',
  red: '#ef4444',
  cyan: '#06b6d4',
  purple: '#8b5cf6',
  orange: '#f97316',
  pink: '#ec4899',
  teal: '#14b8a6',
  amber: '#f59e0b',
  violet: '#a78bfa',
  slate: '#64748b',
} as const

// ---------------------------------------------------------------------------
// Dark palette (default Orator macro theme)
// ---------------------------------------------------------------------------
export const darkPalette = {
  bg: '#070d1a',
  surface: '#0f1729',
  surfaceAlt: '#162035',
  border: '#1e2d4a',
  borderStrong: '#2a3f5f',
  textPrimary: '#e8edf5',
  textSecondary: '#7d9bc0',
  textMuted: '#3a5070',
  brand: '#e8b84b',
  positive: '#22c55e',
  negative: '#ef4444',
  info: '#4a9eff',
  warning: '#f59e0b',
  series: seriesColors,
} as const

// ---------------------------------------------------------------------------
// Light palette — soft neutral background, deep navy text
// ---------------------------------------------------------------------------
export const lightPalette = {
  bg: '#f6f7fb',
  surface: '#ffffff',
  surfaceAlt: '#eef1f7',
  border: '#dbe1ec',
  borderStrong: '#b8c2d4',
  textPrimary: '#0f1729',
  textSecondary: '#4b5b75',
  textMuted: '#8896ad',
  brand: '#b88a1f',
  positive: '#16a34a',
  negative: '#dc2626',
  info: '#2563eb',
  warning: '#d97706',
  series: seriesColors,
} as const

export type OratorPalette = {
  bg: string
  surface: string
  surfaceAlt: string
  border: string
  borderStrong: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  brand: string
  positive: string
  negative: string
  info: string
  warning: string
  series: typeof seriesColors
}

/**
 * Backwards-compatible default export of the dark palette.
 * Most chart styling references this constant directly. For mode-aware
 * styling, prefer `useOratorPalette()` from `state/themeMode`.
 */
export const palette = darkPalette

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary']
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary']
  }
}

export const theme = createOratorTheme('dark')

export function createOratorTheme(mode: ThemeMode) {
  const p = mode === 'light' ? lightPalette : darkPalette
  return createTheme({
    palette: {
      mode,
      background: { default: p.bg, paper: p.surface },
      primary: { main: p.brand, contrastText: mode === 'light' ? '#ffffff' : p.bg },
      secondary: { main: p.info },
      success: { main: p.positive },
      error: { main: p.negative },
      warning: { main: p.warning },
      info: { main: p.info },
      brand: { main: p.brand, contrastText: mode === 'light' ? '#ffffff' : p.bg },
      text: { primary: p.textPrimary, secondary: p.textSecondary, disabled: p.textMuted },
      divider: p.border,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: { fontWeight: 600, fontSize: '2.25rem', letterSpacing: -0.5 },
      h2: { fontWeight: 600, fontSize: '1.75rem', letterSpacing: -0.25 },
      h3: { fontWeight: 600, fontSize: '1.375rem' },
      h4: { fontWeight: 600, fontSize: '1.125rem' },
      h5: { fontWeight: 600, fontSize: '1rem' },
      subtitle1: { fontWeight: 500, fontSize: '0.875rem', color: p.textSecondary },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.75rem',
        color: p.textSecondary,
        letterSpacing: 1,
        textTransform: 'uppercase',
      },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8125rem', color: p.textSecondary },
      caption: { fontSize: '0.6875rem', color: p.textMuted, letterSpacing: 0.4 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*, *::before, *::after': { boxSizing: 'border-box' },
          'html, body, #root': { height: '100%', margin: 0, padding: 0 },
          body: {
            backgroundColor: p.bg,
            color: p.textPrimary,
            WebkitFontSmoothing: 'antialiased',
          },
          '::-webkit-scrollbar': { width: 6, height: 6 },
          '::-webkit-scrollbar-track': { background: p.bg },
          '::-webkit-scrollbar-thumb': { background: p.border, borderRadius: 3 },
          '::-webkit-scrollbar-thumb:hover': { background: p.borderStrong },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${p.border}`,
            backgroundColor: p.surface,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            color: p.textSecondary,
            borderColor: p.border,
            '&.Mui-selected': {
              backgroundColor: p.brand,
              color: mode === 'light' ? '#ffffff' : p.bg,
              '&:hover': { backgroundColor: alpha(p.brand, 0.85) },
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 44,
            color: p.textSecondary,
            '&.Mui-selected': { color: p.textPrimary },
          },
        },
      },
      MuiTabs: {
        styleOverrides: { indicator: { backgroundColor: p.brand, height: 2 } },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? p.surface : '#0a1220',
            borderBottom: `1px solid ${p.border}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: p.surfaceAlt,
            border: `1px solid ${p.border}`,
            color: p.textPrimary,
            fontSize: 12,
          },
        },
      },
    },
  })
}

export const monoFont = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
