import { createTheme, alpha } from '@mui/material/styles'

export type ThemeMode = 'dark' | 'light'

// ---------------------------------------------------------------------------
// Series colors — universal across both modes (work on dark + light backgrounds)
// ---------------------------------------------------------------------------
const seriesColors = {
  yellow: '#d7b46a',
  blue: '#6d91c9',
  green: '#6fa49a',
  red: '#c98f5a',
  cyan: '#82aec2',
  purple: '#7b89b4',
  orange: '#b7834c',
  pink: '#a7a9bc',
  teal: '#5f8f97',
  amber: '#cfa75a',
  violet: '#b0b9d4',
  slate: '#74869b',
} as const

// ---------------------------------------------------------------------------
// Dark palette (default Orator macro theme)
// ---------------------------------------------------------------------------
export const darkPalette = {
  bg: '#08111d',
  surface: '#101a29',
  surfaceAlt: '#172336',
  border: '#253650',
  borderStrong: '#334a68',
  textPrimary: '#f3f6fb',
  textSecondary: '#a8b8cb',
  textMuted: '#70839a',
  brand: '#d4ad63',
  positive: '#6aa58d',
  negative: '#c76f5d',
  info: '#7d9dcd',
  warning: '#cfa75a',
  series: seriesColors,
} as const

// ---------------------------------------------------------------------------
// Light palette — soft neutral background, deep navy text
// ---------------------------------------------------------------------------
export const lightPalette = {
  bg: '#f4f6f9',
  surface: '#ffffff',
  surfaceAlt: '#ebeff5',
  border: '#d5dde8',
  borderStrong: '#b7c3d2',
  textPrimary: '#152335',
  textSecondary: '#56697f',
  textMuted: '#8795a7',
  brand: '#b5914c',
  positive: '#4f8e76',
  negative: '#bb6256',
  info: '#5f7fac',
  warning: '#bc9550',
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
          'html': { height: '100%', margin: 0, padding: 0, backgroundColor: p.bg },
          'body, #root': { height: '100%', margin: 0, padding: 0 },
          body: {
            // Transparent background so the html base color and the dark-mode
            // CSS star layer (body::before, z-index:-1) show through.
            backgroundColor: 'transparent',
            backgroundImage:
              mode === 'light'
                ? [
                    'radial-gradient(ellipse 80% 60% at 10% 6%,  rgba(176,140,68,0.09)  0%, transparent 58%)',
                    'radial-gradient(ellipse 64% 52% at 90% 96%, rgba(110,158,212,0.08) 0%, transparent 58%)',
                    'radial-gradient(ellipse 50% 40% at 82% 10%, rgba(130,174,220,0.06) 0%, transparent 54%)',
                    'radial-gradient(ellipse 34% 26% at 46% 72%, rgba(160,144,76,0.05)  0%, transparent 52%)',
                    'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0) 60%)',
                  ].join(', ')
                : [
                    'radial-gradient(ellipse 80% 60% at 12% 8%,  rgba(64,120,196,0.15)  0%, transparent 60%)',
                    'radial-gradient(ellipse 60% 50% at 88% 92%, rgba(48,84,156,0.13)   0%, transparent 60%)',
                    'radial-gradient(ellipse 48% 38% at 84% 12%, rgba(182,146,68,0.09)  0%, transparent 55%)',
                    'radial-gradient(ellipse 36% 28% at 44% 78%, rgba(72,112,184,0.07)  0%, transparent 55%)',
                    'radial-gradient(ellipse 28% 22% at 68% 44%, rgba(88,118,178,0.05)  0%, transparent 52%)',
                    'linear-gradient(180deg, rgba(10,22,42,0.12) 0%, rgba(255,255,255,0) 60%)',
                  ].join(', '),
            color: p.textPrimary,
            WebkitFontSmoothing: 'antialiased',
          },
          '::-webkit-scrollbar': { width: 6, height: 6 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': { background: alpha(p.border, 0.7), borderRadius: 3 },
          '::-webkit-scrollbar-thumb:hover': { background: p.borderStrong },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage:
              mode === 'light'
                ? 'linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(244,246,249,0.86) 100%)'
                : 'linear-gradient(155deg, rgba(22,34,54,0.88) 0%, rgba(12,20,34,0.94) 100%)',
            border: `1px solid ${p.border}`,
            backgroundColor:
              mode === 'light' ? 'rgba(255,255,255,0.82)' : 'rgba(14,22,38,0.80)',
            backdropFilter: 'blur(10px) saturate(120%)',
            WebkitBackdropFilter: 'blur(10px) saturate(120%)',
            transition: 'box-shadow 0.22s ease, border-color 0.22s ease',
            '&:hover': {
              boxShadow:
                mode === 'dark'
                  ? '0 8px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(90,150,220,0.08)'
                  : '0 6px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(180,145,76,0.10)',
              borderColor:
                mode === 'dark' ? alpha(p.borderStrong, 0.80) : alpha(p.borderStrong, 0.75),
            },
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
            backgroundColor: alpha(p.surfaceAlt, mode === 'light' ? 0.6 : 0.32),
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
            backgroundColor:
              mode === 'light' ? 'rgba(244,246,249,0.86)' : 'rgba(8,15,28,0.86)',
            borderBottom: `1px solid ${alpha(p.border, 0.8)}`,
            backgroundImage:
              mode === 'dark'
                ? `linear-gradient(90deg, rgba(64,120,196,0.04) 0%, transparent 40%, rgba(182,146,68,0.03) 100%)`
                : 'none',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            boxShadow:
              mode === 'dark'
                ? `0 1px 0 ${alpha(p.brand, 0.14)}, 0 4px 20px rgba(0,0,0,0.14)`
                : `0 1px 0 ${alpha(p.brand, 0.10)}, 0 2px 10px rgba(0,0,0,0.05)`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            border: `1px solid ${alpha(p.borderStrong, 0.5)}`,
            backgroundColor: alpha(p.surfaceAlt, mode === 'light' ? 0.85 : 0.5),
          },
        },
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
      MuiIconButton: {
        styleOverrides: {
          root: {
            // Remove webkit tap highlight — MUI ripple handles visual feedback
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          },
          sizeSmall: {
            // On touch-primary devices enforce 44×44px minimum touch target
            // (WCAG 2.5.5 / Apple HIG) without changing the visual icon size
            '@media (hover: none) and (pointer: coarse)': {
              padding: 10,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            // Slightly taller list rows on touch devices for easier tapping
            '@media (hover: none) and (pointer: coarse)': {
              minHeight: 44,
            },
          },
        },
      },
    },
  })
}

export const monoFont = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
