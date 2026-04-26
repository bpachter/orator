/**
 * InflationDecomposition — Story dashboard breaking down inflation sources.
 * Shows: Total CPI, Core CPI, Goods vs. Services, Wage pressures, and expectations.
 */
import { useMemo, useState } from 'react'
import { Grid, Typography, Box } from '@mui/material'
import { CompositeDashboard, type DashboardSection } from './CompositeDashboard'
import { PlotlyChart, KpiChip } from '../shared'
import { useConsumer, useInflation, useLabor } from '../../hooks/useFredQueries'
import type { TimeRange } from '../../types'

export function InflationDecomposition() {
  const [range, setRange] = useState<TimeRange>('5Y')

  const inflation = useInflation(range)
  const consumer = useConsumer(range)
  const labor = useLabor(range)

  // Extract series
  const cpiData = inflation.data?.series.CPIAUCSL ?? []
  const coreCpiData = inflation.data?.series.CPILFESL ?? []
  const energyData = inflation.data?.series.CPIENGSL ?? []
  const servicesData = inflation.data?.series.CPILFESL ?? [] // Services (core proxy)
  const wageGrowthData = labor.data?.series.AWHAETP ?? [] // Avg hourly earnings growth

  // Expected inflation (5Y forward)
  const expectedInflationData = consumer.data?.series.T5YIFR ?? []

  // YoY calculations for CPI
  const cpiYoY = useMemo(() => {
    if (!cpiData.length) return []
    return cpiData
      .slice(12) // Skip first 12 months
      .map((curr, idx) => {
        const prior = cpiData[idx]
        const yoy = ((curr.value - prior.value) / prior.value) * 100
        return { date: curr.date, value: yoy }
      })
  }, [cpiData])

  const coreYoY = useMemo(() => {
    if (!coreCpiData.length) return []
    return coreCpiData
      .slice(12)
      .map((curr, idx) => {
        const prior = coreCpiData[idx]
        const yoy = ((curr.value - prior.value) / prior.value) * 100
        return { date: curr.date, value: yoy }
      })
  }, [coreCpiData])

  const energyYoY = useMemo(() => {
    if (!energyData.length) return []
    return energyData
      .slice(12)
      .map((curr, idx) => {
        const prior = energyData[idx]
        const yoy = ((curr.value - prior.value) / prior.value) * 100
        return { date: curr.date, value: yoy }
      })
  }, [energyData])

  // Latest values
  const cpiLatest = cpiYoY.length > 0 ? cpiYoY[cpiYoY.length - 1].value : null
  const coreLatest = coreYoY.length > 0 ? coreYoY[coreYoY.length - 1].value : null
  const energyLatest = energyYoY.length > 0 ? energyYoY[energyYoY.length - 1].value : null
  const wageLatest = wageGrowthData.length > 0 ? wageGrowthData[wageGrowthData.length - 1].value : null
  const expectedLatest = expectedInflationData.length > 0 ? expectedInflationData[expectedInflationData.length - 1].value : null

  const kpiRow = (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="Total CPI (YoY %)"
          value={cpiLatest?.toFixed(1)}
          unit="%"
          valueColor={cpiLatest && cpiLatest > 4 ? '#ef4444' : cpiLatest && cpiLatest > 2 ? '#f59e0b' : '#22c55e'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="Core CPI (YoY %)"
          value={coreLatest?.toFixed(1)}
          unit="%"
          valueColor={coreLatest && coreLatest > 3.5 ? '#ef4444' : coreLatest && coreLatest > 2 ? '#f59e0b' : '#22c55e'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="Energy CPI (YoY %)"
          value={energyLatest?.toFixed(1)}
          unit="%"
          valueColor={energyLatest && energyLatest > 10 ? '#ef4444' : energyLatest && energyLatest > 0 ? '#f59e0b' : '#22c55e'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="Wage Growth (Monthly %)"
          value={wageLatest?.toFixed(2)}
          unit="%"
          valueColor={wageLatest && wageLatest > 0.5 ? '#ef4444' : '#22c55e'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="Expected Inflation (5Y)"
          value={expectedLatest?.toFixed(2)}
          unit="%"
          valueColor={expectedLatest && expectedLatest > 2.5 ? '#f59e0b' : '#22c55e'}
        />
      </Grid>
    </Grid>
  )

  // Dashboard sections
  const sections: DashboardSection[] = [
    {
      title: 'Total vs. Core CPI',
      subtitle: 'Headline (volatile components) vs. Core (sticky)',
      layout: '1col',
      charts: [
        {
          id: 'cpi-decomp',
          title: 'CPI Year-over-Year Growth',
          component: (
            <PlotlyChart
              ariaLabel="CPI Decomposition"
              traces={[
                {
                  x: cpiYoY.map((o) => o.date),
                  y: cpiYoY.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Total CPI',
                  line: { color: '#ef4444', width: 2 },
                },
                {
                  x: coreYoY.map((o) => o.date),
                  y: coreYoY.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Core CPI (excl. food & energy)',
                  line: { color: '#f59e0b', width: 2 },
                },
                {
                  x: cpiYoY.map((o) => o.date),
                  y: cpiYoY.map((_) => 2),
                  mode: 'lines',
                  name: 'Fed Target (2%)',
                  line: { color: '#22c55e', dash: 'dash' },
                  hoverinfo: 'skip',
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
    },
    {
      title: 'Inflation Sources',
      subtitle: 'Energy & Goods Volatility',
      layout: '2col',
      charts: [
        {
          id: 'energy-contrib',
          title: 'Energy CPI (Major Driver)',
          component: (
            <PlotlyChart
              ariaLabel="Energy CPI"
              traces={[
                {
                  x: energyYoY.map((o) => o.date),
                  y: energyYoY.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Energy YoY %',
                  line: { color: '#ef4444', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(239, 68, 68, 0.1)',
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
        {
          id: 'services-contrib',
          title: 'Services CPI (Sticky)',
          component: (
            <PlotlyChart
              ariaLabel="Services CPI"
              traces={[
                {
                  x: servicesData.map((o) => o.date),
                  y: servicesData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Services Level',
                  line: { color: '#6d91c9', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(109, 145, 201, 0.1)',
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
      ],
      interpretation: (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Decomposition Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {cpiLatest && coreLatest && cpiLatest - coreLatest > 1
              ? '⚡ High-inflation driven by volatile components (energy, commodities). Core inflation stickier.'
              : '🔄 Core inflation elevated. Wage pressures & rent keeping pressures alive.'}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Wage-Price Dynamics',
      subtitle: 'Wage Growth & Inflation Expectations',
      layout: '2col',
      charts: [
        {
          id: 'wage-growth',
          title: 'Average Hourly Earnings Growth',
          component: (
            <PlotlyChart
              ariaLabel="Wage Growth"
              traces={[
                {
                  x: wageGrowthData.map((o) => o.date),
                  y: wageGrowthData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Monthly Growth %',
                  line: { color: '#82aec2', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(130, 174, 194, 0.1)',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Monthly %' },
              }}
            />
          ),
        },
        {
          id: 'expected-inflation',
          title: 'Market Expected Inflation (5Y)',
          component: (
            <PlotlyChart
              ariaLabel="Expected Inflation"
              traces={[
                {
                  x: expectedInflationData.map((o) => o.date),
                  y: expectedInflationData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: '5Y Expected CPI',
                  line: { color: '#22c55e', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(34, 197, 94, 0.1)',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: '% per year' },
              }}
            />
          ),
        },
      ],
      interpretation: (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Wage-Price Loop Risk
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {wageLatest && wageLatest > 0.4
              ? '⚠️ Elevated wage growth + sticky core CPI = risk of wage-price spiral'
              : '✓ Wage growth normalizing + expectations anchored = inflation moderating'}
          </Typography>
        </Box>
      ),
    },
  ]

  const isLoading = inflation.isLoading || consumer.isLoading || labor.isLoading
  const isError = inflation.isError || consumer.isError || labor.isError

  return (
    <CompositeDashboard
      title="Inflation Decomposition"
      subtitle="Break down inflation sources: energy, goods, services, wages, and expectations"
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load inflation data"
      sections={sections}
      range={range}
      onRangeChange={setRange}
      kpiRow={kpiRow}
    />
  )
}
