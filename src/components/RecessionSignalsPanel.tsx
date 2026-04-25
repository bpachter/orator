import { useMemo } from 'react'
import { Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import type { FredObs } from '../types'
import type { RecessionSignal } from '../api/fred'
import { useRecessionSignals } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { DownloadMultiButton } from './shared/DownloadButton'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { palette } from '../theme'

// ---------------------------------------------------------------------------
// Color maps
// ---------------------------------------------------------------------------

const SEVERITY_COLOR: Record<string, string> = {
  normal: palette.positive,
  watch: palette.warning,
  warning: palette.series.orange,
  critical: palette.negative,
}

const CATEGORY_LABEL: Record<string, string> = {
  cycle: 'Business Cycle',
  labor: 'Labor Market',
  financial: 'Financial Conditions',
  stagflation: 'Stagflation Pressure',
}

const CATEGORY_COLOR: Record<string, string> = {
  cycle: palette.series.blue,
  labor: palette.series.green,
  financial: palette.series.red,
  stagflation: palette.series.amber,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function riskColor(score: number): string {
  if (score >= 0.66) return palette.negative
  if (score >= 0.40) return palette.series.orange
  if (score >= 0.20) return palette.warning
  return palette.positive
}

function riskLabel(score: number): string {
  if (score >= 0.66) return 'High'
  if (score >= 0.40) return 'Elevated'
  if (score >= 0.20) return 'Moderate'
  return 'Low'
}

function formatDeltaPoints(delta: number | null): string {
  if (delta === null) return 'n/a'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}pp`
}

function deltaPoints(series: FredObs[], periods: number): number | null {
  if (series.length <= periods) return null
  const last = series[series.length - 1]?.value
  const prev = series[series.length - 1 - periods]?.value
  if (last === undefined || prev === undefined) return null
  return (last - prev) * 100
}

/** Sort signals: triggered + critical first, then by severity, then alphabetical */
function severitySortKey(s: RecessionSignal): number {
  if (s.triggered && s.severity === 'critical') return 0
  if (s.triggered && s.severity === 'warning') return 1
  if (s.triggered) return 2
  if (s.severity === 'warning') return 3
  if (s.severity === 'watch') return 4
  return 5
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RiskGauge({
  title,
  score,
  description,
}: {
  title: string
  score: number
  description: string
}) {
  const color = riskColor(score)
  return (
    <PanelCard>
      <Stack spacing={1.5}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', lineHeight: 1, letterSpacing: '0.08em' }}
        >
          {title}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={1.5}>
          <Typography
            variant="h2"
            sx={{ color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
          >
            {Math.round(score * 100)}%
          </Typography>
          <Chip
            label={riskLabel(score)}
            size="small"
            sx={{ bgcolor: color + '22', color, fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={score * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: palette.surfaceAlt,
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
          }}
        />
      </Stack>
    </PanelCard>
  )
}

function SignalCard({ signal }: { signal: RecessionSignal }) {
  const sevColor = SEVERITY_COLOR[signal.severity] ?? palette.positive
  const catColor = CATEGORY_COLOR[signal.category] ?? palette.series.blue
  const catLabel = CATEGORY_LABEL[signal.category] ?? signal.category
  return (
    <Paper
      sx={{
        p: 1.5,
        borderLeft: `3px solid ${sevColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        height: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography
          sx={{
            color: catColor,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            fontSize: '0.6rem',
            lineHeight: 1,
          }}
        >
          {catLabel}
        </Typography>
        <Chip
          label={signal.triggered ? '⚠ TRIGGERED' : signal.severity.toUpperCase()}
          size="small"
          sx={{
            bgcolor: sevColor + '22',
            color: sevColor,
            fontWeight: 700,
            fontSize: '0.6rem',
            height: 18,
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
        {signal.label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, flex: 1 }}>
        {signal.description}
      </Typography>
      {signal.value !== null && (
        <Typography
          variant="caption"
          sx={{ fontFamily: 'JetBrains Mono, monospace', color: sevColor, fontWeight: 700 }}
        >
          {signal.value.toFixed(2)}
        </Typography>
      )}
    </Paper>
  )
}

interface MiniChartProps {
  title: string
  subtitle: string
  data: FredObs[]
  color: string
  threshold?: number
}

function MiniChart({ title, subtitle, data, color, threshold }: MiniChartProps) {
  const traces: PlotlyTrace[] = useMemo(() => {
    if (!data.length) return []
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: data.map((o) => o.date),
        y: data.map((o) => o.value),
        line: { color, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: color + '18',
        hovertemplate: `%{x}: %{y:.2f}<extra></extra>`,
      },
    ]
  }, [data, color])

  const shapes =
    threshold !== undefined
      ? [
          {
            type: 'line' as const,
            xref: 'paper' as const,
            x0: 0,
            x1: 1,
            y0: threshold,
            y1: threshold,
            line: { color: palette.negative + 'bb', width: 1.5, dash: 'dash' as const },
          },
        ]
      : []

  if (!data.length) {
    return (
      <PanelCard dense title={title} subtitle={subtitle}>
        <Box
          sx={{
            height: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
          }}
        >
          Data unavailable
        </Box>
      </PanelCard>
    )
  }

  return (
    <PanelCard dense title={title} subtitle={subtitle}>
      <PlotlyChart traces={traces} layout={{ shapes }} minHeight={160} ariaLabel={title} />
    </PanelCard>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function RecessionSignalsPanel() {
  const { filters } = useFilters()
  const rs = useRecessionSignals(filters.range)

  if (rs.isLoading) {
    return (
      <PanelCard title="Recession & Macro Stress Signals" subtitle="Crunching leading indicators…">
        <LoadingState />
      </PanelCard>
    )
  }
  if (rs.isError) {
    return (
      <PanelCard title="Recession & Macro Stress Signals">
        <ErrorState message={(rs.error as Error)?.message} onRetry={() => rs.refetch()} />
      </PanelCard>
    )
  }

  const data = rs.data!
  const sortedSignals = [...data.signals].sort((a, b) => severitySortKey(a) - severitySortKey(b))
  const triggeredCount = data.signals.filter((s) => s.triggered).length
  const watchCount = data.signals.filter(
    (s) => !s.triggered && (s.severity === 'watch' || s.severity === 'warning'),
  ).length

  const sahmData = data.series['SAHM_SCORE'] ?? []
  const hyData = data.series['BAMLH0A0HYM2'] ?? []
  const miseryData = data.series['MISERY_INDEX'] ?? []
  const realWagesData = data.series['REAL_WAGES'] ?? []
  const napmData = data.series['IPMAN_YOY'] ?? []
  const leiChangeData = data.series['LEI_6M_CHANGE'] ?? []
  const recessionRiskData = (data.series['RECESSION_RISK'] ?? []).map((o) => ({
    ...o,
    value: o.value * 100,
  }))
  const risk3mDelta = deltaPoints(data.series['RECESSION_RISK'] ?? [], 3)
  const risk12mDelta = deltaPoints(data.series['RECESSION_RISK'] ?? [], 12)

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Analytics"
        title="Recession &amp; Macro Stress Signals"
        subtitle="12-factor composite: business cycle, labor, financial conditions, and stagflation pressure"
        updated={data.updated}
        action={<DownloadMultiButton series={data.series} filename="recession-signals" />}
      />

      {/* Risk gauges */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <RiskGauge
          title="Recession Risk — Weighted Composite"
          score={data.composite_score}
          description={`${triggeredCount} of ${data.signals.length} signals triggered · ${watchCount} on watch`}
        />
        <RiskGauge
          title="Stagflation Pressure"
          score={data.stagflation_score}
          description="Misery Index + real wage erosion (purchasing-power signals)"
        />
      </Box>

      {/* Recession risk history trend */}
      <MiniChart
        title="Recession Risk Model"
        subtitle={`Weighted composite (monthly, up to 5Y) · 3M ${formatDeltaPoints(risk3mDelta)} · 12M ${formatDeltaPoints(risk12mDelta)}`}
        data={recessionRiskData}
        color={palette.series.red}
        threshold={40}
      />

      {/* Signal cards sorted by severity */}
      <Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Signal Detail
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 1.5,
          }}
        >
          {sortedSignals.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </Box>
      </Box>

      {/* Key indicator mini-charts */}
      <Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Key Indicator Charts
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <MiniChart
            title="Sahm Rule Score"
            subtitle="Triggers at 0.5 — 3M avg unemployment rise above 12M low"
            data={sahmData}
            color={palette.series.red}
            threshold={0.5}
          />
          <MiniChart
            title="High-Yield Credit Spread"
            subtitle="Stress threshold: 500 bps (ICE BofA OAS)"
            data={hyData}
            color={palette.series.orange}
            threshold={500}
          />
          <MiniChart
            title="Misery Index"
            subtitle="Unemployment + CPI YoY — stagflation pressure at 10+"
            data={miseryData}
            color={palette.series.amber}
            threshold={10}
          />
          <MiniChart
            title="Real Wage Growth"
            subtitle="Nominal wages YoY minus CPI YoY — below 0 = erosion"
            data={realWagesData}
            color={palette.series.cyan}
            threshold={0}
          />
          <MiniChart
            title="Manufacturing Output Momentum"
            subtitle="IPMAN YoY below 0 = manufacturing contraction proxy"
            data={napmData}
            color={palette.series.purple}
            threshold={0}
          />
          <MiniChart
            title="Leading Index (6M Δ)"
            subtitle="OECD CLI proxy: negative 6-month % change = leading downturn signal"
            data={leiChangeData}
            color={palette.series.blue}
            threshold={0}
          />
        </Box>
      </Box>
    </Stack>
  )
}

