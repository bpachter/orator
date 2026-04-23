import { useEffect, useMemo, useRef, useState } from 'react'
import type Plotly from 'plotly.js'
import { Box, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useFilters } from '../state/filters'
import { useAllSeries } from '../hooks/useAllSeries'
import { SectionHeader } from './shared/SectionHeader'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { PlotlyChart, baseConfig, type PlotlyTrace } from './shared/PlotlyChart'
import { useOratorPalette } from '../state/themeMode'
import { INDICATOR_REGISTRY, SECTIONS, type IndicatorMeta } from '../utils/seriesRegistry'
import { alignSeries, pearson } from '../utils/stats'

type Filter = 'all' | string

/**
 * Correlation Matrix Heatmap — symmetric grid showing Pearson correlation
 * between every pair of selected indicators over the active range.
 * Click any cell to open a bivariate scatter plot.
 */
export function CorrelationPanel() {
  const { filters } = useFilters()
  const all = useAllSeries(filters.range)
  const palette = useOratorPalette()
  const [sectionFilter, setSectionFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<{ a: IndicatorMeta; b: IndicatorMeta } | null>(null)

  const indicators = useMemo<IndicatorMeta[]>(() => {
    const filtered = sectionFilter === 'all'
      ? INDICATOR_REGISTRY
      : INDICATOR_REGISTRY.filter((i) => i.section === sectionFilter)
    // Only include indicators that have data
    return filtered.filter((i) => (all.byId.get(i.id)?.data.length ?? 0) > 1)
  }, [sectionFilter, all.byId])

  const { matrix, labels, hover } = useMemo(() => {
    const ids = indicators.map((i) => i.id)
    const labels = indicators.map((i) => i.short)
    const n = ids.length
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
    const hover: string[][] = Array.from({ length: n }, () => Array(n).fill(''))

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1
          hover[i][j] = `${labels[i]} vs ${labels[i]}<br>r = 1.000 (self)`
          continue
        }
        const a = all.byId.get(ids[i])?.data ?? []
        const b = all.byId.get(ids[j])?.data ?? []
        const aligned = alignSeries(a, b)
        const r = pearson(aligned.x, aligned.y)
        const safe = Number.isFinite(r) ? r : 0
        matrix[i][j] = safe
        matrix[j][i] = safe
        const txt = `${indicators[i].short} vs ${indicators[j].short}<br>r = ${safe.toFixed(3)} (n=${aligned.x.length})`
        hover[i][j] = txt
        hover[j][i] = txt
      }
    }
    return { matrix, labels, hover }
  }, [indicators, all.byId])

  const traces = useMemo<PlotlyTrace[]>(() => {
    return [
      {
        type: 'heatmap',
        z: matrix,
        x: labels,
        y: labels,
        colorscale: [
          [0, palette.negative],
          [0.5, palette.surfaceAlt],
          [1, palette.positive],
        ],
        zmin: -1,
        zmax: 1,
        hoverongaps: false,
        text: hover,
        hovertemplate: '%{text}<extra></extra>',
        showscale: true,
        colorbar: { title: 'r', tickfont: { color: palette.textSecondary } },
      } as unknown as PlotlyTrace,
    ]
  }, [matrix, labels, hover, palette])

  const layout = useMemo(
    () => ({
      xaxis: { color: palette.textSecondary, tickangle: -45, automargin: true },
      yaxis: { color: palette.textSecondary, autorange: 'reversed' as const, automargin: true },
      margin: { l: 100, r: 16, t: 16, b: 100 },
    }),
    [palette],
  )

  const onClickCell = (event: { points?: Array<{ x?: string; y?: string }> }) => {
    if (!event?.points?.length) return
    const point = event.points[0]
    const a = INDICATOR_REGISTRY.find((i) => i.short === point.y)
    const b = INDICATOR_REGISTRY.find((i) => i.short === point.x)
    if (a && b) setSelected({ a, b })
  }

  if (all.isLoading) return <LoadingState message="Computing correlations…" height={400} />

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Cross-asset analysis"
        title="Correlation Matrix"
        subtitle={`Pearson correlation between ${indicators.length} indicators over ${filters.range}.`}
        updated={all.updated}
        action={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={sectionFilter}
            onChange={(_, v: Filter | null) => v && setSectionFilter(v)}
          >
            <ToggleButton value="all" sx={{ px: 1.5, py: 0.25 }}>
              All
            </ToggleButton>
            {SECTIONS.map((s) => (
              <ToggleButton key={s} value={s} sx={{ px: 1.5, py: 0.25 }}>
                {s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />

      <PanelCard dense title="Matrix" subtitle="Click any cell for a scatter plot">
        <Box
          sx={{ width: '100%' }}
          onClick={(e: unknown) => {
            // plotly captures clicks internally; we use plotly_click via on
            void e
          }}
        >
          <PlotlyHeatmap traces={traces} layout={layout} onClick={onClickCell} />
        </Box>
      </PanelCard>

      {selected && <ScatterPair a={selected.a} b={selected.b} onClose={() => setSelected(null)} />}
    </Stack>
  )
}

/**
 * Light wrapper that exposes plotly_click events. We can't put listeners on
 * PlotlyChart directly, so duplicate just the rendering (Plotly is lazy
 * loaded once for the whole app).
 */
function PlotlyHeatmap({
  traces,
  layout,
  onClick,
}: {
  traces: PlotlyTrace[]
  layout: Record<string, unknown>
  onClick: (e: { points?: Array<{ x?: string; y?: string }> }) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const palette = useOratorPalette()
  useEffect(() => {
    let disposed = false
    let plotlyMod: typeof Plotly | null = null
    if (!ref.current) return
    void import('plotly.js-dist-min').then((mod) => {
      if (disposed || !ref.current) return
      const P = (mod as unknown as { default: typeof Plotly }).default ?? (mod as unknown as typeof Plotly)
      plotlyMod = P
      const merged = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: palette.textSecondary, family: 'Inter, sans-serif', size: 11 },
        ...layout,
      }
      P.react(ref.current, traces, merged as Partial<Plotly.Layout>, baseConfig)
      const node = ref.current as unknown as { on?: (ev: string, cb: (e: unknown) => void) => void }
      node.on?.('plotly_click', (e) => onClick(e as { points?: Array<{ x?: string; y?: string }> }))
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
  }, [traces, layout, onClick, palette])
  return <Box ref={ref} sx={{ width: '100%', minHeight: 600 }} />
}

function ScatterPair({
  a,
  b,
  onClose,
}: {
  a: IndicatorMeta
  b: IndicatorMeta
  onClose: () => void
}) {
  const { filters } = useFilters()
  const all = useAllSeries(filters.range)
  const aligned = useMemo(() => {
    const da = all.byId.get(a.id)?.data ?? []
    const db = all.byId.get(b.id)?.data ?? []
    return alignSeries(da, db)
  }, [a.id, b.id, all.byId])
  const r = pearson(aligned.x, aligned.y)

  const traces: PlotlyTrace[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: aligned.x,
      y: aligned.y,
      text: aligned.dates,
      marker: { color: a.color, size: 5, opacity: 0.6 },
      hovertemplate: `%{text}<br>${a.short}: %{x:.2f}<br>${b.short}: %{y:.2f}<extra></extra>`,
    },
  ]

  return (
    <PanelCard
      dense
      title={`Scatter: ${a.short} vs ${b.short}`}
      subtitle={`Pearson r = ${r.toFixed(3)} · n = ${aligned.x.length}`}
      action={
        <Typography
          variant="caption"
          sx={{ cursor: 'pointer', color: 'text.secondary', textDecoration: 'underline' }}
          onClick={onClose}
        >
          Close
        </Typography>
      }
    >
      <PlotlyChart
        traces={traces}
        layout={{
          xaxis: { title: `${a.label} (${a.unit || ''})` },
          yaxis: { title: `${b.label} (${b.unit || ''})` },
          margin: { l: 56, r: 16, t: 16, b: 56 },
        }}
        minHeight={400}
        ariaLabel="Bivariate scatter"
      />
    </PanelCard>
  )
}
