import { useEffect, useMemo, useRef } from 'react'
import type Plotly from 'plotly.js'
import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { palette } from '../../theme'
import { useOratorPalette } from '../../state/themeMode'

export type PlotlyTrace = Partial<Plotly.PlotData>
export type PlotlyLayout = Partial<Plotly.Layout>
export type PlotlyConfig = Partial<Plotly.Config>

interface PlotlyChartProps {
  traces: PlotlyTrace[]
  layout?: PlotlyLayout
  config?: PlotlyConfig
  minHeight?: number | string
  ariaLabel?: string
  shapes?: Partial<Plotly.Shape>[]
}

/** Static dark-tuned default layout retained for backwards compatibility. */
export const baseLayout: PlotlyLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: palette.textSecondary, family: 'Inter, sans-serif', size: 11 },
  xaxis: { color: palette.textSecondary, gridcolor: palette.border, showgrid: false, zeroline: false },
  yaxis: { color: palette.textSecondary, gridcolor: palette.border, showgrid: true, zeroline: false },
  margin: { l: 44, r: 12, t: 8, b: 30 },
  hovermode: 'x unified',
}

export const baseConfig: PlotlyConfig = {
  responsive: true,
  displayModeBar: 'hover',
  displaylogo: false,
  modeBarButtonsToRemove: [
    'sendDataToCloud',
    'select2d',
    'lasso2d',
    'autoScale2d',
    'hoverClosestCartesian',
    'hoverCompareCartesian',
    'toggleSpikelines',
  ],
  toImageButtonOptions: {
    format: 'png',
    filename: 'orator-chart',
    scale: 2,
  },
}

/**
 * Lightweight Plotly wrapper. Lazy-loads the Plotly bundle and re-renders
 * whenever traces or layout change. Cleans up on unmount.
 */
export function PlotlyChart({
  traces,
  layout,
  config,
  minHeight = 220,
  ariaLabel,
  shapes,
}: PlotlyChartProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const themePalette = useOratorPalette()
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'))

  const themedBaseLayout = useMemo<PlotlyLayout>(() => ({
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: themePalette.textSecondary, family: 'Inter, sans-serif', size: 11 },
    xaxis: { color: themePalette.textSecondary, gridcolor: themePalette.border, showgrid: false, zeroline: false },
    yaxis: { color: themePalette.textSecondary, gridcolor: themePalette.border, showgrid: true, zeroline: false },
    margin: { l: 44, r: 12, t: 8, b: 30 },
    hovermode: 'x unified',
  }), [themePalette])

  /** On small screens: tighten margins, reduce font, hide the modebar to
   *  maximise the plot area and prevent toolbar overflow. */
  const mobileLayoutOverrides = useMemo<PlotlyLayout>(() => {
    if (!isMobile) return {}
    return {
      font: { size: 9 },
      margin: { l: 32, r: 6, t: 6, b: 24 },
    }
  }, [isMobile])

  const mobileConfigOverrides = useMemo<PlotlyConfig>(() => {
    if (!isMobile) return {}
    // Always hide modebar on touch devices — it clutters the plot area
    return { displayModeBar: false }
  }, [isMobile])

  useEffect(() => {
    let disposed = false
    let plotlyMod: typeof Plotly | null = null

    if (!ref.current || !traces.length) return

    void import('plotly.js-dist-min').then((mod) => {
      if (disposed || !ref.current) return
      const P = (mod as unknown as { default: typeof Plotly }).default ?? (mod as unknown as typeof Plotly)
      plotlyMod = P
      // Build mobile-aware layout: mobile overrides win over themedBase,
      // but explicit per-panel layout props still take final precedence.
      const mergedLayout = { ...themedBaseLayout, ...mobileLayoutOverrides, ...layout, shapes }
      if (isMobile && mergedLayout.margin) {
        // Clamp any per-panel margin values to mobile-friendly maximums
        const m = mergedLayout.margin as { l?: number; r?: number; t?: number; b?: number }
        mergedLayout.margin = {
          l: Math.min(m.l ?? 44, 36),
          r: Math.min(m.r ?? 12, 8),
          t: Math.min(m.t ?? 8, 8),
          b: Math.min(m.b ?? 30, 32),
        }
      }
      P.react(
        ref.current,
        traces,
        mergedLayout,
        { ...baseConfig, ...mobileConfigOverrides, ...config },
      )
    })

    return () => {
      disposed = true
      if (plotlyMod && ref.current) {
        try {
          plotlyMod.purge(ref.current)
        } catch {
          /* noop */
        }
      }
    }
  }, [traces, layout, config, shapes, themedBaseLayout, mobileLayoutOverrides, mobileConfigOverrides, isMobile])

  return (
    <Box
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      sx={{ width: '100%', flex: 1, minHeight }}
    />
  )
}
