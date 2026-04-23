import { ReactNode, useMemo } from 'react'
import { Box, Stack, Tooltip, Typography } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useOratorPalette } from '../../state/themeMode'
import { summarize, changeOverDays } from '../../utils/stats'
import type { FredObs } from '../../types'

export interface AdvancedStatsProps {
  data: FredObs[]
  unit?: string
}

/**
 * Compact rich-stat strip Bloomberg-style: latest value, mean, stdev,
 * 1Y change, z-score and percentile rank — with a tooltip explaining each.
 */
export function AdvancedStats({ data, unit = '' }: AdvancedStatsProps) {
  const palette = useOratorPalette()
  const stats = useMemo(() => summarize(data), [data])
  const yoy = useMemo(() => changeOverDays(data, 365), [data])

  if (!stats.count) return null

  const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '—')
  const fmtPct = (v: number | null | undefined) =>
    v !== null && v !== undefined && Number.isFinite(v) ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` : '—'

  const yoyColor = !yoy
    ? palette.textSecondary
    : yoy.pct > 0
    ? palette.positive
    : palette.negative

  const zColor =
    Math.abs(stats.zscore) > 2
      ? palette.warning
      : Math.abs(stats.zscore) > 1
      ? palette.info
      : palette.textSecondary

  return (
    <Tooltip
      arrow
      placement="bottom-start"
      title={
        <Box sx={{ p: 0.5, maxWidth: 280 }}>
          <StatLine label="Latest" value={`${fmt(stats.latest ?? NaN)} ${unit}`} hint={stats.latestDate ?? ''} />
          <StatLine label="Mean" value={fmt(stats.mean)} hint="period mean" />
          <StatLine label="Stdev" value={fmt(stats.stdev)} hint="standard deviation" />
          <StatLine label="Min / Max" value={`${fmt(stats.min)} / ${fmt(stats.max)}`} hint="period range" />
          <StatLine label="YoY Change" value={fmtPct(yoy?.pct)} hint="vs ~365 days ago" />
          <StatLine
            label="Z-score"
            value={fmt(stats.zscore)}
            hint="how many stdevs from mean"
          />
          <StatLine
            label="Percentile"
            value={`${stats.percentile.toFixed(0)}%`}
            hint="rank within period"
          />
        </Box>
      }
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          fontSize: 11,
          color: palette.textSecondary,
          fontFamily: 'ui-monospace, monospace',
          flexWrap: 'wrap',
          rowGap: 0.5,
        }}
      >
        <Mini label="μ" value={fmt(stats.mean)} />
        <Mini label="σ" value={fmt(stats.stdev)} />
        <Mini label="YoY" value={fmtPct(yoy?.pct)} color={yoyColor} />
        <Mini label="z" value={fmt(stats.zscore)} color={zColor} />
        <Mini label="pct" value={`${stats.percentile.toFixed(0)}%`} />
        <InfoOutlinedIcon sx={{ fontSize: 13, color: palette.textMuted }} />
      </Stack>
    </Tooltip>
  )
}

function Mini({ label, value, color }: { label: ReactNode; value: ReactNode; color?: string }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Box component="span" sx={{ opacity: 0.6 }}>
        {label}
      </Box>
      <Box component="span" sx={{ fontWeight: 600, color: color }}>
        {value}
      </Box>
    </Box>
  )
}

function StatLine({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.25 }}>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.6, fontSize: 10 }}>
            {hint}
          </Typography>
        )}
      </Box>
      <Typography variant="caption" sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  )
}
