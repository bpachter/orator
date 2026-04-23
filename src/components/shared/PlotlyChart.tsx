import { useEffect, useMemo, useRef } from 'react'
import type Plotly from 'plotly.js'
import { Box } from '@mui/material'
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
  yaxis: { color: palette.textSecondary, gridcolor: '#162035', showgrid: true, zeroline: false },
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

  const themedBaseLayout = useMemo<PlotlyLayout>(() => ({
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: themePalette.textSecondary, family: 'Inter, sans-serif', size: 11 },
    xaxis: { color: themePalette.textSecondary, gridcolor: themePalette.border, showgrid: false, zeroline: false },
    yaxis: { color: themePalette.textSecondary, gridcolor: themePalette.border, showgrid: true, zeroline: false },
    margin: { l: 44, r: 12, t: 8, b: 30 },
    hovermode: 'x unified',
  }), [themePalette])

  useEffect(() => {
    let disposed = false
    let plotlyMod: typeof Plotly | null = null

    if (!ref.current || !traces.length) return

    void import('plotly.js-dist-min').then((mod) => {
      if (disposed || !ref.current) return
      const P = (mod as unknown as { default: typeof Plotly }).default ?? (mod as unknown as typeof Plotly)
      plotlyMod = P
      P.react(
        ref.current,
        traces,
        { ...themedBaseLayout, ...layout, shapes },
        { ...baseConfig, ...config },
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
  }, [traces, layout, config, shapes, themedBaseLayout])

  return (
    <Box
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      sx={{ width: '100%', flex: 1, minHeight }}
    />
  )
}
