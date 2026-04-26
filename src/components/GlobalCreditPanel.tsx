import { Box, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useGlobalCredit } from '../hooks/useFredQueries'
import { PanelCard } from './shared/PanelCard'
import { PlotlyChart, baseLayout, baseConfig } from './shared/PlotlyChart'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { KpiChip } from './shared/KpiChip'

export function GlobalCreditPanel() {
  const q = useGlobalCredit()
  const theme = useTheme()
  const textSecondary = theme.palette.text.secondary
  const divider = theme.palette.divider

  if (q.isLoading) return <PanelCard title="Global Private Credit"><LoadingState /></PanelCard>
  if (q.isError || !q.data) return (
    <PanelCard title="Global Private Credit">
      <ErrorState message={(q.error as Error)?.message} onRetry={() => q.refetch()} />
    </PanelCard>
  )

  const { series, updated } = q.data

  const layout = {
    ...baseLayout,
    xaxis: { ...baseLayout.xaxis, color: textSecondary, gridcolor: divider },
    yaxis: { ...baseLayout.yaxis, color: textSecondary, gridcolor: divider },
  }

  // Latest reading per country for KPI bar
  const latestByCountry = series
    .map((s) => ({
      label: s.label,
      color: s.color,
      value: s.data[s.data.length - 1]?.value ?? null,
      date: s.data[s.data.length - 1]?.date ?? '',
    }))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="BIS Statistics"
        title="Global Private Non-Financial Credit (% of GDP)"
        subtitle="Total credit to the private non-financial sector as % of GDP — BIS annual data"
        updated={updated}
      />

      {/* KPI chips — current credit/GDP by country */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {latestByCountry.map((k) => (
          <PanelCard key={k.label} title="">
            <KpiChip
              label={k.label}
              value={k.value != null ? `${k.value.toFixed(0)}%` : '—'}
              unit="GDP"
              size="md"
              valueColor={k.color}
              caption={k.date}
            />
          </PanelCard>
        ))}
      </Stack>

      {/* Multi-country line chart */}
      <PanelCard title="Private Credit / GDP — Selected Economies">
        <PlotlyChart
          minHeight={320}
          traces={series.map((s) => ({
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: s.label,
            x: s.data.map((o) => o.date),
            y: s.data.map((o) => o.value),
            line: { color: s.color, width: 1.8 },
            hovertemplate: `%{x}: %{y:.1f}%<extra>${s.label}</extra>`,
          }))}
          layout={{
            ...layout,
            yaxis: { ...layout.yaxis, title: { text: '% of GDP', font: { size: 10 } } },
            legend: { orientation: 'h', y: -0.15, font: { size: 10 } },
          }}
          config={baseConfig}
        />
      </PanelCard>

      {/* Latest snapshot bar */}
      <PanelCard title="Current Credit/GDP by Country">
        <PlotlyChart
          minHeight={200}
          traces={[
            {
              type: 'bar' as const,
              x: latestByCountry.map((k) => k.label),
              y: latestByCountry.map((k) => k.value),
              marker: { color: latestByCountry.map((k) => k.color) },
              text: latestByCountry.map((k) => (k.value != null ? `${k.value.toFixed(0)}%` : '')),
              textposition: 'auto' as const,
              hovertemplate: '%{x}: %{y:.1f}%<extra></extra>',
            },
          ]}
          layout={{
            ...layout,
            yaxis: { ...layout.yaxis, title: { text: '% of GDP', font: { size: 10 } } },
            bargap: 0.3,
          }}
          config={baseConfig}
        />
      </PanelCard>

      {/* Individual country sparklines */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {series.map((s) => (
          <PanelCard key={s.country} title={s.label}>
            <PlotlyChart
              minHeight={160}
              traces={[
                {
                  type: 'scatter' as const,
                  mode: 'lines' as const,
                  x: s.data.map((o) => o.date),
                  y: s.data.map((o) => o.value),
                  line: { color: s.color, width: 1.5 },
                  fill: 'tozeroy' as const,
                  fillcolor: `${s.color}22`,
                  hovertemplate: `%{x}: %{y:.1f}%<extra></extra>`,
                },
              ]}
              layout={{ ...layout, yaxis: { ...layout.yaxis, rangemode: 'tozero' } }}
              config={baseConfig}
            />
          </PanelCard>
        ))}
      </Box>
    </Stack>
  )
}
