import { useMemo } from 'react'
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { useVolatility } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { PanelCard } from './shared/PanelCard'
import { PlotlyChart, baseLayout, baseConfig } from './shared/PlotlyChart'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { KpiChip } from './shared/KpiChip'
import type { FredObs } from '../types'

// VIX regime thresholds
const REGIMES = [
  { max: 15, label: 'Calm', color: '#22c55e', description: 'Low volatility — complacency or stable environment' },
  { max: 25, label: 'Normal', color: '#6d91c9', description: 'Moderate volatility — typical market functioning' },
  { max: 35, label: 'Elevated', color: '#f59e0b', description: 'Elevated volatility — risk-off pressures building' },
  { max: Infinity, label: 'Crisis', color: '#ef4444', description: 'Crisis regime — systemic fear, forced liquidations' },
]

function getRegime(vix: number) {
  return REGIMES.find((r) => vix <= r.max) ?? REGIMES[REGIMES.length - 1]
}

function computePercentile(series: FredObs[], current: number): number {
  if (!series.length) return 0
  const sorted = [...series].map((o) => o.value).sort((a, b) => a - b)
  const below = sorted.filter((v) => v <= current).length
  return Math.round((below / sorted.length) * 100)
}

export function VolatilityPanel() {
  const { filters } = useFilters()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const q = useVolatility(filters.range)

  const derived = useMemo(() => {
    if (!q.data) return null
    const s = q.data.series
    const vixSeries = s['VIX'] ?? []
    const vix3mSeries = s['VIX3M'] ?? []
    const skewSeries = s['SKEW'] ?? []

    const latestVix = vixSeries[vixSeries.length - 1]?.value ?? null
    const latestVix3m = vix3mSeries[vix3mSeries.length - 1]?.value ?? null
    const latestSkew = skewSeries[skewSeries.length - 1]?.value ?? null

    const regime = latestVix != null ? getRegime(latestVix) : null
    const vixPct = latestVix != null ? computePercentile(vixSeries, latestVix) : null
    // Contango: VIX3M > VIX (calm, normal term structure)
    // Backwardation: VIX3M < VIX (fear, inverted term structure)
    const termStructure =
      latestVix != null && latestVix3m != null
        ? latestVix3m > latestVix
          ? 'contango'
          : 'backwardation'
        : null

    return { vixSeries, vix3mSeries, skewSeries, latestVix, latestVix3m, latestSkew, regime, vixPct, termStructure }
  }, [q.data])

  if (q.isLoading) return <PanelCard title="CBOE Volatility Indices"><LoadingState /></PanelCard>
  if (q.isError || !derived) return (
    <PanelCard title="CBOE Volatility Indices">
      <ErrorState message={(q.error as Error)?.message} onRetry={() => q.refetch()} />
    </PanelCard>
  )

  const { vixSeries, vix3mSeries, skewSeries, latestVix, latestVix3m, latestSkew, regime, vixPct, termStructure } = derived
  const textSecondary = theme.palette.text.secondary
  const divider = theme.palette.divider

  const layout = {
    ...baseLayout,
    xaxis: { ...baseLayout.xaxis, color: textSecondary, gridcolor: divider },
    yaxis: { ...baseLayout.yaxis, color: textSecondary, gridcolor: divider },
  }

  // Build VIX chart with regime band shapes
  const vixShapes = REGIMES.slice(0, -1).map((r, i) => {
    const prev = i > 0 ? REGIMES[i - 1].max : 0
    return {
      type: 'rect' as const,
      xref: 'paper' as const,
      yref: 'y' as const,
      x0: 0, x1: 1,
      y0: prev, y1: r.max,
      fillcolor: alpha(r.color, isDark ? 0.08 : 0.06),
      line: { width: 0 },
      layer: 'below' as const,
    }
  })
  // Crisis band extends to top
  vixShapes.push({
    type: 'rect',
    xref: 'paper',
    yref: 'y',
    x0: 0, x1: 1,
    y0: 35, y1: 100,
    fillcolor: alpha('#ef4444', isDark ? 0.08 : 0.06),
    line: { width: 0 },
    layer: 'below',
  })

  const termBars = latestVix != null && latestVix3m != null ? [
    {
      type: 'bar' as const,
      x: ['VIX (30d)', 'VIX3M (3m)'],
      y: [latestVix, latestVix3m],
      marker: {
        color: [
          termStructure === 'backwardation' ? '#ef4444' : '#6d91c9',
          termStructure === 'backwardation' ? '#f59e0b' : '#22c55e',
        ],
      },
      text: [latestVix?.toFixed(1), latestVix3m?.toFixed(1)],
      textposition: 'auto' as const,
      hovertemplate: '%{x}: %{y:.2f}<extra></extra>',
    },
  ] : []

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Volatility Suite"
        title="CBOE Volatility Indices"
        subtitle="VIX (30-day), VIX3M (3-month implied vol), SKEW (tail-risk) — daily data from CBOE"
        updated={q.data?.updated}
      />

      {/* KPI row */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <PanelCard title="">
          <Stack spacing={0.5}>
            <KpiChip
              label="VIX (Current)"
              value={latestVix != null ? latestVix.toFixed(1) : '—'}
              unit="pts"
              size="lg"
              valueColor={regime?.color}
              caption={
                regime && (
                  <Chip
                    label={regime.label}
                    size="small"
                    sx={{ bgcolor: alpha(regime.color, 0.15), color: regime.color, fontWeight: 700, fontSize: 10 }}
                  />
                )
              }
            />
            {vixPct != null && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {vixPct}th percentile (historical)
              </Typography>
            )}
          </Stack>
        </PanelCard>

        <PanelCard title="">
          <KpiChip
            label="VIX3M"
            value={latestVix3m != null ? latestVix3m.toFixed(1) : '—'}
            unit="pts"
            size="lg"
            caption={
              termStructure && (
                <Chip
                  label={termStructure === 'contango' ? 'Contango (calm)' : 'Backwardation (fear)'}
                  size="small"
                  sx={{
                    bgcolor: alpha(termStructure === 'contango' ? '#22c55e' : '#ef4444', 0.15),
                    color: termStructure === 'contango' ? '#22c55e' : '#ef4444',
                    fontWeight: 700,
                    fontSize: 10,
                  }}
                />
              )
            }
          />
        </PanelCard>

        <PanelCard title="">
          <KpiChip
            label="SKEW Index"
            value={latestSkew != null ? latestSkew.toFixed(1) : '—'}
            unit="pts"
            size="lg"
            valueColor={latestSkew != null && latestSkew > 145 ? '#f59e0b' : undefined}
            caption={
              latestSkew != null ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {latestSkew > 145 ? '⚠ Elevated tail risk' : latestSkew > 130 ? 'Moderate skew' : 'Normal distribution'}
                </Typography>
              ) : null
            }
          />
        </PanelCard>
      </Stack>

      {/* VIX with regime bands */}
      <PanelCard title="VIX — Daily Volatility with Regime Bands">
        <Box mb={1}>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {REGIMES.map((r) => (
              <Tooltip key={r.label} title={r.description} arrow>
                <Chip
                  label={`${r.label} ${r.max < Infinity ? `(< ${r.max})` : '(> 35)'}`}
                  size="small"
                  sx={{ bgcolor: alpha(r.color, 0.15), color: r.color, fontSize: 10, fontWeight: 600, cursor: 'help' }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Box>
        <PlotlyChart
          minHeight={260}
          shapes={vixShapes}
          traces={[
            {
              type: 'scatter',
              mode: 'lines',
              x: vixSeries.map((o) => o.date),
              y: vixSeries.map((o) => o.value),
              name: 'VIX',
              line: { color: '#c98f5a', width: 1.5 },
              hovertemplate: '%{x}: %{y:.2f}<extra>VIX</extra>',
            },
          ]}
          layout={{
            ...layout,
            yaxis: { ...layout.yaxis, title: { text: 'VIX', font: { size: 10 } }, rangemode: 'tozero' },
          }}
          config={baseConfig}
        />
      </PanelCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {/* VIX vs VIX3M term structure bar */}
        <PanelCard title={`VIX Term Structure — ${termStructure === 'backwardation' ? 'Backwardation (Fear)' : termStructure === 'contango' ? 'Contango (Calm)' : '—'}`}>
          <PlotlyChart
            minHeight={200}
            traces={termBars}
            layout={{
              ...layout,
              xaxis: { ...layout.xaxis, type: 'category' as const },
              yaxis: { ...layout.yaxis, rangemode: 'tozero' },
              bargap: 0.4,
            }}
            config={baseConfig}
          />
        </PanelCard>

        {/* SKEW index */}
        <PanelCard title="CBOE SKEW — Tail Risk">
          <PlotlyChart
            minHeight={200}
            traces={[
              {
                type: 'scatter',
                mode: 'lines',
                x: skewSeries.map((o) => o.date),
                y: skewSeries.map((o) => o.value),
                name: 'SKEW',
                line: { color: '#d7b46a', width: 1.5 },
                hovertemplate: '%{x}: %{y:.1f}<extra>SKEW</extra>',
              },
            ]}
            layout={{
              ...layout,
              shapes: [
                {
                  type: 'line',
                  xref: 'paper',
                  yref: 'y',
                  x0: 0, x1: 1,
                  y0: 145, y1: 145,
                  line: { color: alpha('#f59e0b', 0.7), width: 1.5, dash: 'dot' },
                },
              ],
              yaxis: { ...layout.yaxis, title: { text: 'SKEW', font: { size: 10 } } },
            }}
            config={baseConfig}
          />
        </PanelCard>
      </Box>

      {/* VIX3M full history */}
      {vix3mSeries.length > 0 && (
        <PanelCard title="VIX3M — 3-Month Implied Volatility">
          <PlotlyChart
            minHeight={200}
            traces={[
              {
                type: 'scatter',
                mode: 'lines',
                x: vix3mSeries.map((o) => o.date),
                y: vix3mSeries.map((o) => o.value),
                name: 'VIX3M',
                line: { color: '#6d91c9', width: 1.5 },
                hovertemplate: '%{x}: %{y:.2f}<extra>VIX3M</extra>',
              },
            ]}
            layout={{
              ...layout,
              yaxis: { ...layout.yaxis, rangemode: 'tozero' },
            }}
            config={baseConfig}
          />
        </PanelCard>
      )}
    </Stack>
  )
}
