import { useMemo } from 'react'
import { Box, Stack } from '@mui/material'
import type Plotly from 'plotly.js'
import type { FredObs } from '../types'
import { useSpreads } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { PanelCard } from './shared/PanelCard'
import { KpiChip } from './shared/KpiChip'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { DownloadMultiButton } from './shared/DownloadButton'
import { latest } from '../utils/series'
import { palette } from '../theme'

function recessionShapes(usrec: FredObs[]): Partial<Plotly.Shape>[] {
  const shapes: Partial<Plotly.Shape>[] = []
  let start: string | null = null
  for (const obs of usrec) {
    if (obs.value === 1 && start === null) {
      start = obs.date
    } else if (obs.value === 0 && start !== null) {
      shapes.push({
        type: 'rect',
        xref: 'x',
        yref: 'paper',
        x0: start,
        x1: obs.date,
        y0: 0,
        y1: 1,
        fillcolor: palette.negative + '18',
        line: { width: 0 },
      })
      start = null
    }
  }
  if (start !== null && usrec.length) {
    shapes.push({
      type: 'rect',
      xref: 'x',
      yref: 'paper',
      x0: start,
      x1: usrec[usrec.length - 1].date,
      y0: 0,
      y1: 1,
      fillcolor: palette.negative + '18',
      line: { width: 0 },
    })
  }
  return shapes
}

export function SpreadPanel() {
  const { filters } = useFilters()
  const spreads = useSpreads(filters.range)

  if (spreads.isLoading) {
    return (
      <PanelCard title="Yield Spreads & Policy">
        <LoadingState message="Loading spread data…" />
      </PanelCard>
    )
  }
  if (spreads.isError) {
    return (
      <PanelCard title="Yield Spreads & Policy">
        <ErrorState
          message={(spreads.error as Error)?.message}
          onRetry={() => spreads.refetch()}
        />
      </PanelCard>
    )
  }

  const series = spreads.data?.series ?? {}
  const usrec = series['USREC'] ?? []

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Rates"
        title="Yield Spreads & Policy Stance"
        subtitle="Curve inversions and the real policy rate vs. core inflation"
        action={<DownloadMultiButton series={series} filename="yield-spreads" />}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <SpreadChart
          title="10Y – 2Y Spread"
          subtitle="Inversion historically precedes recession by 12–18 months"
          data={series['T10Y2Y'] ?? []}
          color={palette.info}
          usrec={usrec}
        />
        <SpreadChart
          title="10Y – 3M Spread"
          subtitle="Near-term recession indicator favored by the NY Fed"
          data={series['T10Y3M'] ?? []}
          color={palette.positive}
          usrec={usrec}
        />
      </Box>
      <FedVsCpiChart
        fedfunds={series['FEDFUNDS'] ?? []}
        coreCpi={series['CPILFESL'] ?? []}
        usrec={usrec}
      />
    </Stack>
  )
}

interface SpreadChartProps {
  title: string
  subtitle: string
  data: FredObs[]
  color: string
  usrec: FredObs[]
}

function SpreadChart({ title, subtitle, data, color, usrec }: SpreadChartProps) {
  const last = latest(data)
  const isInverted = !!last && last.value < 0
  const lineColor = isInverted ? palette.negative : color
  const fillColor = (isInverted ? palette.negative : color) + '18'

  const traces = useMemo<PlotlyTrace[]>(() => {
    if (!data.length) return []
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: data.map((o) => o.date),
        y: data.map((o) => o.value),
        line: { color: lineColor, width: 1.5 },
        fill: 'tozeroy',
        fillcolor: fillColor,
        hovertemplate: '%{x}: %{y:.2f}%<extra></extra>',
      },
    ]
  }, [data, lineColor, fillColor])

  const layout = useMemo(
    () => ({
      yaxis: {
        color: palette.textSecondary,
        gridcolor: palette.border,
        showgrid: true,
        zeroline: false,
        ticksuffix: '%',
      },
      shapes: [
        ...recessionShapes(usrec),
        {
          type: 'line' as const,
          xref: 'paper' as const,
          yref: 'y' as const,
          x0: 0,
          x1: 1,
          y0: 0,
          y1: 0,
          line: { color: palette.textMuted, width: 1, dash: 'dot' as const },
        },
      ],
    }),
    [usrec],
  )

  return (
    <PanelCard
      title={title}
      subtitle={subtitle}
      action={
        last && (
          <KpiChip
            label={isInverted ? 'Inverted' : 'Spread'}
            value={`${last.value > 0 ? '+' : ''}${last.value.toFixed(2)}`}
            unit="%"
            valueColor={isInverted ? palette.negative : color}
            size="lg"
            align="right"
            caption={isInverted ? 'Recession-warning regime' : 'Normal slope'}
          />
        )
      }
    >
      {data.length === 0 ? (
        <LoadingState message="No data" />
      ) : (
        <PlotlyChart traces={traces} layout={layout} minHeight={240} ariaLabel={`${title} chart`} />
      )}
    </PanelCard>
  )
}

function FedVsCpiChart({
  fedfunds,
  coreCpi,
  usrec,
}: {
  fedfunds: FredObs[]
  coreCpi: FredObs[]
  usrec: FredObs[]
}) {
  const traces = useMemo<PlotlyTrace[]>(() => {
    if (!fedfunds.length || !coreCpi.length) return []
    return [
      {
        type: 'scatter',
        mode: 'lines',
        name: 'Fed Funds Rate',
        x: fedfunds.map((o) => o.date),
        y: fedfunds.map((o) => o.value),
        line: { color: palette.brand, width: 2 },
        hovertemplate: 'Fed Funds: %{y:.2f}%<extra></extra>',
      },
      {
        type: 'scatter',
        mode: 'lines',
        name: 'Core CPI YoY',
        x: coreCpi.map((o) => o.date),
        y: coreCpi.map((o) => o.value),
        line: { color: palette.negative, width: 2, dash: 'dot' },
        hovertemplate: 'Core CPI: %{y:.2f}%<extra></extra>',
      },
    ]
  }, [fedfunds, coreCpi])

  const layout = useMemo(
    () => ({
      yaxis: {
        color: palette.textSecondary,
        gridcolor: palette.border,
        showgrid: true,
        zeroline: false,
        ticksuffix: '%',
      },
      legend: {
        x: 0.01,
        y: 0.98,
        bgcolor: 'rgba(0,0,0,0)',
        font: { color: palette.textSecondary, size: 11 },
      },
      shapes: recessionShapes(usrec),
    }),
    [usrec],
  )

  const lastFed = latest(fedfunds)
  const lastCpi = latest(coreCpi)
  const realRate = lastFed && lastCpi ? lastFed.value - lastCpi.value : null

  return (
    <PanelCard
      title="Fed Funds vs Core CPI"
      subtitle="Real interest-rate context — shaded areas mark recessions"
      action={
        <Stack direction="row" spacing={3} alignItems="center">
          {lastFed && (
            <KpiChip
              label="Fed Funds"
              value={lastFed.value.toFixed(2)}
              unit="%"
              valueColor={palette.brand}
              size="md"
              align="right"
            />
          )}
          {lastCpi && (
            <KpiChip
              label="Core CPI"
              value={lastCpi.value.toFixed(2)}
              unit="%"
              valueColor={palette.negative}
              size="md"
              align="right"
            />
          )}
          {realRate !== null && (
            <KpiChip
              label="Real rate"
              value={`${realRate > 0 ? '+' : ''}${realRate.toFixed(2)}`}
              unit="%"
              valueColor={realRate >= 0 ? palette.positive : palette.negative}
              size="md"
              align="right"
            />
          )}
        </Stack>
      }
    >
      {!fedfunds.length || !coreCpi.length ? (
        <LoadingState message="No data" />
      ) : (
        <PlotlyChart
          traces={traces}
          layout={layout}
          minHeight={300}
          ariaLabel="Fed Funds Rate versus Core CPI"
        />
      )}
    </PanelCard>
  )
}
