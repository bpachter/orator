import { useMemo } from 'react'
import { Box, Stack } from '@mui/material'
import type { FredObs } from '../types'
import { MACRO_SERIES } from '../api/fred'
import { useMacro } from '../hooks/useFredQueries'
import { PanelCard } from './shared/PanelCard'
import { KpiChip } from './shared/KpiChip'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { latest, trendDirection } from '../utils/series'
import { palette } from '../theme'

export function MacroPanel() {
  const macro = useMacro()

  if (macro.isLoading) {
    return (
      <PanelCard title="Macro Dashboard" subtitle="Loading core indicators…">
        <LoadingState />
      </PanelCard>
    )
  }
  if (macro.isError) {
    return (
      <PanelCard title="Macro Dashboard">
        <ErrorState message={(macro.error as Error)?.message} onRetry={() => macro.refetch()} />
      </PanelCard>
    )
  }

  const series = macro.data?.series ?? {}

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Overview"
        title="Macro Dashboard"
        subtitle={`Core U.S. indicators${macro.data?.updated ? ` · updated ${macro.data.updated}` : ''}`}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        {MACRO_SERIES.map((s) => (
          <MacroChart
            key={s.id}
            label={s.label}
            unit={s.unit}
            color={s.color}
            data={series[s.id] ?? []}
          />
        ))}
      </Box>
    </Stack>
  )
}

interface MacroChartProps {
  label: string
  unit: string
  color: string
  data: FredObs[]
}

function MacroChart({ label, unit, color, data }: MacroChartProps) {
  const traces = useMemo<PlotlyTrace[]>(() => {
    if (!data.length) return []
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: data.map((o) => o.date),
        y: data.map((o) => o.value),
        line: { color, width: 1.75, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: color + '18',
        hovertemplate: `%{x}: %{y:.2f}${unit}<extra></extra>`,
      },
    ]
  }, [data, color, unit])

  const layout = useMemo(
    () => ({
      yaxis: {
        color: palette.textSecondary,
        gridcolor: '#162035',
        showgrid: true,
        zeroline: true,
        zerolinecolor: palette.border,
        ticksuffix: unit,
      },
      margin: { l: 48, r: 12, t: 8, b: 28 },
    }),
    [unit],
  )

  const last = latest(data)
  const trend = trendDirection(data, 6)

  return (
    <PanelCard
      dense
      title={label}
      subtitle={last ? `As of ${last.date}` : undefined}
      action={
        last && (
          <KpiChip
            label="Latest"
            value={last.value.toFixed(2)}
            unit={unit}
            valueColor={color}
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
        <PlotlyChart traces={traces} layout={layout} minHeight={180} ariaLabel={`${label} chart`} />
      )}
    </PanelCard>
  )
}
