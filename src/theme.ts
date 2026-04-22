import { createTheme, alpha } from '@mui/material/styles'

// ---------------------------------------------------------------------------
// Brand palette — Orator dark macro theme
// ---------------------------------------------------------------------------
export const palette = {
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
  series: {
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
  },
} as const

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary']
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary']
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: palette.bg,
      paper: palette.surface,
    },
    primary: { main: palette.brand, contrastText: palette.bg },
    secondary: { main: palette.info },
    success: { main: palette.positive },
    error: { main: palette.negative },
    warning: { main: palette.warning },
    info: { main: palette.info },
    brand: { main: palette.brand, contrastText: palette.bg },
    text: {
      primary: palette.textPrimary,
      secondary: palette.textSecondary,
      disabled: palette.textMuted,
    },
    divider: palette.border,
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
    subtitle1: { fontWeight: 500, fontSize: '0.875rem', color: palette.textSecondary },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.75rem',
      color: palette.textSecondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem', color: palette.textSecondary },
    caption: { fontSize: '0.6875rem', color: palette.textMuted, letterSpacing: 0.4 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        'html, body, #root': { height: '100%', margin: 0, padding: 0 },
        body: {
          backgroundColor: palette.bg,
          color: palette.textPrimary,
          WebkitFontSmoothing: 'antialiased',
        },
        '::-webkit-scrollbar': { width: 6, height: 6 },
        '::-webkit-scrollbar-track': { background: palette.bg },
        '::-webkit-scrollbar-thumb': { background: palette.border, borderRadius: 3 },
        '::-webkit-scrollbar-thumb:hover': { background: palette.borderStrong },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${palette.border}`,
          backgroundColor: palette.surface,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: palette.textSecondary,
          borderColor: palette.border,
          '&.Mui-selected': {
            backgroundColor: palette.brand,
            color: palette.bg,
            '&:hover': { backgroundColor: alpha(palette.brand, 0.85) },
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
          color: palette.textSecondary,
          '&.Mui-selected': { color: palette.textPrimary },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: palette.brand, height: 2 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: '#0a1220',
          borderBottom: `1px solid ${palette.border}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.surfaceAlt,
          border: `1px solid ${palette.border}`,
          fontSize: 12,
        },
      },
    },
  },
})

export const monoFont = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
