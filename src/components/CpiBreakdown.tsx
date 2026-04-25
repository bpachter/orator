import { useMemo } from 'react'
import { Box, Stack } from '@mui/material'
import type { CpiComponent, FredObs } from '../types'
import { useCpiBreakdown } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { PanelCard } from './shared/PanelCard'
import { KpiChip } from './shared/KpiChip'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { DownloadMultiButton } from './shared/DownloadButton'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { latest, trendDirection } from '../utils/series'
import { palette } from '../theme'

export function CpiBreakdown() {
  const { filters } = useFilters()
  const cpi = useCpiBreakdown(filters.range)

  if (cpi.isLoading) {
    return (
      <PanelCard title="CPI Breakdown">
        <LoadingState message="Loading CPI components…" />
      </PanelCard>
    )
  }
  if (cpi.isError) {
    return (
      <PanelCard title="CPI Breakdown">
        <ErrorState message={(cpi.error as Error)?.message} onRetry={() => cpi.refetch()} />
      </PanelCard>
    )
  }

  const components = cpi.data?.components ?? []
  const series = cpi.data?.series ?? {}

  const [headline, core, ...rest] = components

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Inflation"
        title="CPI Breakdown"
        subtitle="Year-over-year % change by component"
        updated={cpi.data?.updated}
        action={<DownloadMultiButton series={series} filename="cpi-breakdown" />}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        {[headline, core].filter(Boolean).map((c) => (
          <CpiChart key={c.id} component={c} data={series[c.id] ?? []} minHeight={240} prominent />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {rest.map((c) => (
          <CpiChart key={c.id} component={c} data={series[c.id] ?? []} minHeight={170} />
        ))}
      </Box>
    </Stack>
  )
}

interface CpiChartProps {
  component: CpiComponent
  data: FredObs[]
  minHeight: number
  prominent?: boolean
}

function CpiChart({ component, data, minHeight, prominent }: CpiChartProps) {
  const traces = useMemo<PlotlyTrace[]>(() => {
    if (!data.length) return []
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: data.map((o) => o.date),
        y: data.map((o) => o.value),
        line: { color: component.color, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: component.color + '18',
        hovertemplate: '%{x}: %{y:.2f}%<extra></extra>',
      },
    ]
  }, [data, component])

  const layout = useMemo(
    () => ({
      yaxis: {
        color: palette.textSecondary,
        gridcolor: palette.border,
        showgrid: true,
        zeroline: true,
        zerolinecolor: palette.border,
        ticksuffix: '%',
      },
      shapes: [
        {
          type: 'line' as const,
          xref: 'paper' as const,
          yref: 'y' as const,
          x0: 0,
          x1: 1,
          y0: 0,
          y1: 0,
          line: { color: palette.border, width: 1 },
        },
      ],
      margin: { l: 44, r: 12, t: 8, b: 28 },
    }),
    [],
  )

  const last = latest(data)
  const trend = trendDirection(data, 3)
  const valueColor = last
    ? last.value > 0
      ? component.color
      : palette.positive
    : component.color

  return (
    <PanelCard
      dense
      title={component.label}
      subtitle={last ? `As of ${last.date}` : undefined}
      action={
        last && (
          <KpiChip
            label="YoY"
            value={`${last.value > 0 ? '+' : ''}${last.value.toFixed(2)}`}
            unit="%"
            valueColor={valueColor}
            trend={trend}
            size={prominent ? 'lg' : 'md'}
            align="right"
          />
        )
      }
    >
      {data.length === 0 ? (
        <LoadingState message="No data" height={minHeight} />
      ) : (
        <PlotlyChart
          traces={traces}
          layout={layout}
          minHeight={minHeight}
          ariaLabel={`${component.label} year over year inflation`}
        />
      )}
    </PanelCard>
  )
}
