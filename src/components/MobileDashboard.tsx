import React, { useMemo } from 'react'
import { Grid, Box, Typography, Card, CardContent } from '@mui/material'
import { KpiChip } from './shared/KpiChip'
import { LoadingState, ErrorState } from './shared'
import {
  useMacro,
  useLabor,
  useInflation,
  useMarkets,
  useActivity,
  useCorporateEarnings,
} from '../hooks/useFredQueries'

/**
 * MobileDashboard - Compact KPI-focused view for mobile (6-8 critical metrics)
 * Shows latest values for:
 * 1. Real GDP Growth (YoY%)
 * 2. Unemployment Rate
 * 3. CPI Inflation (YoY%)
 * 4. Fed Funds Rate
 * 5. 10Y-2Y Spread (recession signal)
 * 6. ISM Manufacturing
 * 7. S&P 500 P/E Ratio
 * 8. M2 Money Supply (YoY%)
 */
export const MobileDashboard: React.FC = () => {
  const macro = useMacro('1Y')
  const labor = useLabor('1Y')
  const inflation = useInflation('1Y')
  const markets = useMarkets('1Y')
  const activity = useActivity('1Y')
  const earnings = useCorporateEarnings()

  // Extract latest values
  const gdpLatest = useMemo(() => {
    const series = macro.data?.series.A191RL1Q225SBEA ?? []
    return series.length > 0 ? series[series.length - 1].value : null
  }, [macro.data])

  const unempLatest = useMemo(() => {
    const series = labor.data?.series.UNRATE ?? []
    return series.length > 0 ? series[series.length - 1].value : null
  }, [labor.data])

  const cpiLatest = useMemo(() => {
    const series = inflation.data?.series.CPIAUCSL ?? []
    if (series.length < 2) return null
    const current = series[series.length - 1].value
    const yearAgo = series[Math.max(0, series.length - 13)].value
    return ((current / yearAgo - 1) * 100)
  }, [inflation.data])

  const fedLatest = useMemo(() => {
    const series = markets.data?.series.FEDFUNDS ?? []
    return series.length > 0 ? series[series.length - 1].value : null
  }, [markets.data])

  const spreadLatest = useMemo(() => {
    const series = markets.data?.series.T10Y2Y ?? []
    return series.length > 0 ? series[series.length - 1].value : null
  }, [markets.data])

  const ismLatest = useMemo(() => {
    const series = activity.data?.series.MMNRNJ ?? []
    return series.length > 0 ? series[series.length - 1].value : null
  }, [activity.data])

  const peLatest = useMemo(() => {
    return earnings.data?.pe_ratio && earnings.data.pe_ratio.length > 0
      ? earnings.data.pe_ratio[earnings.data.pe_ratio.length - 1].value
      : null
  }, [earnings.data])

  const m2Latest = useMemo(() => {
    const series = macro.data?.series.M2SL ?? []
    if (series.length < 13) return null
    const current = series[series.length - 1].value
    const yearAgo = series[series.length - 13].value
    return ((current / yearAgo - 1) * 100)
  }, [macro.data])

  const isLoading = macro.isLoading || labor.isLoading || inflation.isLoading || markets.isLoading || activity.isLoading || earnings.isLoading
  const isError = macro.isError || labor.isError || inflation.isError || markets.isError || activity.isError || earnings.isError

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState message="Failed to load mobile dashboard data" />

  // Determine colors based on economic conditions
  const getGdpColor = (val: number | null) => val && val > 2.5 ? 'success' : val && val > 0 ? 'warning' : 'error'
  const getUnempColor = (val: number | null) => val && val < 4 ? 'success' : val && val < 5 ? 'warning' : 'error'
  const getCpiColor = (val: number | null) => val && val < 2 ? 'success' : val && val < 3 ? 'warning' : 'error'
  const getSpreadColor = (val: number | null) => val && val > 0.5 ? 'success' : val && val > 0 ? 'warning' : 'error'
  const getIsmColor = (val: number | null) => val && val > 50 ? 'success' : val && val > 45 ? 'warning' : 'error'
  const getPeColor = (val: number | null) => val && val < 18 ? 'success' : val && val < 22 ? 'warning' : 'error'

  return (
    <Box sx={{ pb: 10, pt: 2, px: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        📊 Key Metrics
      </Typography>

      <Grid container spacing={1.5}>
        {/* Real GDP Growth */}
        <Grid item xs={6} sm={4}>
          <KpiChip
            label="GDP Growth"
            value={gdpLatest?.toFixed(1)}
            unit="% YoY"
            valueColor={getGdpColor(gdpLatest)}
          />
        </Grid>

        {/* Unemployment Rate */}
        <Grid item xs={6} sm={4}>
          <KpiChip
            label="Unemployment"
            value={unempLatest?.toFixed(1)}
            unit="%"
            valueColor={getUnempColor(unempLatest)}
          />
        </Grid>

        {/* CPI Inflation */}
        <Grid item xs={6} sm={4}>
          <KpiChip
            label="CPI Inflation"
            value={cpiLatest?.toFixed(1)}
            unit="% YoY"
            valueColor={getCpiColor(cpiLatest)}
          />
        </Grid>

        {/* Fed Funds Rate */}
        <Grid item xs={6} sm={4}>
          <KpiChip
            label="Fed Funds"
            value={fedLatest?.toFixed(2)}
            unit="%"
            valueColor={fedLatest && fedLatest > 4 ? 'warning' : 'success'}
          />
        </Grid>

        {/* 10Y-2Y Spread */}
        <Grid item xs={6} sm={4}>
          <KpiChip
            label="Yield Spread"
            value={spreadLatest?.toFixed(2)}
            unit="%"
            valueColor={getSpreadColor(spreadLatest)}
          />
        </Grid>

        {/* ISM Manufacturing */}
        <Grid item xs={6} sm={4}>
          <KpiChip
            label="ISM Mfg"
            value={ismLatest?.toFixed(1)}
            unit=""
            valueColor={getIsmColor(ismLatest)}
          />
        </Grid>

        {/* S&P P/E Ratio */}
        <Grid item xs={6} sm={4}>
          <KpiChip
            label="S&P P/E"
            value={peLatest?.toFixed(1)}
            unit="x"
            valueColor={getPeColor(peLatest)}
          />
        </Grid>

        {/* M2 Money Supply */}
        <Grid item xs={6} sm={4}>
          <KpiChip
            label="M2 Growth"
            value={m2Latest?.toFixed(1)}
            unit="% YoY"
            valueColor={m2Latest && m2Latest > 5 ? 'warning' : 'success'}
          />
        </Grid>
      </Grid>

      {/* Summary Card */}
      <Card sx={{ mt: 2, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Economic Status
          </Typography>
          <Typography variant="body2">
            {gdpLatest && gdpLatest > 2 && ismLatest && ismLatest > 50
              ? '📈 Growth momentum positive'
              : spreadLatest && spreadLatest < 0
              ? '⚠️ Inverted yield curve'
              : cpiLatest && cpiLatest > 3
              ? '🔥 Inflation elevated'
              : '⚖️ Balanced conditions'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
