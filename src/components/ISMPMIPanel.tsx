import { Box, Stack } from '@mui/material'
import { useISMPMI } from '../hooks/useFredQueries'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'

export function ISMPMIPanel() {
  const q = useISMPMI()

  if (q.isLoading) {
    return (
      <PanelCard title="ISM PMI" subtitle="Loading data…">
        <LoadingState />
      </PanelCard>
    )
  }
  if (q.isError) {
    return (
      <PanelCard title="ISM PMI">
        <ErrorState message={(q.error as Error)?.message} onRetry={() => q.refetch()} />
      </PanelCard>
    )
  }

  const data = q.data!

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Activity Indicators"
        title="ISM Purchasing Managers' Index"
        subtitle={`Index levels (50 = neutral)${data.updated ? ` · updated ${data.updated}` : ''}`}
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
          
          // Add a reference line at 50 for ISM PMI
          const traces: PlotlyTrace[] = [
            {
              type: 'scatter',
              mode: 'lines',
              x: obs.map((o) => o.date),
              y: obs.map((o) => o.value),
              line: { color: meta.color, width: 2, shape: 'spline' },
              fill: 'tozeroy',
              fillcolor: meta.color + '18',
              hovertemplate: '%{x}: %{y:.1f}<extra></extra>',
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: [obs[0]?.date, obs[obs.length - 1]?.date],
              y: [50, 50],
              line: { color: '#999', width: 1, dash: 'dash' },
              name: 'Neutral (50)',
              hovertemplate: 'Neutral: 50<extra></extra>',
            },
          ]

          return (
            <PanelCard
              key={meta.id}
              dense
              title={meta.label}
              subtitle="Index (50 = neutral, <50 = contraction)"
            >
              <PlotlyChart traces={traces} minHeight={200} ariaLabel={meta.label} />
            </PanelCard>
          )
        })}
      </Box>
    </Stack>
  )
}
