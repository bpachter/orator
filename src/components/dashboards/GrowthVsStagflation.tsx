/**
 * GrowthVsStagflation — Story dashboard showing growth vs. inflation quadrant analysis.
 * Plots: Real GDP growth, Inflation (CPI), with quadrant regions showing economic scenarios.
 */
import { useMemo, useState } from 'react'
import { Grid, Typography, Box } from '@mui/material'
import { CompositeDashboard, type DashboardSection } from './CompositeDashboard'
import { PlotlyChart, KpiChip } from '../shared'
import { useMacro, useInflation, useActivity } from '../../hooks/useFredQueries'
import type { TimeRange } from '../../types'

export function GrowthVsStagflation() {
  const [range, setRange] = useState<TimeRange>('5Y')

  const macro = useMacro(range)
  const inflation = useInflation(range)
  const activity = useActivity(range)

  // Extract series
  const gdpData = macro.data?.series.GDPC1 ?? [] // Real GDP
  const cpiData = inflation.data?.series.CPIAUCSL ?? []
  const ismData = activity.data?.series.MMNRNJ ?? [] // ISM manufacturing
  const unemploymentData = macro.data?.series.UNRATE ?? []

  // Compute YoY growth rates
  const gdpGrowth = useMemo(() => {
    if (!gdpData.length) return []
    return gdpData
      .slice(4) // Skip first 4 quarters
      .map((curr, idx) => {
        const prior = gdpData[idx]
        const yoy = ((curr.value - prior.value) / prior.value) * 100
        return { date: curr.date, value: yoy }
      })
  }, [gdpData])

  const cpiGrowth = useMemo(() => {
    if (!cpiData.length) return []
    return cpiData
      .slice(12)
      .map((curr, idx) => {
        const prior = cpiData[idx]
        const yoy = ((curr.value - prior.value) / prior.value) * 100
        return { date: curr.date, value: yoy }
      })
  }, [cpiData])

  // Latest values
  const growthLatest = gdpGrowth.length > 0 ? gdpGrowth[gdpGrowth.length - 1].value : null
  const inflationLatest = cpiGrowth.length > 0 ? cpiGrowth[cpiGrowth.length - 1].value : null
  const ismLatest = ismData.length > 0 ? ismData[ismData.length - 1].value : null
  const unempLatest = unemploymentData.length > 0 ? unemploymentData[unemploymentData.length - 1].value : null

  // Determine quadrant
  const getQuadrant = () => {
    if (!growthLatest || !inflationLatest) return 'unknown'
    const strongGrowth = growthLatest > 2.5
    const highInflation = inflationLatest > 3
    if (strongGrowth && !highInflation) return 'goldilocks'
    if (strongGrowth && highInflation) return 'boom'
    if (!strongGrowth && highInflation) return 'stagflation'
    return 'slowdown'
  }

  const quadrant = getQuadrant()
  const quadrantLabels = {
    goldilocks: '🟢 Goldilocks: Strong growth, stable prices',
    boom: '🟡 Boom/Overheating: High growth, rising prices',
    stagflation: '🔴 Stagflation: Weak growth, high inflation',
    slowdown: '⚪ Slowdown: Weak growth, low inflation',
    unknown: 'Insufficient data',
  }

  const kpiRow = (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="Real GDP Growth (YoY %)"
          value={growthLatest?.toFixed(1)}
          unit="%"
          valueColor={growthLatest && growthLatest > 2.5 ? '#22c55e' : growthLatest && growthLatest > 0 ? '#f59e0b' : '#ef4444'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="CPI (YoY %)"
          value={inflationLatest?.toFixed(1)}
          unit="%"
          valueColor={inflationLatest && inflationLatest < 2.5 ? '#22c55e' : inflationLatest && inflationLatest < 4 ? '#f59e0b' : '#ef4444'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="ISM Manufacturing"
          value={ismLatest?.toFixed(1)}
          unit=""
          valueColor={ismLatest && ismLatest > 50 ? '#22c55e' : '#ef4444'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiChip
          label="Unemployment Rate"
          value={unempLatest?.toFixed(2)}
          unit="%"
          valueColor={unempLatest && unempLatest < 4 ? '#22c55e' : unempLatest && unempLatest < 5 ? '#f59e0b' : '#ef4444'}
        />
      </Grid>
    </Grid>
  )

  // Dashboard sections
  const sections: DashboardSection[] = [
    {
      title: 'Economic Scenarios',
      subtitle: 'Growth vs. Inflation Quadrant Analysis',
      layout: '1col',
      charts: [
        {
          id: 'quadrant',
          title: 'Current Position: ' + quadrantLabels[quadrant],
          component: (
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  mb: 3,
                  height: 400,
                }}
              >
                {/* Quadrant visualization */}
                <Box
                  sx={{
                    gridColumn: '1 / -1',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                  }}
                >
                  {/* Top-left: Stagflation */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '50%',
                      height: '50%',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      p: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      🔴 Stagflation
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Weak growth + High inflation
                    </Typography>
                  </Box>

                  {/* Top-right: Goldilocks */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '50%',
                      height: '50%',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      p: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      🟢 Goldilocks
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Strong growth + Stable prices
                    </Typography>
                  </Box>

                  {/* Bottom-left: Slowdown */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '50%',
                      height: '50%',
                      backgroundColor: 'rgba(156, 163, 175, 0.1)',
                      p: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      ⚪ Slowdown
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Weak growth + Low inflation
                    </Typography>
                  </Box>

                  {/* Bottom-right: Boom */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '50%',
                      height: '50%',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      p: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      🟡 Boom
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Strong growth + Rising inflation
                    </Typography>
                  </Box>

                  {/* Current position marker */}
                  {growthLatest !== null && inflationLatest !== null && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${((growthLatest / 5) * 100 + 25)}%`,
                        top: `${((3 - inflationLatest / 5 * 3) * 100 + 25)}%`,
                        width: 16,
                        height: 16,
                        backgroundColor: '#22c55e',
                        border: '2px solid white',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                      }}
                    />
                  )}

                  {/* Axes labels */}
                  <Typography
                    variant="caption"
                    sx={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)' }}
                  >
                    Growth →
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }}
                  >
                    Inflation →
                  </Typography>
                </Box>
              </Box>

              {/* Interpretation */}
              <Typography variant="body2" color="textSecondary">
                {quadrant === 'goldilocks'
                  ? '✨ Ideal scenario: Sustained growth without overheating'
                  : quadrant === 'boom'
                  ? '⚡ Risk of overheating: Fed likely to tighten policy'
                  : quadrant === 'stagflation'
                  ? '⚠️ Worst case: Weak growth + high inflation limits policy options'
                  : '📉 Risk of recession: Low growth + deflation concerns'}
              </Typography>
            </Box>
          ),
        },
      ],
    },
    {
      title: 'Growth & Inflation Trends',
      subtitle: 'Year-over-Year Changes',
      layout: '2col',
      charts: [
        {
          id: 'gdp-growth',
          title: 'Real GDP Growth (YoY %)',
          component: (
            <PlotlyChart
              ariaLabel="GDP Growth"
              traces={[
                {
                  x: gdpGrowth.map((o) => o.date),
                  y: gdpGrowth.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'GDP YoY %',
                  line: { color: '#6d91c9', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: gdpGrowth.map((o) =>
                    o.value > 2.5 ? 'rgba(34, 197, 94, 0.2)' : o.value > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  ),
                },
                {
                  x: gdpGrowth.map((o) => o.date),
                  y: gdpGrowth.map((_) => 2.5),
                  mode: 'lines',
                  name: 'Strong Growth Threshold',
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
        {
          id: 'cpi-trend',
          title: 'CPI Inflation (YoY %)',
          component: (
            <PlotlyChart
              ariaLabel="CPI Inflation"
              traces={[
                {
                  x: cpiGrowth.map((o) => o.date),
                  y: cpiGrowth.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'CPI YoY %',
                  line: { color: '#ef4444', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: cpiGrowth.map((o) =>
                    o.value > 4 ? 'rgba(239, 68, 68, 0.2)' : o.value > 2.5 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  ),
                },
                {
                  x: cpiGrowth.map((o) => o.date),
                  y: cpiGrowth.map((_) => 2),
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
  ]

  const isLoading = macro.isLoading || inflation.isLoading || activity.isLoading
  const isError = macro.isError || inflation.isError || activity.isError

  return (
    <CompositeDashboard
      title="Growth vs. Stagflation Scenarios"
      subtitle="Analyze current economic regime: Goldilocks, Boom, Stagflation, or Slowdown"
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load growth & inflation data"
      sections={sections}
      range={range}
      onRangeChange={setRange}
      kpiRow={kpiRow}
    />
  )
}
