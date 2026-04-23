import { Box, Stack } from '@mui/material'
import { useInflation } from '../hooks/useFredQueries'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'

export function InflationPanel() {
  const q = useInflation()

  if (q.isLoading) {
    return (
      <PanelCard title="Inflation Indicators" subtitle="Loading data…">
        <LoadingState />
      </PanelCard>
    )
  }
  if (q.isError) {
    return (
      <PanelCard title="Inflation Indicators">
        <ErrorState message={(q.error as Error)?.message} onRetry={() => q.refetch()} />
      </PanelCard>
    )
  }

  const data = q.data!

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Prices"
        title="Inflation Indicators"
        subtitle={`Year-over-year growth${data.updated ? ` · updated ${data.updated}` : ''}`}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
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
              hovertemplate: '%{x}: %{y:.2f}%<extra></extra>',
            },
          ]

          return (
            <PanelCard
              key={meta.id}
              dense
              title={meta.label}
              subtitle={`${meta.unit || '%'} change YoY`}
            >
              <PlotlyChart traces={trace} minHeight={200} ariaLabel={meta.label} />
            </PanelCard>
          )
        })}
      </Box>
    </Stack>
  )
}
