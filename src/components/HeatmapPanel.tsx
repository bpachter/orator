import { useMemo, useState } from 'react'
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  alpha,
} from '@mui/material'
import { useFilters } from '../state/filters'
import { useAllSeries, type IndicatorBundle } from '../hooks/useAllSeries'
import { SectionHeader } from './shared/SectionHeader'
import { LoadingState } from './shared/LoadingState'
import { PanelCard } from './shared/PanelCard'
import { rollingChanges, summarize } from '../utils/stats'
import { useOratorPalette } from '../state/themeMode'
import { INDICATOR_REGISTRY } from '../utils/seriesRegistry'

type ChangeWindow = '1W' | '1M' | '3M' | '1Y'

const CHANGE_WINDOWS: ChangeWindow[] = ['1W', '1M', '3M', '1Y']

/**
 * Macro Indicator Heatmap — Bloomberg-style "at-a-glance" view of every
 * indicator with rolling % change buckets (1W/1M/3M/1Y), color-coded
 * green-positive / red-negative, organized by section.
 *
 * Click any cell to navigate to that indicator's home tab.
 */
export function HeatmapPanel() {
  const { filters, setView } = useFilters()
  const all = useAllSeries(filters.range)
  const palette = useOratorPalette()
  const [window, setWindow] = useState<ChangeWindow>('1M')

  const sections = useMemo(() => {
    const map = new Map<string, IndicatorBundle[]>()
    for (const b of all.bundles) {
      const arr = map.get(b.meta.section) ?? []
      arr.push(b)
      map.set(b.meta.section, arr)
    }
    return Array.from(map.entries())
  }, [all.bundles])

  if (all.isLoading) {
    return <LoadingState message="Loading every indicator…" height={500} />
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Bloomberg-style overview"
        title="Macro Heatmap"
        subtitle={`Rolling % change for ${INDICATOR_REGISTRY.length} indicators across ${sections.length} sections.`}
        updated={all.updated}
        action={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={window}
            onChange={(_, v: ChangeWindow | null) => v && setWindow(v)}
          >
            {CHANGE_WINDOWS.map((w) => (
              <ToggleButton key={w} value={w} sx={{ px: 1.5, py: 0.25 }}>
                {w}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />

      <Stack spacing={2}>
        {sections.map(([section, items]) => (
          <PanelCard key={section} dense title={section}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(6, 1fr)',
                },
                gap: 1,
                mt: 1,
              }}
            >
              {items.map((b) => (
                <HeatCell
                  key={b.meta.id}
                  bundle={b}
                  window={window}
                  onClick={() => setView(b.meta.view)}
                />
              ))}
            </Box>
          </PanelCard>
        ))}
      </Stack>

      <PanelCard dense title="Heatmap Legend">
        <Stack direction="row" spacing={2} alignItems="center" sx={{ pt: 1, flexWrap: 'wrap' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, bgcolor: palette.positive, borderRadius: 0.5 }} />
            <Typography variant="caption">Positive (green)</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, bgcolor: palette.negative, borderRadius: 0.5 }} />
            <Typography variant="caption">Negative (red)</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Inverted indicators (unemployment, VIX, mortgage rate, charge-offs) flip the color
            convention so "improving" macro is always green.
          </Typography>
        </Stack>
      </PanelCard>
    </Stack>
  )
}

function HeatCell({
  bundle,
  window,
  onClick,
}: {
  bundle: IndicatorBundle
  window: ChangeWindow
  onClick: () => void
}) {
  const palette = useOratorPalette()
  const stats = useMemo(() => summarize(bundle.data), [bundle.data])
  const changes = useMemo(() => rollingChanges(bundle.data), [bundle.data])
  const pct = changes[window]
  const hasData = bundle.data.length > 0 && pct !== null

  // For inverted indicators, negative changes are "good"
  const positive = pct !== null && (bundle.meta.inverted ? pct < 0 : pct > 0)
  const intensity = pct !== null ? Math.min(Math.abs(pct) / 5, 1) : 0
  const baseColor = !hasData
    ? palette.surfaceAlt
    : positive
    ? palette.positive
    : palette.negative

  return (
    <Tooltip
      arrow
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{bundle.meta.label}</Typography>
          <Typography variant="caption" component="div" sx={{ opacity: 0.8 }}>
            Latest: {stats.latest !== null ? stats.latest.toFixed(2) : '—'}
            {bundle.meta.unit && ` ${bundle.meta.unit}`}
          </Typography>
          <Typography variant="caption" component="div" sx={{ opacity: 0.8 }}>
            Z-score: {Number.isFinite(stats.zscore) ? stats.zscore.toFixed(2) : '—'} · pct rank:{' '}
            {Number.isFinite(stats.percentile) ? stats.percentile.toFixed(0) : '—'}%
          </Typography>
          <Typography variant="caption" component="div" sx={{ opacity: 0.8, mt: 0.5 }}>
            {window} change: {pct !== null ? `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%` : '—'}
          </Typography>
          <Typography variant="caption" component="div" sx={{ opacity: 0.6, mt: 0.5 }}>
            Click to open {bundle.meta.view} dashboard
          </Typography>
        </Box>
      }
    >
      <Box
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          p: 1,
          borderRadius: 1,
          border: `1px solid ${palette.border}`,
          bgcolor: hasData ? alpha(baseColor, 0.08 + intensity * 0.32) : palette.surfaceAlt,
          transition: 'transform 120ms ease, box-shadow 120ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${alpha(baseColor, 0.4)}`,
            borderColor: baseColor,
          },
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ fontSize: 10, color: palette.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}
          noWrap
        >
          {bundle.meta.short}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 600,
            color: hasData ? baseColor : palette.textMuted,
            fontSize: 13,
            mt: 0.25,
          }}
        >
          {hasData ? `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%` : '—'}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 10, color: palette.textMuted }}>
          {stats.latest !== null ? stats.latest.toFixed(2) : '—'}
          {bundle.meta.unit ? ` ${bundle.meta.unit}` : ''}
        </Typography>
      </Box>
    </Tooltip>
  )
}
