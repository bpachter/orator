/**
 * FedCycleMonitor — Story dashboard tracking Fed policy cycle.
 * Shows: Fed Funds Rate, Treasury Yield Curve, M2 transmission (money growth),
 * Market expectations (Fed Funds Futures), and interpretation of policy stance.
 */
import { useMemo, useState } from 'react'
import { Grid, Typography, Box } from '@mui/material'
import { CompositeDashboard, type DashboardSection } from './CompositeDashboard'
import { PlotlyChart, KpiChip } from '../shared'
import {
  useMacro,
  useMarkets,
  useMonetaryConditions,
} from '../../hooks/useFredQueries'
import type { TimeRange } from '../../types'

export function FedCycleMonitor() {
  const [range, setRange] = useState<TimeRange>('5Y')

  // Fetch data from all endpoints
  const macro = useMacro(range)
  const markets = useMarkets(range)
  const monetary = useMonetaryConditions(range)

  // Compute derived metrics
  const fedFundsLatest = macro.data?.series.FEDFUNDS?.[macro.data.series.FEDFUNDS.length - 1]?.value
  const m2Latest = monetary.data?.series.M2SL?.[monetary.data.series.M2SL.length - 1]?.value
  const tenYearLatest = markets.data?.series.GS10?.[markets.data.series.GS10.length - 1]?.value

  // Extract series for charts
  const fedFundsData = macro.data?.series.FEDFUNDS ?? []
  const discountRateData = macro.data?.series.MMNRNJ ?? [] // Secondary discount rate
  const m2Data = monetary.data?.series.M2SL ?? []
  const tbillsData = markets.data?.series.TB3MS ?? []
  const tenYearData = markets.data?.series.GS10 ?? []
  const twoYearData = markets.data?.series.GS2 ?? []

  // 10Y-2Y spread (inverted = recession signal)
  const spread = useMemo(() => {
    if (!tenYearData.length || !twoYearData.length) return []
    const result = []
    const minLen = Math.min(tenYearData.length, twoYearData.length)
    for (let i = 0; i < minLen; i++) {
      result.push({
        date: tenYearData[i].date,
        value: tenYearData[i].value - twoYearData[i].value,
      })
    }
    return result
  }, [tenYearData, twoYearData])

  // KPI row: Fed Funds, 10Y, Spread, M2 YoY
  const kpiRow = (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="Fed Funds Rate"
          value={fedFundsLatest?.toFixed(2)}
          unit="%"
          valueColor={fedFundsLatest && fedFundsLatest > 5 ? '#ef4444' : fedFundsLatest && fedFundsLatest > 3 ? '#f59e0b' : '#22c55e'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="10Y Treasury Yield"
          value={tenYearLatest?.toFixed(2)}
          unit="%"
          valueColor="#6d91c9"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="10Y-2Y Spread"
          value={spread.length > 0 ? spread[spread.length - 1].value.toFixed(2) : undefined}
          unit="%"
          valueColor={spread.length > 0 && spread[spread.length - 1].value > 0 ? '#22c55e' : '#ef4444'}
          caption={spread.length > 0 && spread[spread.length - 1].value < 0 ? 'Inverted!' : undefined}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="M2 Money Supply (YoY %)"
          value={m2Latest?.toFixed(1)}
          unit="%"
          valueColor={m2Latest && m2Latest > 5 ? '#22c55e' : m2Latest && m2Latest > 0 ? '#f59e0b' : '#ef4444'}
        />
      </Grid>
    </Grid>
  )

  // Dashboard sections
  const sections: DashboardSection[] = [
    {
      title: 'Policy Rates',
      subtitle: 'Fed Funds Rate vs. Secondary Market Rate',
      layout: '2col',
      charts: [
        {
          id: 'fed-funds',
          title: 'Fed Funds Effective Rate',
          component: (
            <PlotlyChart
              ariaLabel="Fed Funds Rate"
              traces={[
                {
                  x: fedFundsData.map((o) => o.date),
                  y: fedFundsData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Fed Funds',
                  line: { color: '#ef4444', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(239, 68, 68, 0.1)',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Rate (%)' },
              }}
            />
          ),
        },
        {
          id: 'discount-rate',
          title: 'Secondary Market Discount Rate',
          component: (
            <PlotlyChart
              ariaLabel="Secondary Market Discount Rate"
              traces={[
                {
                  x: discountRateData.map((o) => o.date),
                  y: discountRateData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Secondary Rate',
                  line: { color: '#f59e0b', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(245, 158, 11, 0.1)',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Rate (%)' },
              }}
            />
          ),
        },
      ],
    },
    {
      title: 'Yield Curve',
      subtitle: '10Y/2Y Spread + Curve Steepness',
      layout: '1col',
      charts: [
        {
          id: 'yield-curve',
          title: '10Y vs. 2Y Treasury Yields',
          component: (
            <PlotlyChart
              ariaLabel="Treasury Yield Curve"
              traces={[
                {
                  x: tenYearData.map((o) => o.date),
                  y: tenYearData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: '10Y',
                  line: { color: '#6d91c9', width: 2 },
                },
                {
                  x: twoYearData.map((o) => o.date),
                  y: twoYearData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: '2Y',
                  line: { color: '#f59e0b', width: 2 },
                },
                {
                  x: spread.map((o) => o.date),
                  y: spread.map((o) => o.value),
                  type: 'bar',
                  name: 'Spread (10Y-2Y)',
                  marker: {
                    color: spread.map((o) => (o.value > 0 ? '#22c55e' : '#ef4444')),
                  },
                  yaxis: 'y2',
                },
              ]}
              layout={{
                height: 350,
                margin: { l: 50, r: 50, t: 30, b: 40 },
                yaxis: { title: 'Yield (%)' },
                yaxis2: {
                  title: 'Spread (%)',
                  overlaying: 'y',
                  side: 'right',
                },
              }}
            />
          ),
        },
      ],
      interpretation: (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Curve Interpretation
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {spread.length > 0 && spread[spread.length - 1].value < 0
              ? '🔴 Inverted curve signals potential recession within 12-18 months'
              : spread.length > 0 && spread[spread.length - 1].value < 1
              ? '🟡 Flat curve suggests slower growth ahead'
              : '🟢 Steep curve is normal, suggests healthy economic expansion'}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Monetary Transmission',
      subtitle: 'M2 Growth & Short-Term Rates',
      layout: '2col',
      charts: [
        {
          id: 'short-rates',
          title: '3M T-Bills (Fed Transmission)',
          component: (
            <PlotlyChart
              ariaLabel="3M T-Bill Rate"
              traces={[
                {
                  x: tbillsData.map((o) => o.date),
                  y: tbillsData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: '3M T-Bills',
                  line: { color: '#82aec2', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(130, 174, 194, 0.1)',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Rate (%)' },
              }}
            />
          ),
        },
        {
          id: 'm2-growth',
          title: 'M2 Money Supply Growth',
          component: (
            <PlotlyChart
              ariaLabel="M2 Growth"
              traces={[
                {
                  x: m2Data.map((o) => o.date),
                  y: m2Data.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'M2 YoY %',
                  line: { color: '#22c55e', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(34, 197, 94, 0.1)',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'YoY %' },
              }}
            />
          ),
        },
      ],
      interpretation: (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Policy Stance
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {fedFundsLatest && fedFundsLatest > 4
              ? '📈 Restrictive: High rates cooling money growth'
              : '📉 Accommodative: Low rates supporting liquidity'}
          </Typography>
        </Box>
      ),
    },
  ]

  const isLoading = macro.isLoading || markets.isLoading || monetary.isLoading
  const isError = macro.isError || markets.isError || monetary.isError

  return (
    <CompositeDashboard
      title="Fed Policy Cycle Monitor"
      subtitle="Track Federal Reserve policy stance through rates, curve, and monetary transmission"
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load Fed data"
      sections={sections}
      range={range}
      onRangeChange={setRange}
      kpiRow={kpiRow}
    />
  )
}
