import { useMemo } from 'react'
import { Box, Stack, Typography, Divider, Grid } from '@mui/material'
import type { FredObs } from '../types'

import { useMacro, useLabor, useInflation, useActivity, useSpreads, useRecessionSignals, useHousing, useConsumer, useCreditConditions } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { PanelCard } from './shared/PanelCard'
import { KpiChip } from './shared/KpiChip'
import { LoadingState } from './shared/LoadingState'

import { SectionHeader } from './shared/SectionHeader'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { DownloadMultiButton } from './shared/DownloadButton'
import { latest, trendDirection } from '../utils/series'
import { getRecessionShapes } from '../utils/recessions'
import { palette } from '../theme'

/**
 * Comprehensive Macro Dashboard consolidating all key macroeconomic indicators
 * organized by category for a complete economic overview.
 */
export function MacroPanel() {
  const { filters } = useFilters()

  // Fetch all macro data sources in parallel
  const macro = useMacro(filters.range)
  const labor = useLabor(filters.range)
  const inflation = useInflation(filters.range)
  const activity = useActivity(filters.range)
  const spreads = useSpreads(filters.range)
  const recession = useRecessionSignals(filters.range)
  const housing = useHousing(filters.range)
  const consumer = useConsumer(filters.range)
  const credit = useCreditConditions(filters.range)

  // Check if any query is loading
  const isLoading =
    macro.isLoading || labor.isLoading || inflation.isLoading || activity.isLoading || 
    spreads.isLoading || recession.isLoading || housing.isLoading || consumer.isLoading || credit.isLoading

  if (isLoading) {
    return (
      <PanelCard title="Comprehensive Macro Dashboard" subtitle="Loading all indicators…">
        <LoadingState />
      </PanelCard>
    )
  }

  // Aggregate all series data
  const allSeries = {
    ...macro.data?.series,
    ...labor.data?.series,
    ...inflation.data?.series,
    ...activity.data?.series,
    ...spreads.data?.series,
    ...recession.data?.series,
    ...housing.data?.series,
    ...consumer.data?.series,
    ...credit.data?.series,
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Economic Overview"
        title="Comprehensive Macro Dashboard"
        subtitle="Full spectrum of U.S. macroeconomic indicators"
        updated={macro.data?.updated}
        action={<DownloadMultiButton series={allSeries} filename="comprehensive-macro" />}
      />

      {/* Monetary Policy & Rates Section */}
      <MacroSection
        title="Monetary Policy & Rates"
        description="Fed policy, yields, and spread analysis"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Fed Funds Rate"
              data={macro.data?.series?.FEDFUNDS ?? []}
              unit="%"
              color={palette.series.blue}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="10Y-2Y Spread"
              data={spreads.data?.series?.['T10Y2Y'] ?? []}
              unit="bps"
              color={palette.series.orange}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="10Y-3M Spread"
              data={spreads.data?.series?.['T10Y3M'] ?? []}
              unit="bps"
              color={palette.series.purple}
            />
          </Grid>
        </Grid>
      </MacroSection>

      {/* Employment & Labor Section */}
      <MacroSection
        title="Employment & Labor"
        description="Jobs, wages, and workforce trends"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Unemployment Rate"
              data={macro.data?.series?.UNRATE ?? []}
              unit="%"
              color={palette.series.red}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Nonfarm Payrolls YoY"
              data={labor.data?.series?.PAYEMS ?? []}
              unit="%"
              color={palette.series.green}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Job Openings"
              data={labor.data?.series?.JTSJOL ?? []}
              unit="thousands"
              color={palette.series.cyan}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Avg Hourly Earnings YoY"
              data={labor.data?.series?.AHETPI ?? []}
              unit="%"
              color={palette.series.amber}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Labor Force Participation"
              data={labor.data?.series?.CIVPART ?? []}
              unit="%"
              color={palette.series.yellow}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Initial Jobless Claims"
              data={labor.data?.series?.ICSA ?? []}
              unit="thousands"
              color={palette.series.pink}
            />
          </Grid>
        </Grid>
      </MacroSection>

      {/* Inflation & Prices Section */}
      <MacroSection
        title="Inflation & Prices"
        description="CPI, PCE, and broad price measures"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="CPI YoY"
              data={macro.data?.series?.CPIAUCSL ?? []}
              unit="%"
              color={palette.series.red}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Core CPI YoY"
              data={inflation.data?.series?.CPILFESL ?? []}
              unit="%"
              color={palette.series.orange}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="PCE YoY"
              data={inflation.data?.series?.PCEPI ?? []}
              unit="%"
              color={palette.series.amber}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="PPI YoY"
              data={inflation.data?.series?.PPIACO ?? []}
              unit="%"
              color={palette.series.yellow}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Import Prices YoY"
              data={inflation.data?.series?.IR ?? []}
              unit="%"
              color={palette.series.teal}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Export Prices YoY"
              data={inflation.data?.series?.IQ ?? []}
              unit="%"
              color={palette.series.cyan}
            />
          </Grid>
        </Grid>
      </MacroSection>

      {/* Economic Activity Section */}
      <MacroSection
        title="Economic Activity"
        description="Production, manufacturing, and orders"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Real GDP"
              data={macro.data?.series?.A191RL1Q225SBEA ?? []}
              unit="%"
              color={palette.series.green}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Industrial Production"
              data={activity.data?.series?.INDPRO ?? []}
              unit="index"
              color={palette.series.blue}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Manufacturing Output"
              data={activity.data?.series?.IPMAN ?? []}
              unit="index"
              color={palette.series.cyan}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Capacity Utilization"
              data={activity.data?.series?.TCU ?? []}
              unit="%"
              color={palette.series.purple}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Durable Goods Orders"
              data={activity.data?.series?.DGORDER ?? []}
              unit="$M"
              color={palette.series.orange}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Avg Weekly Hours"
              data={labor.data?.series?.AWHNONAG ?? []}
              unit="hours"
              color={palette.series.amber}
            />
          </Grid>
        </Grid>
      </MacroSection>

      {/* Consumer Activity Section */}
      <MacroSection
        title="Consumer Activity"
        description="Spending, sentiment, and disposable income"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Retail Sales YoY"
              data={consumer.data?.series?.RSXFS ?? []}
              unit="%"
              color={palette.series.green}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Consumer Sentiment"
              data={consumer.data?.series?.UMCSENT ?? []}
              unit="index"
              color={palette.series.blue}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Personal Savings Rate"
              data={consumer.data?.series?.PSAVERT ?? []}
              unit="%"
              color={palette.series.amber}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Real Disposable Income YoY"
              data={consumer.data?.series?.DSPIC96 ?? []}
              unit="%"
              color={palette.series.cyan}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="PCE YoY"
              data={consumer.data?.series?.PCE ?? []}
              unit="%"
              color={palette.series.orange}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Credit Card Charge-Off Rate"
              data={credit.data?.series?.TERMCBCCALLNS ?? []}
              unit="%"
              color={palette.series.red}
            />
          </Grid>
        </Grid>
      </MacroSection>

      {/* Housing Market Section */}
      <MacroSection
        title="Housing Market"
        description="Starts, permits, prices, and mortgage rates"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Housing Starts"
              data={housing.data?.series?.HOUST ?? []}
              unit="thousands/mo"
              color={palette.series.blue}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Building Permits"
              data={housing.data?.series?.PERMIT ?? []}
              unit="thousands/mo"
              color={palette.series.cyan}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Case-Shiller YoY"
              data={housing.data?.series?.CSUSHPISA ?? []}
              unit="%"
              color={palette.series.green}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="30Y Mortgage Rate"
              data={housing.data?.series?.MORTGAGE30US ?? []}
              unit="%"
              color={palette.series.orange}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="Rental Vacancy"
              data={housing.data?.series?.RRVRUSQ156N ?? []}
              unit="%"
              color={palette.series.amber}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MacroIndicator
              label="New Home Sales"
              data={housing.data?.series?.HSN1F ?? []}
              unit="thousands/mo"
              color={palette.series.teal}
            />
          </Grid>
        </Grid>
      </MacroSection>

      {/* Recession Risk Section */}
      <MacroSection
        title="Recession Risk Signals"
        description="Leading indicators and inversion signals"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={6}>
            <MacroIndicator
              label="Sahm Rule Score"
              data={recession.data?.series?.SAHM_SCORE ?? []}
              unit="score"
              color={recession.data?.series?.SAHM_SCORE?.[recession.data.series.SAHM_SCORE.length - 1]?.value ?? 0 > 0.5 ? palette.negative : palette.positive}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <MacroIndicator
              label="Yield Curve Inversion"
              data={spreads.data?.series?.['T10Y2Y'] ?? []}
              unit="bps"
              color={spreads.data?.series?.['T10Y2Y']?.[spreads.data.series['T10Y2Y'].length - 1]?.value ?? 0 < 0 ? palette.negative : palette.positive}
            />
          </Grid>
        </Grid>
      </MacroSection>
    </Stack>
  )
}

interface MacroSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function MacroSection({ title, description, children }: MacroSectionProps) {
  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        )}
      </Stack>
      <Divider sx={{ mb: 2, borderColor: 'divider' }} />
      {children}
    </Box>
  )
}

interface MacroIndicatorProps {
  label: string
  data: FredObs[]
  unit?: string
  color: string
}

function MacroIndicator({ label, data, unit = '', color }: MacroIndicatorProps) {
  const lastValue = latest(data)
  const trend = lastValue ? trendDirection(data) : undefined
  const chartData: PlotlyTrace[] = useMemo(() => {
    if (!data.length) return []
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: data.map((o) => o.date),
        y: data.map((o) => o.value),
        line: { color, width: 2, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: color + '18',
        hovertemplate: `%{x}: %{y:.2f}${unit}<extra></extra>`,
      },
    ]
  }, [data, unit, color])

  const shapes = useMemo(() => {
    if (!data.length) return []
    // Optionally add recession shading for spreads/indicators
    return getRecessionShapes(data[0].date, data[data.length - 1].date)
  }, [data])

  if (!data || data.length === 0) {
    return (
      <PanelCard dense title={label} subtitle="No data">
        <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
          Data unavailable
        </Box>
      </PanelCard>
    )
  }

  return (
    <PanelCard
      dense
      title={label}
      subtitle={lastValue ? `Latest: ${new Date(lastValue.date).toLocaleDateString()}` : undefined}
      action={
        lastValue && (
          <KpiChip
            label={`Current`}
            value={lastValue.value.toFixed(2)}
            unit={unit}
            valueColor={color}
            trend={trend}
            size="sm"
            align="right"
          />
        )
      }
    >
      <PlotlyChart traces={chartData} shapes={shapes} minHeight={160} ariaLabel={`${label} chart`} />
    </PanelCard>
  )
}
