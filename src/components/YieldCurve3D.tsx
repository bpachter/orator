import { useEffect, useRef } from 'react'
import type Plotly from 'plotly.js'
import { Box, Stack } from '@mui/material'
import { useFilters } from '../state/filters'
import { useYieldSurface } from '../hooks/useFredQueries'
import { PanelCard } from './shared/PanelCard'
import { KpiChip } from './shared/KpiChip'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { palette } from '../theme'

export function YieldCurve3D() {
  const { filters } = useFilters()
  const { range } = filters
  const { data: surface, isLoading, isError, error, refetch } = useYieldSurface(range)
  const plotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!surface || !plotRef.current) return
    let disposed = false
    let plotlyMod: typeof Plotly | null = null

    void import('plotly.js-dist-min').then((mod) => {
      if (disposed || !plotRef.current) return
      const P = (mod as unknown as { default: typeof Plotly }).default ?? (mod as unknown as typeof Plotly)
      plotlyMod = P

      const trace: Partial<Plotly.PlotData> = {
        type: 'surface' as const,
        x: surface.maturityYears,
        y: surface.dates,
        z: surface.z,
        colorscale: [
          [0, '#1d4ed8'],
          [0.15, '#0891b2'],
          [0.35, '#10b981'],
          [0.55, '#f59e0b'],
          [0.75, '#f97316'],
          [1, '#dc2626'],
        ] as [number, string][],
        showscale: true,
        colorbar: {
          title: { text: 'Yield (%)', side: 'right' } as unknown as string,
          thickness: 12,
          len: 0.55,
          tickfont: { size: 10, color: palette.textSecondary },
          outlinecolor: palette.border,
          bgcolor: 'rgba(0,0,0,0)',
        } as unknown as Plotly.ColorBar,
        hovertemplate:
          '<b>Maturity:</b> %{x}yr<br>' +
          '<b>Date:</b> %{y}<br>' +
          '<b>Yield:</b> %{z:.2f}%<extra></extra>',
        contours: {
          z: { show: true, usecolormap: true, highlightcolor: '#ffffff55', project: { z: false } },
        },
      } as unknown as Partial<Plotly.PlotData>

      const layout: Partial<Plotly.Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: palette.textSecondary, family: 'Inter, sans-serif', size: 11 },
        scene: {
          bgcolor: 'rgba(0,0,0,0)',
          xaxis: {
            title: { text: 'Maturity (Years)', font: { color: palette.textSecondary } } as Plotly.LayoutAxis['title'],
            color: palette.textSecondary,
            gridcolor: palette.border,
            tickvals: surface.maturityYears,
            ticktext: surface.maturityLabels,
            showbackground: true,
            backgroundcolor: '#0a1220',
          } as unknown as Plotly.LayoutAxis,
          yaxis: {
            title: { text: 'Date', font: { color: palette.textSecondary } } as Plotly.LayoutAxis['title'],
            color: palette.textSecondary,
            gridcolor: palette.border,
            showbackground: true,
            backgroundcolor: '#0a1220',
            tickfont: { size: 9 },
          } as unknown as Plotly.LayoutAxis,
          zaxis: {
            title: { text: 'Yield (%)', font: { color: palette.textSecondary } } as Plotly.LayoutAxis['title'],
            color: palette.textSecondary,
            gridcolor: palette.border,
            showbackground: true,
            backgroundcolor: '#0a1220',
          } as unknown as Plotly.LayoutAxis,
          camera: { eye: { x: 1.6, y: -1.9, z: 0.7 } },
          aspectmode: 'manual',
          aspectratio: { x: 1.2, y: 2.5, z: 0.6 },
        } as unknown as Plotly.Scene,
        margin: { l: 0, r: 0, t: 0, b: 0 },
      }

      P.react(plotRef.current, [trace], layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'] as Plotly.ModeBarDefaultButtons[],
        displaylogo: false,
      })
    })

    return () => {
      disposed = true
      if (plotlyMod && plotRef.current) {
        try {
          plotlyMod.purge(plotRef.current)
        } catch {
          /* noop */
        }
      }
    }
  }, [surface])

  const currentCurve = surface
    ? surface.maturityLabels.map((label, i) => ({
        label,
        value: surface.z[surface.z.length - 1]?.[i] ?? NaN,
      }))
    : []

  const lastRow = surface?.z[surface.z.length - 1]
  const spread10y2y = lastRow ? lastRow[7] - lastRow[3] : null

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Rates"
        title="U.S. Treasury Yield Curve"
        subtitle="3D surface — time × maturity × rate. Adjust the range in the top bar."
      />

      <PanelCard
        padding={0}
        action={null}
      >
        <Box
          sx={{
            position: 'relative',
            minHeight: 480,
            height: { xs: 480, md: 520 },
            width: '100%',
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <LoadingState message={`Loading ${range} yield data…`} />
            </Box>
          )}
          {isError && (
            <Box sx={{ position: 'absolute', inset: 0, p: 3 }}>
              <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
            </Box>
          )}
          <Box ref={plotRef} sx={{ width: '100%', height: '100%' }} />
        </Box>
      </PanelCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 2,
        }}
      >
        <PanelCard title="Current Curve Snapshot" subtitle="Latest observation per maturity">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))',
              gap: 1,
            }}
          >
            {currentCurve.map(({ label, value }) => (
              <PanelCard key={label} dense padding={1}>
                <KpiChip
                  label={label}
                  value={isNaN(value) ? '—' : value.toFixed(2)}
                  unit={isNaN(value) ? undefined : '%'}
                  valueColor={palette.brand}
                  size="sm"
                  align="center"
                />
              </PanelCard>
            ))}
          </Box>
        </PanelCard>

        <PanelCard title="10Y – 2Y Spread" subtitle="Classic recession indicator">
          {spread10y2y !== null ? (
            <KpiChip
              label="Latest"
              value={`${spread10y2y > 0 ? '+' : ''}${spread10y2y.toFixed(2)}`}
              unit="%"
              valueColor={spread10y2y < 0 ? palette.negative : palette.positive}
              size="lg"
              caption={
                spread10y2y < 0
                  ? 'Inverted — historically precedes recession by 12–18 months'
                  : 'Normal slope — no inversion signal'
              }
            />
          ) : (
            <LoadingState message="Computing spread…" height={120} />
          )}
        </PanelCard>
      </Box>
    </Stack>
  )
}
