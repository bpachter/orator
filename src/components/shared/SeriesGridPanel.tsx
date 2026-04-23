import { Box, Stack } from '@mui/material'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FredObs } from '../../types'
import { PanelCard } from './PanelCard'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { SectionHeader } from './SectionHeader'
import { PlotlyChart, type PlotlyTrace } from './PlotlyChart'
import { DownloadButton, DownloadMultiButton } from './DownloadButton'

export interface SeriesMetadata {
  id: string
  label: string
  color: string
  unit?: string | null
}

export interface SeriesGridResponse {
  updated: string
  series: Record<string, FredObs[]>
  metadata: SeriesMetadata[]
}

export interface SeriesGridPanelProps {
  query: UseQueryResult<SeriesGridResponse>
  eyebrow: string
  title: string
  subtitle?: string
  formatHover?: (unit: string | null | undefined) => string
}

function defaultFormatHover(unit: string | null | undefined): string {
  if (!unit) return '%{x}: %{y:.2f}<extra></extra>'
  if (unit === '%' || unit === 'bps') return `%{x}: %{y:.2f}${unit === 'bps' ? 'bps' : '%'}<extra></extra>`
  return `%{x}: %{y:.2f} ${unit}<extra></extra>`
}

export function SeriesGridPanel({
  query,
  eyebrow,
  title,
  subtitle,
  formatHover = defaultFormatHover,
}: SeriesGridPanelProps) {
  if (query.isLoading) {
    return (
      <PanelCard title={title} subtitle="Loading data…">
        <LoadingState />
      </PanelCard>
    )
  }
  if (query.isError) {
    return (
      <PanelCard title={title}>
        <ErrorState
          message={(query.error as Error)?.message}
          onRetry={() => query.refetch()}
        />
      </PanelCard>
    )
  }

  const data = query.data!

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        updated={data.updated}
        action={<DownloadMultiButton series={data.series} filename={title.toLowerCase().replace(/\s+/g, '-')} />}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {data.metadata.map((meta) => {
          const obs = data.series[meta.id] ?? []
          const trace: PlotlyTrace[] = [
            {
              type: 'scatter',
              mode: 'lines',
              x: obs.map((o) => o.date),
              y: obs.map((o) => o.value),
              line: { color: meta.color, width: 2, shape: 'spline' },
              fill: 'tozeroy',
              fillcolor: meta.color + '18',
              hovertemplate: formatHover(meta.unit),
            },
          ]

          return (
            <PanelCard
              key={meta.id}
              dense
              title={meta.label}
              subtitle={meta.unit ?? undefined}
              action={<DownloadButton data={obs} filename={meta.id.toLowerCase()} seriesName={meta.label} />}
            >
              <PlotlyChart traces={trace} minHeight={200} ariaLabel={meta.label} />
            </PanelCard>
          )
        })}
      </Box>
    </Stack>
  )
}
