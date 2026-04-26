import { useMonetaryConditions } from '../hooks/useFredQueries'
import { ErrorState, LoadingState, PlotlyChart, PanelCard, KpiChip, RangePicker } from './shared'
import { Box, Grid, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import type { TimeRange } from '../types'

export function MonetaryConditionsPanel() {
  const [range, setRange] = useState<TimeRange>('10Y')
  const { data, isLoading, isError } = useMonetaryConditions(range)

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState message="Failed to load monetary conditions data" />

  // Helper: get latest value
  const getLatest = (id: string) => {
    const series = data.series[id]
    if (!series || series.length === 0) return null
    return series[series.length - 1].value
  }

  const m1Latest = getLatest('M1SL')
  const m2Latest = getLatest('M2SL')
  const baseLatest = getLatest('AMBSL')
  const reservesLatest = getLatest('RESBALNS')
  const lendingLatest = getLatest('LMMNRNJ')
  const velocityLatest = getLatest('M2V')

  return (
    <PanelCard>
      <Stack spacing={3}>
        {/* Range Selector */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <RangePicker value={range} onChange={setRange} />
        </Box>

        {/* KPI Row */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="M1 Growth (YoY %)"
              value={m1Latest?.toFixed(1)}
              unit="%"
              valueColor={m1Latest && m1Latest > 0 ? '#6d91c9' : '#6b7280'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="M2 Growth (YoY %)"
              value={m2Latest?.toFixed(1)}
              unit="%"
              valueColor={m2Latest && m2Latest > 3 ? '#ef4444' : '#82aec2'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="Monetary Base (YoY %)"
              value={baseLatest?.toFixed(1)}
              unit="%"
              valueColor="#c98f5a"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="Bank Reserves ($B)"
              value={reservesLatest?.toFixed(0)}
              unit=""
              valueColor="#d7b46a"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="M2 Velocity"
              value={velocityLatest?.toFixed(2)}
              unit="x"
              valueColor={velocityLatest && velocityLatest > 1.5 ? '#22c55e' : '#f59e0b'}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2}>
          {/* M1 vs M2 vs M3 Growth */}
          {data.series['M1SL'] && (
            <Grid item xs={12} md={6}>
              <PlotlyChart
                ariaLabel="Broad Money Supply Growth (YoY %)"
                traces={[
                  {
                    x: data.series['M1SL'].map((o) => o.date),
                    y: data.series['M1SL'].map((o) => o.value),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'M1',
                    line: { color: '#6d91c9', width: 2 },
                  },
                  ...(data.series['M2SL']
                    ? [
                        {
                          x: data.series['M2SL'].map((o) => o.date),
                          y: data.series['M2SL'].map((o) => o.value),
                          type: 'scatter' as const,
                          mode: 'lines' as const,
                          name: 'M2',
                          line: { color: '#82aec2', width: 2 },
                        },
                      ]
                    : []),
                  ...(data.series['M3SL']
                    ? [
                        {
                          x: data.series['M3SL'].map((o) => o.date),
                          y: data.series['M3SL'].map((o) => o.value),
                          type: 'scatter' as const,
                          mode: 'lines' as const,
                          name: 'M3',
                          line: { color: '#5f8f97', width: 2 },
                        },
                      ]
                    : []),
                ]}
                layout={{
                  height: 300,
                  margin: { l: 50, r: 20, t: 30, b: 40 },
                  yaxis: { title: 'YoY %' },
                }}
              />
            </Grid>
          )}

          {/* Monetary Base + Reserves */}
          {data.series['AMBSL'] && (
            <Grid item xs={12} md={6}>
              <PlotlyChart
                ariaLabel="Monetary Base & Bank Reserves"
                traces={[
                  {
                    x: data.series['AMBSL'].map((o) => o.date),
                    y: data.series['AMBSL'].map((o) => o.value),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Monetary Base (YoY %)',
                    line: { color: '#c98f5a', width: 2 },
                    yaxis: 'y',
                  },
                  ...(data.series['RESBALNS']
                    ? [
                        {
                          x: data.series['RESBALNS'].map((o) => o.date),
                          y: data.series['RESBALNS'].map((o) => o.value),
                          type: 'scatter' as const,
                          mode: 'lines' as const,
                          name: 'Bank Reserves ($B)',
                          line: { color: '#d7b46a', width: 2 },
                          yaxis: 'y2' as const,
                        },
                      ]
                    : []),
                ]}
                layout={{
                  height: 300,
                  margin: { l: 50, r: 50, t: 30, b: 40 },
                  yaxis: { title: 'Monetary Base (YoY %)' },
                  yaxis2: { title: 'Bank Reserves ($B)', overlaying: 'y', side: 'right' },
                }}
              />
            </Grid>
          )}

          {/* Discount Window + Reverse Repos */}
          {data.series['DPCBCTSL'] && (
            <Grid item xs={12} md={6}>
              <PlotlyChart
                ariaLabel="Fed Lending Facilities (Discount Window + Reverse Repos)"
                traces={[
                  {
                    x: data.series['DPCBCTSL'].map((o) => o.date),
                    y: data.series['DPCBCTSL'].map((o) => o.value / 1000), // Convert $M to $B
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Discount Window ($B)',
                    line: { color: '#b7834c', width: 2 },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(183, 131, 76, 0.1)',
                  },
                  ...(data.series['RRPONTSYD']
                    ? [
                        {
                          x: data.series['RRPONTSYD'].map((o) => o.date),
                          y: data.series['RRPONTSYD'].map((o) => o.value),
                          type: 'scatter' as const,
                          mode: 'lines' as const,
                          name: 'Reverse Repos ($B)',
                          line: { color: '#a7a9bc', width: 2 },
                        },
                      ]
                    : []),
                ]}
                layout={{
                  height: 300,
                  margin: { l: 50, r: 20, t: 30, b: 40 },
                  yaxis: { title: '$B' },
                }}
              />
            </Grid>
          )}

          {/* M2 Velocity */}
          {data.series['M2V'] && (
            <Grid item xs={12} md={6}>
              <PlotlyChart
                ariaLabel="M2 Velocity (GDP/M2 Ratio)"
                traces={[
                  {
                    x: data.series['M2V'].map((o) => o.date),
                    y: data.series['M2V'].map((o) => o.value),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'M2 Velocity',
                    line: { color: '#b0b9d4', width: 2 },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(176, 185, 212, 0.1)',
                  },
                ]}
                layout={{
                  height: 300,
                  margin: { l: 50, r: 20, t: 30, b: 40 },
                  yaxis: { title: 'Ratio (GDP/M2)' },
                }}
              />
            </Grid>
          )}

          {/* Lending Standards */}
          {data.series['LMMNRNJ'] && (
            <Grid item xs={12}>
              <PlotlyChart
                ariaLabel="Net % Tightening of Bank Lending Standards"
                traces={[
                  {
                    x: data.series['LMMNRNJ'].map((o) => o.date),
                    y: data.series['LMMNRNJ'].map((o) => o.value),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Net % Tight',
                    line: { color: '#6fa49a', width: 2 },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(111, 164, 154, 0.1)',
                  },
                ]}
                layout={{
                  height: 250,
                  margin: { l: 50, r: 20, t: 30, b: 40 },
                  yaxis: { title: 'Net % Tightening' },
                }}
              />
            </Grid>
          )}
        </Grid>

        {/* Interpretation Card */}
        <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: 1, border: '1px solid #e5e7eb' }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              💰 Monetary Policy Transmission
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
              {m2Latest && m2Latest > 5
                ? `M2 growth remains elevated at ${m2Latest.toFixed(1)}% YoY, `
                : `M2 growth is moderating at ${m2Latest?.toFixed(1)}% YoY, `}
              {lendingLatest && lendingLatest > 30
                ? `but lending standards are tightening (${lendingLatest.toFixed(1)}% net tight). `
                : `and lending standards are easing. `}
              {velocityLatest && velocityLatest > 1.7
                ? 'Money is circulating faster (high velocity), supporting demand. '
                : 'Money velocity is subdued; dollar is being hoarded. '}
              {baseLatest && baseLatest > 0
                ? 'Fed is maintaining accommodative base growth.'
                : 'Fed is draining the monetary base (restrictive).'}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </PanelCard>
  )
}

