/**
 * ValuationDashboard — Story dashboard for equity valuation analysis.
 * Shows: P/E ratio, earnings growth, dividend yield, bond yields, equity risk premium.
 */
import { useMemo, useState } from 'react'
import { Grid, Typography, Box } from '@mui/material'
import { CompositeDashboard, type DashboardSection } from './CompositeDashboard'
import { PlotlyChart, KpiChip } from '../shared'
import { useCorporateEarnings, useMarkets, useSpreads } from '../../hooks/useFredQueries'
import type { TimeRange } from '../../types'

export function ValuationDashboard() {
  const [range, setRange] = useState<TimeRange>('10Y')

  const earnings = useCorporateEarnings()
  const markets = useMarkets(range)
  const spreads = useSpreads(range)

  // Extract series
  const peRatioData = earnings.data?.pe_ratio ?? []
  const epsData = earnings.data?.earnings_per_share ?? []
  const profitsData = earnings.data?.profits ?? []
  const tenYearData = markets.data?.series.GS10 ?? []
  const divYieldData = markets.data?.series.VIXCLS ?? [] // Use VIX as proxy for risk sentiment
  const hySpreadsData = spreads.data?.series.BAMLH0A0HYM2 ?? [] // HY credit spread

  // Latest values
  const peLatest = peRatioData.length > 0 ? peRatioData[peRatioData.length - 1].value : null
  const epsLatest = epsData.length > 0 ? epsData[epsData.length - 1].value : null
  const profitsLatest = profitsData.length > 0 ? profitsData[profitsData.length - 1].value : null
  const tenYearLatest = tenYearData.length > 0 ? tenYearData[tenYearData.length - 1].value : null
  const hySpreadLatest = hySpreadsData.length > 0 ? hySpreadsData[hySpreadsData.length - 1].value : null

  // Compute equity risk premium (S&P earnings yield - 10Y Treasury)
  const equityRiskPremium = useMemo(() => {
    if (!peLatest || !tenYearLatest) return null
    const earningsYield = 100 / peLatest // If P/E = 20, earnings yield = 5%
    return earningsYield - tenYearLatest
  }, [peLatest, tenYearLatest])

  // Valuation assessment
  const getValuationAssessment = () => {
    if (!peLatest) return 'unknown'
    if (peLatest > 28) return 'expensive'
    if (peLatest > 22) return 'elevated'
    if (peLatest > 16) return 'fair'
    return 'cheap'
  }

  const assessment = getValuationAssessment()
  const assessmentLabels = {
    cheap: '🟢 Cheap: Historical low valuations',
    fair: '⚪ Fair Value: Normal trading range',
    elevated: '🟡 Elevated: Higher than historical average',
    expensive: '🔴 Expensive: Elevated risk of correction',
    unknown: 'Insufficient data',
  }

  const kpiRow = (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="Shiller CAPE Ratio"
          value={peLatest?.toFixed(1)}
          unit="x"
          valueColor={peLatest && peLatest > 28 ? '#ef4444' : peLatest && peLatest > 22 ? '#f59e0b' : '#22c55e'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="S&P EPS"
          value={epsLatest?.toFixed(2)}
          unit="$"
          valueColor="#6d91c9"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="Corporate Profits (YoY %)"
          value={profitsLatest?.toFixed(1)}
          unit="%"
          valueColor={profitsLatest && profitsLatest > 0 ? '#22c55e' : '#ef4444'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="10Y Treasury Yield"
          value={tenYearLatest?.toFixed(2)}
          unit="%"
          valueColor={tenYearLatest && tenYearLatest > 4 ? '#ef4444' : '#22c55e'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <KpiChip
          label="Equity Risk Premium"
          value={equityRiskPremium?.toFixed(2)}
          unit="%"
          valueColor={equityRiskPremium && equityRiskPremium > 4 ? '#22c55e' : equityRiskPremium && equityRiskPremium > 2 ? '#f59e0b' : '#ef4444'}
        />
      </Grid>
    </Grid>
  )

  // Dashboard sections
  const sections: DashboardSection[] = [
    {
      title: 'Valuation Summary',
      subtitle: assessmentLabels[assessment],
      layout: '1col',
      charts: [
        {
          id: 'valuation-gauge',
          title: 'Valuation Range',
          component: (
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  CAPE Ratio Bands (Historical):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      flex: 1,
                      height: 30,
                      backgroundColor: 'rgba(34, 197, 94, 0.3)',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Cheap (&lt;16)
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      height: 30,
                      backgroundColor: 'rgba(156, 163, 175, 0.3)',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Fair (16-22)
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      height: 30,
                      backgroundColor: 'rgba(245, 158, 11, 0.3)',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Elevated (22-28)
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      height: 30,
                      backgroundColor: 'rgba(239, 68, 68, 0.3)',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Expensive (&gt;28)
                  </Box>
                </Box>
                {peLatest && (
                  <Box
                    sx={{
                      position: 'relative',
                      height: 20,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${Math.min(100, (peLatest / 35) * 100)}%`,
                        top: '-5px',
                        width: 30,
                        height: 30,
                        backgroundColor: '#22c55e',
                        border: '2px solid white',
                        borderRadius: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <Typography
                        sx={{
                          textAlign: 'center',
                          lineHeight: '26px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {peLatest.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ),
        },
      ],
    },
    {
      title: 'Earnings & Valuation',
      subtitle: 'P/E Ratio & Earnings Growth',
      layout: '2col',
      charts: [
        {
          id: 'cape-history',
          title: 'Shiller CAPE Ratio (10-Year Average)',
          component: (
            <PlotlyChart
              ariaLabel="CAPE Ratio"
              traces={[
                {
                  x: peRatioData.map((o) => o.date),
                  y: peRatioData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'CAPE',
                  line: { color: '#ef4444', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(239, 68, 68, 0.1)',
                },
                {
                  x: peRatioData.map((o) => o.date),
                  y: peRatioData.map((_) => 26),
                  mode: 'lines',
                  name: 'Historical Median',
                  line: { color: '#f59e0b', dash: 'dash' },
                  hoverinfo: 'skip',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Ratio (x)' },
              }}
            />
          ),
        },
        {
          id: 'eps-growth',
          title: 'S&P 500 Earnings Per Share',
          component: (
            <PlotlyChart
              ariaLabel="S&P EPS"
              traces={[
                {
                  x: epsData.map((o) => o.date),
                  y: epsData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'EPS ($)',
                  line: { color: '#22c55e', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(34, 197, 94, 0.1)',
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'EPS ($)' },
              }}
            />
          ),
        },
      ],
    },
    {
      title: 'Yield Comparison',
      subtitle: 'Equity Risk Premium: Earnings Yield vs. Bond Yield',
      layout: '2col',
      charts: [
        {
          id: 'bond-yields',
          title: '10Y Treasury vs. Earnings Yield',
          component: (
            <Box>
              {peLatest && tenYearLatest && (
                <PlotlyChart
                  ariaLabel="Yield Comparison"
                  traces={[
                    {
                      x: ['10Y Treasury', 'Earnings Yield (1/P/E)'],
                      y: [tenYearLatest, 100 / peLatest],
                      type: 'bar',
                      marker: {
                        color: ['#6d91c9', '#22c55e'],
                      },
                    },
                  ]}
                  layout={{
                    height: 300,
                    margin: { l: 50, r: 20, t: 30, b: 40 },
                    yaxis: { title: 'Yield (%)' },
                  }}
                />
              )}
            </Box>
          ),
        },
        {
          id: 'credit-spreads',
          title: 'HY Credit Spreads (Risk Premium)',
          component: (
            <PlotlyChart
              ariaLabel="HY Spreads"
              traces={[
                {
                  x: hySpreadsData.map((o) => o.date),
                  y: hySpreadsData.map((o) => o.value),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'HY Spread',
                  line: { color: '#f59e0b', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: hySpreadsData.map((o) =>
                    o.value > 600 ? 'rgba(239, 68, 68, 0.2)' : o.value > 400 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  ),
                },
              ]}
              layout={{
                height: 300,
                margin: { l: 50, r: 20, t: 30, b: 40 },
                yaxis: { title: 'Spread (bps)' },
              }}
            />
          ),
        },
      ],
    },
    {
      title: 'Valuation Drivers',
      subtitle: 'Corporate Profitability & Bond Yields',
      layout: '1col',
      charts: [
        {
          id: 'valuation-analysis',
          title: 'Key Drivers',
          component: (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Profitability Trend
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profitsLatest && profitsLatest > 5
                        ? '✅ Strong earnings growth supporting valuations'
                        : profitsLatest && profitsLatest > 0
                        ? '➡️ Moderate earnings growth'
                        : '⚠️ Declining earnings pressure on valuations'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Rate Environment
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {tenYearLatest && tenYearLatest > 4
                        ? '⬆️ Higher rates reduce equity valuations (higher discount rate)'
                        : tenYearLatest && tenYearLatest > 2
                        ? '➡️ Moderate rates support valuations'
                        : '⬇️ Low rates support higher P/E multiples'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ),
        },
      ],
      interpretation: (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Valuation Verdict
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {assessment === 'expensive'
              ? '🔴 Rich valuations + elevated rates = correction risk. Look for pullbacks.'
              : assessment === 'elevated'
              ? '🟡 Fair to elevated valuations. Selective opportunities for strong earnings growth.'
              : '🟢 Attractive valuations with earnings support. Accumulation opportunity.'}
          </Typography>
        </Box>
      ),
    },
  ]

  const isLoading = earnings.isLoading || markets.isLoading || spreads.isLoading
  const isError = earnings.isError || markets.isError || spreads.isError

  return (
    <CompositeDashboard
      title="Equity Valuation Dashboard"
      subtitle="Assess S&P 500 valuations: CAPE ratio, earnings growth, yields, and premiums"
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load valuation data"
      sections={sections}
      range={range}
      onRangeChange={setRange}
      kpiRow={kpiRow}
    />
  )
}
