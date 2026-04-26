import { useMemo } from 'react'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useGdpBreakdown } from '../hooks/useFredQueries'
import { PanelCard } from './shared/PanelCard'
import { PlotlyChart, baseLayout, baseConfig } from './shared/PlotlyChart'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { KpiChip } from './shared/KpiChip'
import { Stack } from '@mui/material'

export function GdpBreakdownPanel() {
  const q = useGdpBreakdown()
  const theme = useTheme()
  const textSecondary = theme.palette.text.secondary
  const divider = theme.palette.divider

  const latest = useMemo(() => {
    if (!q.data?.components) return null
    const gdp = q.data.components.find((c) => c.label.includes('Total'))
    if (!gdp || !gdp.data.length) return null
    return gdp.data[gdp.data.length - 1]
  }, [q.data])

  if (q.isLoading) return <PanelCard title="GDP Component Breakdown"><LoadingState /></PanelCard>
  if (q.isError || !q.data) return (
    <PanelCard title="GDP Component Breakdown">
      <ErrorState message={(q.error as Error)?.message} onRetry={() => q.refetch()} />
    </PanelCard>
  )

  const { components, updated } = q.data

  const layout = {
    ...baseLayout,
    xaxis: { ...baseLayout.xaxis, color: textSecondary, gridcolor: divider },
    yaxis: { ...baseLayout.yaxis, color: textSecondary, gridcolor: divider },
  }

  // Waterfall-style traces: C, I, G, NX as stacked bars + GDP line
  const gdpTotal = components.find((c) => c.label.includes('Total'))
  const subs = components.filter((c) => !c.label.includes('Total') && !c.label.includes('Imports'))

  const stackedTraces = subs.map((comp) => ({
    type: 'bar' as const,
    name: comp.label,
    x: comp.data.map((o) => o.date),
    y: comp.data.map((o) => o.value),
    marker: { color: comp.color },
    hovertemplate: `%{x}<br>${comp.label}: %{y:.2f}%<extra></extra>`,
  }))

  const gdpLineTrace = gdpTotal
    ? {
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Real GDP',
        x: gdpTotal.data.map((o) => o.date),
        y: gdpTotal.data.map((o) => o.value),
        line: { color: gdpTotal.color, width: 2.5 },
        hovertemplate: `%{x}<br>Real GDP: %{y:.2f}%<extra></extra>`,
      }
    : null

  const traces = [...stackedTraces, ...(gdpLineTrace ? [gdpLineTrace] : [])]

  // Most recent quarter KPIs
  const kpis = components.filter((c) => !c.label.includes('Total') && !c.label.includes('Imports'))
  const lastKpis = kpis.map((c) => ({
    label: c.label.replace(/\(.\)$/, '').trim(),
    value: c.data[c.data.length - 1]?.value ?? null,
    color: c.color,
  }))

  return (
    <Stack spacing={2}>
      <SectionHeader
        eyebrow="BEA NIPA"
        title="Real GDP Component Breakdown"
        subtitle="Quarterly percent change from prior period — BEA National Accounts Table T10101"
        updated={updated}
      />

      <Stack direction="row" flexWrap="wrap" gap={2}>
        {latest && (
          <PanelCard title="">
            <KpiChip
              label={`Real GDP (${latest.date})`}
              value={`${latest.value != null ? (latest.value > 0 ? '+' : '') + latest.value.toFixed(1) : '—'}%`}
              size="lg"
              valueColor={latest.value != null && latest.value < 0 ? '#ef4444' : '#22c55e'}
            />
          </PanelCard>
        )}
        {lastKpis.map((k) => (
          <PanelCard key={k.label} title="">
            <KpiChip
              label={k.label}
              value={k.value != null ? `${k.value > 0 ? '+' : ''}${k.value.toFixed(1)}%` : '—'}
              size="md"
              valueColor={k.color}
            />
          </PanelCard>
        ))}
      </Stack>

      <PanelCard title="GDP Components — Contribution to Growth (% change QoQ)">
        <PlotlyChart
          minHeight={300}
          traces={traces}
          layout={{
            ...layout,
            barmode: 'stack',
            yaxis: { ...layout.yaxis, title: { text: '% chg QoQ', font: { size: 10 } }, zeroline: true, zerolinecolor: divider },
            legend: { orientation: 'h', y: -0.15, font: { size: 10 } },
          }}
          config={baseConfig}
        />
      </PanelCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {components.filter((c) => !c.label.includes('Total')).map((comp) => (
          <PanelCard key={comp.id} title={comp.label}>
            <PlotlyChart
              minHeight={180}
              traces={[
                {
                  type: 'bar',
                  x: comp.data.map((o) => o.date),
                  y: comp.data.map((o) => o.value),
                  marker: {
                    color: comp.data.map((o) => (o.value != null && o.value < 0 ? '#ef4444' : comp.color)),
                  },
                  hovertemplate: `%{x}: %{y:.2f}%<extra></extra>`,
                },
              ]}
              layout={{
                ...layout,
                yaxis: { ...layout.yaxis, zeroline: true, zerolinecolor: divider },
              }}
              config={baseConfig}
            />
          </PanelCard>
        ))}
      </Box>
    </Stack>
  )
}
