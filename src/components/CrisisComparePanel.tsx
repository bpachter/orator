import { useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  Chip,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useAllSeries } from '../hooks/useAllSeries'
import { SectionHeader } from './shared/SectionHeader'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { CRISIS_PERIODS, alignToCrisis, type CrisisPeriod } from '../utils/crises'
import { INDICATOR_REGISTRY, INDICATOR_BY_ID, type IndicatorMeta } from '../utils/seriesRegistry'
import { useOratorPalette } from '../state/themeMode'

/**
 * Crisis Comparison panel — pick an indicator and see how it behaved during
 * each historical recession, aligned by months from period start. The shape
 * comparison reveals whether a current indicator pattern resembles a prior
 * crisis signature.
 */
export function CrisisComparePanel() {
  const all = useAllSeries('MAX')
  const palette = useOratorPalette()

  const [indicatorId, setIndicatorId] = useState<string>('UNRATE')
  const [activeCrises, setActiveCrises] = useState<string[]>(
    CRISIS_PERIODS.slice(-4).map((c) => c.id),
  )
  const [leadMonths, setLeadMonths] = useState<number>(6)
  const [tailMonths, setTailMonths] = useState<number>(18)

  const indicator = INDICATOR_BY_ID[indicatorId] as IndicatorMeta | undefined
  const series = all.byId.get(indicatorId)?.data ?? []

  const traces = useMemo<PlotlyTrace[]>(() => {
    if (!indicator || !series.length) return []
    return CRISIS_PERIODS.filter((c) => activeCrises.includes(c.id)).map((c) => {
      const aligned = alignToCrisis(series, c, leadMonths, tailMonths)
      return {
        type: 'scatter',
        mode: 'lines',
        name: c.short,
        x: aligned.monthOffsets,
        y: aligned.values,
        line: { color: c.color, width: 2 },
        hovertemplate: `<b>${c.short}</b><br>Month %{x:.1f} from start<br>${indicator.short}: %{y:.2f}<extra></extra>`,
      }
    })
  }, [indicator, series, activeCrises, leadMonths, tailMonths])

  const layout = useMemo(
    () => ({
      xaxis: {
        title: 'Months from recession start (0 = NBER peak)',
        color: palette.textSecondary,
        gridcolor: palette.border,
        zeroline: true,
        zerolinecolor: palette.borderStrong,
        zerolinewidth: 2,
      },
      yaxis: {
        title: `${indicator?.short ?? ''} (${indicator?.unit ?? ''})`,
        color: palette.textSecondary,
        gridcolor: palette.border,
      },
      shapes: [
        {
          type: 'line' as const,
          x0: 0,
          x1: 0,
          yref: 'paper' as const,
          y0: 0,
          y1: 1,
          line: { color: palette.textMuted, width: 1, dash: 'dot' as const },
        },
      ],
      showlegend: true,
      legend: { orientation: 'h' as const, y: -0.2 },
      margin: { l: 56, r: 16, t: 16, b: 56 },
    }),
    [palette, indicator],
  )

  if (all.isLoading) return <LoadingState message="Loading historical series…" height={500} />

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Pattern recognition"
        title="Crisis Comparison"
        subtitle="Overlay any indicator across U.S. recession periods, aligned to the start of each crisis."
        updated={all.updated}
      />

      <PanelCard dense title="Setup">
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Autocomplete
            size="small"
            options={INDICATOR_REGISTRY}
            getOptionLabel={(o) => `${o.label} (${o.id})`}
            value={indicator ?? null}
            onChange={(_, v) => v && setIndicatorId(v.id)}
            renderInput={(params) => <TextField {...params} label="Indicator" />}
          />

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
              Crisis periods (toggle)
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {CRISIS_PERIODS.map((c) => {
                const on = activeCrises.includes(c.id)
                return (
                  <Chip
                    key={c.id}
                    label={c.name}
                    size="small"
                    onClick={() =>
                      setActiveCrises((prev) =>
                        prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                      )
                    }
                    sx={{
                      bgcolor: on ? c.color : 'transparent',
                      color: on ? '#0f172a' : 'text.primary',
                      borderColor: c.color,
                      cursor: 'pointer',
                    }}
                    variant="outlined"
                  />
                )
              })}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Lead-in (months before crisis)
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={leadMonths}
                onChange={(_, v: number | null) => v !== null && setLeadMonths(v)}
              >
                {[3, 6, 12, 24].map((m) => (
                  <ToggleButton key={m} value={m} sx={{ px: 1.5, py: 0.25 }}>
                    {m}m
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Tail-out (months after crisis ends)
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={tailMonths}
                onChange={(_, v: number | null) => v !== null && setTailMonths(v)}
              >
                {[6, 12, 18, 36].map((m) => (
                  <ToggleButton key={m} value={m} sx={{ px: 1.5, py: 0.25 }}>
                    {m}m
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Stack>
      </PanelCard>

      <PanelCard
        dense
        title={`${indicator?.label ?? 'Indicator'} during U.S. recessions`}
        subtitle="X-axis: months from recession start (0 = peak)"
      >
        {traces.length === 0 ? (
          <Box sx={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
            <Typography variant="body2">Select at least one crisis period above.</Typography>
          </Box>
        ) : (
          <PlotlyChart traces={traces} layout={layout} minHeight={460} ariaLabel="Crisis overlay" />
        )}
      </PanelCard>

      <PanelCard dense title="Crisis Reference">
        <Stack spacing={1} sx={{ pt: 1 }}>
          {CRISIS_PERIODS.map((c) => (
            <CrisisRow key={c.id} crisis={c} />
          ))}
        </Stack>
      </PanelCard>
    </Stack>
  )
}

function CrisisRow({ crisis }: { crisis: CrisisPeriod }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: crisis.color }} />
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 240 }}>
        {crisis.name}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {crisis.start} → {crisis.end}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', flex: 1 }}>
        {crisis.description}
      </Typography>
    </Stack>
  )
}
