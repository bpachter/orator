/**
 * RecessionEarlyWarning — Story dashboard for recession probability signals.
 * Combines leading indicators (ISM, jobless claims, yield curve) with recession probability meter.
 */
import { useState } from 'react'
import { Grid, Typography, Box, LinearProgress } from '@mui/material'
import { CompositeDashboard, type DashboardSection } from './CompositeDashboard'
import { PlotlyChart, KpiChip } from '../shared'
import { useActivity, useLabor, useMarkets, useRecessionSignals } from '../../hooks/useFredQueries'
import type { TimeRange } from '../../types'

export function RecessionEarlyWarning() {
  const [range, setRange] = useState<TimeRange>('5Y')

  const activity = useActivity(range)
  const labor = useLabor(range)
  const markets = useMarkets(range)
  const recession = useRecessionSignals(range)

  // Extract key series
  const ismData = activity.data?.series.MMNRNJ ?? [] // ISM manufacturing
  const claimsData = labor.data?.series.ICSA ?? [] // Initial claims
  const spreadData = markets.data?.series.T10Y2Y ?? [] // 10Y-2Y spread
  const recProb = recession.data?.series['RECPROUSM156N'] ?? [] // Recession probability

  // Compute recession probability (latest)
  const recessProb = recProb.length > 0 ? recProb[recProb.length - 1].value : 0

  // KPI row: Recession Prob, ISM, Yield Spread, Initial Claims
  const ismLatest = ismData.length > 0 ? ismData[ismData.length - 1].value : null
  const claimsLatest = claimsData.length > 0 ? claimsData[claimsData.length - 1].value : null
  const spreadLatest = spreadData.length > 0 ? spreadData[spreadData.length - 1].value : null

  const kpiRow = (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="Recession Probability"
          value={recessProb.toFixed(1)}
          unit="%"
          valueColor={recessProb > 50 ? '#ef4444' : recessProb > 30 ? '#f59e0b' : '#22c55e'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="ISM Manufacturing"
          value={ismLatest?.toFixed(1)}
          unit=""
          valueColor={ismLatest && ismLatest > 50 ? '#22c55e' : '#ef4444'}
          caption={ismLatest && ismLatest > 50 ? 'Expansion' : 'Contraction'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="10Y-2Y Spread"
          value={spreadLatest?.toFixed(2)}
          unit="%"
          valueColor={spreadLatest && spreadLatest > 0 ? '#22c55e' : '#ef4444'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="Initial Claims (000s)"
          value={claimsLatest?.toFixed(0)}
          unit=""
          valueColor={claimsLatest && claimsLatest < 300 ? '#22c55e' : claimsLatest && claimsLatest < 400 ? '#f59e0b' : '#ef4444'}
        />
      </Grid>
    </Grid>
  )

  // Dashboard sections
  const sections: DashboardSection[] = [
    {
      title: 'Recession Probability Meter',
      subtitle: 'Probit Model Estimate (NBER)',
      layout: '1col',
      charts: [
        {
          id: 'recession-prob',
          title: 'Probability of Recession (next 12M)',
          component: (
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current Probability</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {recessProb.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={recessProb}
                  sx={{
                    height: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        recessProb > 50
                          ? '#ef4444'
                          : recessProb > 30
                          ? '#f59e0b'
                          : '#22c55e',
                    },
                  }}
                />
              </Box>

              {recProb.length > 0 && (
                <PlotlyChart
                  ariaLabel="Recession Probability History"
                  traces={[
                    {
                      x: recProb.map((o) => o.date),
                      y: recProb.map((o) => o.value),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Recession Prob %',
                      line: { color: '#ef4444', width: 2 },
                      fill: 'tozeroy',
                      fillcolor: 'rgba(239, 68, 68, 0.2)',
                    },
                    {
                      x: recProb.map((o) => o.date),
                      y: recProb.map((_) => 20),
                      mode: 'lines',
                      name: 'Warning Threshold',
                      line: { color: '#f59e0b', dash: 'dash' },
                      hoverinfo: 'skip',
                    },
                  ]}
                  layout={{
                    height: 300,
                    margin: { l: 50, r: 20, t: 30, b: 40 },
                    yaxis: { title: 'Probability (%)' },
                  }}
                />
              )}
            </Box>
          ),
        },
      ],
    },
    {
      title: 'Leading Indicators',
      subtitle: 'ISM vs. Yield Curve Signal',
      layout: '2col',
      charts: [
        {
          id: 'ism-manufacturing',
          title: 'ISM Manufacturing Index',
          component: (
            <PlotlyChart
              ariaLabel="ISM Manufacturing"
              traces={[
                {
                  x: ismData.map((o) => o.date),
                  y: ismData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'ISM Mfg',
                  line: { color: '#6d91c9', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(109, 145, 201, 0.1)',
                },
                {
                  x: ismData.map((o) => o.date),
                  y: ismData.map((_) => 50),
                  mode: 'lines',
                  name: 'Expansion/Contraction',
                  line: { color: '#f59e0b', dash: 'dash' },
                  hoverinfo: 'skip',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Index' },
              }}
            />
          ),
        },
        {
          id: 'yield-spread',
          title: '10Y-2Y Treasury Spread',
          component: (
            <PlotlyChart
              ariaLabel="Yield Spread"
              traces={[
                {
                  x: spreadData.map((o) => o.date),
                  y: spreadData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Spread',
                  line: { color: '#22c55e', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(34, 197, 94, 0.2)',
                },
                {
                  x: spreadData.map((o) => o.date),
                  y: spreadData.map((_) => 0),
                  mode: 'lines',
                  name: 'Zero (Inversion)',
                  line: { color: '#ef4444', dash: 'dash' },
                  hoverinfo: 'skip',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Spread (%)' },
              }}
            />
          ),
        },
      ],
    },
    {
      title: 'Labor Market Stress',
      subtitle: 'Initial Claims Trend',
      layout: '1col',
      charts: [
        {
          id: 'claims',
          title: 'Initial Jobless Claims (Seasonally Adjusted)',
          component: (
            <PlotlyChart
              ariaLabel="Initial Claims"
              traces={[
                {
                  x: claimsData.map((o) => o.date),
                  y: claimsData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Initial Claims',
                  line: { color: '#ef4444', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(239, 68, 68, 0.1)',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Claims (000s)' },
              }}
            />
          ),
        },
      ],
      interpretation: (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Recession Signal Summary
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {recessProb > 50
              ? '🔴 HIGH RISK: Recession signals prevalent (inverted curve + weak ISM)'
              : recessProb > 30
              ? '🟡 MODERATE RISK: Mixed signals (watch for curve steepening)'
              : '🟢 LOW RISK: No clear recession signals (normal curve + strong ISM)'}
          </Typography>
        </Box>
      ),
    },
  ]

  const isLoading = activity.isLoading || labor.isLoading || markets.isLoading || recession.isLoading
  const isError = activity.isError || labor.isError || markets.isError || recession.isError

  return (
    <CompositeDashboard
      title="Recession Early Warning System"
      subtitle="Monitor leading indicators for recession signals 12-18 months ahead"
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load recession indicators"
      sections={sections}
      range={range}
      onRangeChange={setRange}
      kpiRow={kpiRow}
    />
  )
}
