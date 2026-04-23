import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import { useRecessionSignals } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { PanelCard } from './shared/PanelCard'
import { KpiChip } from './shared/KpiChip'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { palette } from '../theme'

function riskColor(score: number): string {
  if (score >= 0.66) return palette.negative
  if (score >= 0.33) return palette.warning
  return palette.positive
}

function riskLabel(score: number): string {
  if (score >= 0.66) return 'Elevated'
  if (score >= 0.33) return 'Moderate'
  return 'Low'
}

export function RecessionSignalsPanel() {
  const { filters } = useFilters()
  const rs = useRecessionSignals(filters.range)

  if (rs.isLoading) {
    return (
      <PanelCard title="Recession Signals" subtitle="Crunching leading indicators…">
        <LoadingState />
      </PanelCard>
    )
  }
  if (rs.isError) {
    return (
      <PanelCard title="Recession Signals">
        <ErrorState message={(rs.error as Error)?.message} onRetry={() => rs.refetch()} />
      </PanelCard>
    )
  }

  const data = rs.data!
  const score = data.composite_score
  const color = riskColor(score)

  const unrate = data.series['UNRATE'] ?? []
  const t10y2y = data.series['T10Y2Y'] ?? []

  const unrateTrace: PlotlyTrace[] = [
    {
      type: 'scatter',
      mode: 'lines',
      x: unrate.map((o) => o.date),
      y: unrate.map((o) => o.value),
      line: { color: palette.series.blue, width: 1.75, shape: 'spline' },
      fill: 'tozeroy',
      fillcolor: palette.series.blue + '18',
      hovertemplate: '%{x}: %{y:.2f}%<extra></extra>',
    },
  ]

  const spreadTrace: PlotlyTrace[] = [
    {
      type: 'scatter',
      mode: 'lines',
      x: t10y2y.map((o) => o.date),
      y: t10y2y.map((o) => o.value),
      line: { color: palette.series.green, width: 1.75, shape: 'spline' },
      hovertemplate: '%{x}: %{y:.2f}<extra></extra>',
    },
  ]

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Analytics"
        title="Recession Signals"
        subtitle={`Composite leading indicator${data.updated ? ` · updated ${data.updated}` : ''}`}
      />

      <PanelCard>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack direction="row" alignItems="baseline" spacing={2}>
              <Typography
                variant="h2"
                sx={{ color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}
              >
                {Math.round(score * 100)}%
              </Typography>
              <Chip
                label={riskLabel(score)}
                sx={{ bgcolor: color + '22', color, fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Share of leading recession signals currently triggered
            </Typography>
            <LinearProgress
              variant="determinate"
              value={score * 100}
              sx={{
                mt: 2,
                height: 10,
                borderRadius: 5,
                bgcolor: palette.surfaceAlt,
                '& .MuiLinearProgress-bar': { bgcolor: color },
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 2,
              width: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            {data.signals.map((s) => (
              <PanelCard key={s.id} dense padding={1.5}>
                <KpiChip
                  label={s.label}
                  value={s.triggered ? 'TRIGGERED' : 'NORMAL'}
                  valueColor={s.triggered ? palette.negative : palette.positive}
                  size="md"
                  align="left"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {s.description}
                </Typography>
                {s.value !== null && (
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: 'JetBrains Mono, monospace', color: 'text.secondary' }}
                  >
                    Value: {s.value.toFixed(2)}
                  </Typography>
                )}
              </PanelCard>
            ))}
          </Box>
        </Stack>
      </PanelCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <PanelCard dense title="Unemployment Rate" subtitle="Sahm Rule input (3M avg)">
          <PlotlyChart traces={unrateTrace} minHeight={220} ariaLabel="Unemployment rate" />
        </PanelCard>
        <PanelCard dense title="10Y – 2Y Spread" subtitle="Negative = inverted curve">
          <PlotlyChart
            traces={spreadTrace}
            layout={{
              shapes: [
                {
                  type: 'line',
                  xref: 'paper',
                  x0: 0,
                  x1: 1,
                  y0: 0,
                  y1: 0,
                  line: { color: palette.border, width: 1, dash: 'dot' },
                },
              ],
            }}
            minHeight={220}
            ariaLabel="10Y minus 2Y Treasury spread"
          />
        </PanelCard>
      </Box>
    </Stack>
  )
}
