import { useMemo } from 'react'
import { Box, Stack } from '@mui/material'
import type { FredObs } from '../types'
import { useLabor } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import type { SeriesMetadata } from '../api/fred'
import { PanelCard } from './shared/PanelCard'
import { KpiChip } from './shared/KpiChip'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { DownloadMultiButton } from './shared/DownloadButton'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { latest, trendDirection } from '../utils/series'
import { palette } from '../theme'

export function LaborPanel() {
  const { filters } = useFilters()
  const labor = useLabor(filters.range)

  if (labor.isLoading) {
    return (
      <PanelCard title="Labor Market" subtitle="Loading employment data…">
        <LoadingState />
      </PanelCard>
    )
  }
  if (labor.isError) {
    return (
      <PanelCard title="Labor Market">
        <ErrorState
          message={(labor.error as Error)?.message}
          onRetry={() => labor.refetch()}
        />
      </PanelCard>
    )
  }

  const series = labor.data?.series ?? {}
  const meta = labor.data?.metadata ?? []

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Workforce"
        title="Labor Market"
        subtitle="Employment, wages, and labor supply"
        updated={labor.data?.updated}
        action={<DownloadMultiButton series={series} filename="labor-market" />}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {meta.map((s) => (
          <LaborChart key={s.id} meta={s} data={series[s.id] ?? []} />
        ))}
      </Box>
    </Stack>
  )
}

interface LaborChartProps {
  meta: SeriesMetadata
  data: FredObs[]
}

function LaborChart({ meta, data }: LaborChartProps) {
  const unit = meta.unit ?? ''
  const traces = useMemo<PlotlyTrace[]>(() => {
    if (!data.length) return []
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: data.map((o) => o.date),
        y: data.map((o) => o.value),
        line: { color: meta.color, width: 1.75, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: meta.color + '18',
        hovertemplate: `%{x}: %{y:,.2f} ${unit}<extra></extra>`,
      },
    ]
  }, [data, meta.color, unit])

  const layout = useMemo(
    () => ({
      yaxis: {
        color: palette.textSecondary,
        gridcolor: palette.border,
        showgrid: true,
        zeroline: false,
      },
      margin: { l: 56, r: 12, t: 8, b: 28 },
    }),
    [],
  )

  const last = latest(data)
  const trend = trendDirection(data, 6)

  return (
    <PanelCard
      dense
      title={meta.label}
      subtitle={last ? `As of ${last.date}` : undefined}
      action={
        last && (
          <KpiChip
            label="Latest"
            value={last.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            unit={unit ? ` ${unit}` : undefined}
            valueColor={meta.color}
            trend={trend}
            size="md"
            align="right"
          />
        )
      }
    >
      {data.length === 0 ? (
        <LoadingState message="No data" height={160} />
      ) : (
        <PlotlyChart traces={traces} layout={layout} minHeight={180} ariaLabel={`${meta.label} chart`} />
      )}
    </PanelCard>
  )
}
