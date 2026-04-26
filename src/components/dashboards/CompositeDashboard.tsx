/**
 * CompositeDashboard — Reusable framework for multi-section story dashboards.
 * Provides synchronized time range picker, data fetching orchestration, and
 * consistent layout across story dashboards (FedCycle, RecessionWarning, etc).
 */
import { ReactNode } from 'react'
import { Grid, Box, Typography } from '@mui/material'
import { PanelCard, RangePicker, LoadingState, ErrorState } from '../shared'
import type { TimeRange } from '../../types'

export interface DashboardChart {
  id: string
  title: string
  component: ReactNode
}

export interface DashboardSection {
  title: string
  subtitle?: string
  layout: '1col' | '2col' | '3col' // number of columns for grid
  charts: DashboardChart[]
  interpretation?: ReactNode
}

export interface CompositeDashboardProps {
  /** Dashboard title */
  title: string
  /** Dashboard subtitle/description */
  subtitle?: string
  /** True if currently loading any data */
  isLoading: boolean
  /** True if any hook returned error state */
  isError: boolean
  /** Error message to display */
  errorMessage?: string
  /** Array of dashboard sections */
  sections: DashboardSection[]
  /** Selected time range */
  range: TimeRange
  /** Callback when range changes */
  onRangeChange: (range: TimeRange) => void
  /** Optional KPI row at top */
  kpiRow?: ReactNode
}

export function CompositeDashboard({
  title,
  subtitle,
  isLoading,
  isError,
  errorMessage,
  sections,
  range,
  onRangeChange,
  kpiRow,
}: CompositeDashboardProps) {
  // If loading or error, show state overlay
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState message={errorMessage || 'Failed to load dashboard'} />

  // Calculate grid columns for each section layout
  const getGridCols = (layout: '1col' | '2col' | '3col') => {
    switch (layout) {
      case '1col':
        return { xs: 12, md: 12 }
      case '2col':
        return { xs: 12, md: 6 }
      case '3col':
        return { xs: 12, md: 4 }
    }
  }

  return (
    <PanelCard>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Range Picker */}
        <Box sx={{ mb: 2 }}>
          <RangePicker value={range} onChange={onRangeChange} />
        </Box>

        {/* KPI Row (optional) */}
        {kpiRow && <Box>{kpiRow}</Box>}

        {/* Sections */}
        {sections.map((section, idx) => (
          <Box key={`section-${idx}`}>
            {/* Section Header */}
            {section.title && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {section.title}
                </Typography>
                {section.subtitle && (
                  <Typography variant="caption" color="textSecondary">
                    {section.subtitle}
                  </Typography>
                )}
              </Box>
            )}

            {/* Charts Grid */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {section.charts.map((chart) => (
                <Grid
                  key={chart.id}
                  item
                  {...getGridCols(section.layout)}
                >
                  <Box>
                    {chart.title && (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          fontSize: '0.9rem',
                          color: 'textPrimary',
                        }}
                      >
                        {chart.title}
                      </Typography>
                    )}
                    <Box>{chart.component}</Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Section Interpretation (optional) */}
            {section.interpretation && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                }}
              >
                {section.interpretation}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </PanelCard>
  )
}
