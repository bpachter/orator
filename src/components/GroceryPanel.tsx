import { useMemo } from 'react'
import { Box, Stack } from '@mui/material'
import { useGrocery } from '../hooks/useFredQueries'
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

export function GroceryPanel() {
  const { filters } = useFilters()
  const grocery = useGrocery(filters.range)

  const items = grocery.data?.items ?? []
  const series = grocery.data?.series ?? {}

  const traces = useMemo<PlotlyTrace[]>(() => {
    return items
      .filter((item) => (series[item.id] ?? []).length > 0)
      .map((item) => ({
        type: 'scatter',
        mode: 'lines',
        name: item.label,
        x: series[item.id].map((o) => o.date),
        y: series[item.id].map((o) => o.value),
        line: { color: item.color, width: 1.75 },
        hovertemplate: `<b>${item.label}</b> ${item.unit}: %{y:.1f}%<extra></extra>`,
      }))
  }, [items, series])

  const layout = useMemo(
    () => ({
      yaxis: {
        color: palette.textSecondary,
        gridcolor: '#162035',
        showgrid: true,
        zeroline: true,
        zerolinecolor: palette.textMuted,
        ticksuffix: '%',
      },
      legend: {
        orientation: 'h' as const,
        x: 0,
        y: -0.18,
        font: { color: palette.textSecondary, size: 11 },
        bgcolor: 'rgba(0,0,0,0)',
      },
      margin: { l: 48, r: 16, t: 8, b: 80 },
      shapes: [
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
    [],
  )

  if (grocery.isLoading) {
    return (
      <PanelCard title="Grocery Inflation">
        <LoadingState message="Loading BLS grocery prices…" />
      </PanelCard>
    )
  }
  if (grocery.isError) {
    return (
      <PanelCard title="Grocery Inflation">
        <ErrorState message={(grocery.error as Error)?.message} onRetry={() => grocery.refetch()} />
      </PanelCard>
    )
  }

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="Consumer prices"
        title="Grocery Price Inflation"
        subtitle="BLS average prices, U.S. city average · year-over-year %"
        updated={grocery.data?.updated}
        action={<DownloadMultiButton series={series} filename="grocery-prices" />}
      />

      <PanelCard
        title="All items overview"
        subtitle="Compare grocery basket components on one chart"
      >
        <PlotlyChart
          traces={traces}
          layout={layout}
          minHeight={420}
          ariaLabel="Grocery price year-over-year inflation chart"
        />
      </PanelCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(5, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {items.map((item) => {
          const data = series[item.id] ?? []
          const last = latest(data)
          const trend = trendDirection(data, 3)
          const valueColor = last && last.value > 0 ? item.color : palette.positive
          return (
            <PanelCard key={item.id} dense padding={1.5}>
              <KpiChip
                label={
                  <Stack direction="row" spacing={0.5} alignItems="baseline">
                    <span>{item.label}</span>
                    <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400 }}>
                      {item.unit}
                    </Box>
                  </Stack>
                }
                value={last ? `${last.value > 0 ? '+' : ''}${last.value.toFixed(1)}` : '—'}
                unit={last ? '%' : undefined}
                valueColor={valueColor}
                trend={trend}
                size="md"
                align="center"
                caption={last?.date}
              />
            </PanelCard>
          )
        })}
      </Box>
    </Stack>
  )
}
