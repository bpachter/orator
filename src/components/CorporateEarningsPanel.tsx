import { useCorporateEarnings } from '../hooks/useFredQueries'
import { ErrorState, LoadingState, PlotlyChart, PanelCard, KpiChip } from './shared'
import { Box, Grid, Stack, Typography } from '@mui/material'
import { TrendingDown, TrendingUp } from 'lucide-react'

export function CorporateEarningsPanel() {
  const { data, isLoading, isError } = useCorporateEarnings()

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState message="Failed to load corporate earnings data" />

  // Helper: get latest value from series
  const getLatest = (series: Array<{ date: string; value: number }>) => {
    if (!series || series.length === 0) return null
    return series[series.length - 1].value
  }

  // Helper: get YoY change
  const getYoYChange = (series: Array<{ date: string; value: number }>) => {
    if (!series || series.length < 5) return null
    const current = series[series.length - 1].value
    const prior = series[series.length - 5].value
    if (prior === 0) return null
    return ((current - prior) / Math.abs(prior)) * 100
  }

  const latestProfits = getLatest(data.profits)
  const latestNetMargin = getLatest(data.net_margin)
  const latestOpMargin = getLatest(data.operating_margin)
  const latestEPS = getLatest(data.earnings_per_share)
  const latestPE = getLatest(data.pe_ratio)

  const marginChange = latestNetMargin !== null && data.net_margin.length > 4
    ? data.net_margin[data.net_margin.length - 1].value - data.net_margin[data.net_margin.length - 5].value
    : null

  return (
    <PanelCard>
      <Stack spacing={3}>
        {/* KPI Row */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="Corporate Profits (YoY %)"
              value={latestProfits?.toFixed(1)}
              unit="%"
              color={latestProfits && latestProfits > 0 ? '#22c55e' : '#ef4444'}
              icon={latestProfits && latestProfits > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="Net Profit Margin"
              value={latestNetMargin?.toFixed(2)}
              unit="%"
              color="#6d91c9"
              subtext={marginChange !== null ? `${marginChange > 0 ? '+' : ''}${marginChange.toFixed(2)}pp` : undefined}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="Operating Margin"
              value={latestOpMargin?.toFixed(2)}
              unit="%"
              color="#82aec2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="S&P 500 EPS"
              value={latestEPS?.toFixed(2)}
              unit="$"
              color="#22c55e"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiChip
              label="Shiller CAPE"
              value={latestPE?.toFixed(1)}
              unit="x"
              color={latestPE && latestPE > 30 ? '#ef4444' : latestPE && latestPE > 20 ? '#f59e0b' : '#22c55e'}
              subtext={latestPE && latestPE > 30 ? 'Elevated' : latestPE && latestPE > 20 ? 'Fair' : 'Cheap'}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2}>
          {/* Corporate Profits YoY */}
          {data.profits && data.profits.length > 0 && (
            <Grid item xs={12} md={6}>
              <PlotlyChart
                title="Corporate Profits (YoY %)"
                traces={[
                  {
                    x: data.profits.map((o) => o.date),
                    y: data.profits.map((o) => o.value),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Profits YoY %',
                    line: { color: '#c98f5a', width: 2 },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(201, 143, 90, 0.1)',
                  },
                ]}
                layout={{
                  height: 300,
                  margin: { l: 50, r: 20, t: 30, b: 40 },
                  yaxis: { title: 'YoY %' },
                }}
              />
            </Grid>
          )}

          {/* Net Profit Margin */}
          {data.net_margin && data.net_margin.length > 0 && (
            <Grid item xs={12} md={6}>
              <PlotlyChart
                title="Net Profit Margin %"
                traces={[
                  {
                    x: data.net_margin.map((o) => o.date),
                    y: data.net_margin.map((o) => o.value),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Net Margin %',
                    line: { color: '#6d91c9', width: 2 },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(109, 145, 201, 0.1)',
                  },
                ]}
                layout={{
                  height: 300,
                  margin: { l: 50, r: 20, t: 30, b: 40 },
                  yaxis: { title: '%' },
                }}
              />
            </Grid>
          )}

          {/* S&P 500 EPS */}
          {data.earnings_per_share && data.earnings_per_share.length > 0 && (
            <Grid item xs={12} md={6}>
              <PlotlyChart
                title="S&P 500 Earnings Per Share"
                traces={[
                  {
                    x: data.earnings_per_share.map((o) => o.date),
                    y: data.earnings_per_share.map((o) => o.value),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'EPS ($)',
                    line: { color: '#22c55e', width: 2 },
                  },
                ]}
                layout={{
                  height: 300,
                  margin: { l: 50, r: 20, t: 30, b: 40 },
                  yaxis: { title: 'EPS ($)' },
                }}
              />
            </Grid>
          )}

          {/* Shiller CAPE Ratio */}
          {data.pe_ratio && data.pe_ratio.length > 0 && (
            <Grid item xs={12} md={6}>
              <PlotlyChart
                title="Shiller CAPE Ratio (P/E Adjusted for Inflation)"
                traces={[
                  {
                    x: data.pe_ratio.map((o) => o.date),
                    y: data.pe_ratio.map((o) => o.value),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'CAPE',
                    line: { color: '#ef4444', width: 2 },
                  },
                  {
                    x: data.pe_ratio.map((o) => o.date),
                    y: Array(data.pe_ratio.length).fill(26), // Historical average
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Historical Avg (26)',
                    line: { color: '#9ca3af', width: 1, dash: 'dash' },
                  },
                ]}
                layout={{
                  height: 300,
                  margin: { l: 50, r: 20, t: 30, b: 40 },
                  yaxis: { title: 'Ratio' },
                }}
              />
            </Grid>
          )}
        </Grid>

        {/* Interpretation Card */}
        <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: 1, border: '1px solid #e5e7eb' }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              💼 Earnings Commentary
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
              {latestProfits && latestProfits > 0
                ? `Corporate profits are growing ${latestProfits > 10 ? 'strongly' : 'moderately'} at ${latestProfits.toFixed(1)}% YoY, `
                : `Corporate profits are declining at ${Math.abs(latestProfits || 0).toFixed(1)}% YoY, `}
              {latestNetMargin && latestNetMargin > 10
                ? `with healthy net margins of ${latestNetMargin.toFixed(2)}%.`
                : `with squeezed net margins of ${latestNetMargin?.toFixed(2)}%.`}
              {latestPE && latestPE > 30
                ? ` Valuations (CAPE ${latestPE.toFixed(1)}x) appear stretched.`
                : latestPE && latestPE > 20
                  ? ` Valuations (CAPE ${latestPE.toFixed(1)}x) are fair to elevated.`
                  : ` Valuations (CAPE ${latestPE?.toFixed(1)}x) appear reasonable.`}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </PanelCard>
  )
}
