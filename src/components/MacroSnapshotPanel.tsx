import { Box, Chip, Divider, Grid, LinearProgress, Paper, Stack, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import RemoveIcon from '@mui/icons-material/Remove'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import type { MacroSnapshot, TopSignal } from '../api/fred'
import { useMacroSnapshot } from '../hooks/useFredQueries'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { palette } from '../theme'

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

const STATE_COLOR: Record<string, string> = {
  normal: palette.positive,
  watch: palette.warning,
  warning: palette.series.orange,
  critical: palette.negative,
}

const VIX_REGIME_COLOR: Record<string, string> = {
  calm: palette.positive,
  normal: palette.series.blue,
  elevated: palette.warning,
  crisis: palette.negative,
}

function recessionColor(label: string): string {
  if (label === 'High') return palette.negative
  if (label === 'Elevated') return palette.series.orange
  if (label === 'Moderate') return palette.warning
  return palette.positive
}

function spreadColor(bps: number): string {
  if (bps < -20) return palette.negative
  if (bps < 0) return palette.series.orange
  if (bps < 30) return palette.warning
  return palette.positive
}

function vixColor(vix: number): string {
  if (vix >= 35) return palette.negative
  if (vix >= 25) return palette.series.orange
  if (vix >= 15) return palette.warning
  return palette.positive
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RiskGauge({ score, label }: { score: number; label: string }) {
  const color = recessionColor(label)
  const pct = Math.min(100, Math.round(score * 100))
  return (
    <PanelCard>
      <Stack spacing={1.5}>
        <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1, letterSpacing: '0.08em' }}>
          Recession Risk
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={1.5}>
          <Typography
            variant="h2"
            sx={{ color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
          >
            {pct}%
          </Typography>
          <Chip
            label={label}
            size="small"
            sx={{ bgcolor: alpha(color, 0.16), color, fontWeight: 700, border: `1px solid ${alpha(color, 0.35)}` }}
          />
        </Stack>
        <Box sx={{ position: 'relative', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(color, 0.12),
              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Composite probability across cycle, labor, financial &amp; stagflation signals
        </Typography>
      </Stack>
    </PanelCard>
  )
}

function StatCard({
  label,
  value,
  unit,
  color,
  tooltip,
  icon,
}: {
  label: string
  value: string
  unit?: string
  color?: string
  tooltip?: string
  icon?: React.ReactNode
}) {
  const displayColor = color ?? palette.series.blue
  return (
    <Tooltip title={tooltip ?? ''} placement="top" arrow>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderColor: alpha(displayColor, 0.2),
          bgcolor: alpha(displayColor, 0.04),
          borderRadius: 2,
          height: '100%',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          '&:hover': {
            borderColor: alpha(displayColor, 0.45),
            boxShadow: `0 0 14px ${alpha(displayColor, 0.12)}`,
          },
        }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            {icon && (
              <Box sx={{ color: displayColor, display: 'flex', fontSize: 14, opacity: 0.8 }}>
                {icon}
              </Box>
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {label}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography variant="h5" sx={{ color: displayColor, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              {value}
            </Typography>
            {unit && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {unit}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Tooltip>
  )
}

function YieldCurveCard({ spread, inverted }: { spread: number; inverted: boolean }) {
  const color = spreadColor(spread)
  const bps = Math.round(spread * 100)
  return (
    <StatCard
      label="2s10s Spread"
      value={bps >= 0 ? `+${bps}` : `${bps}`}
      unit="bps"
      color={color}
      tooltip={inverted ? 'Yield curve inverted — historical recession precursor' : 'Yield curve slope: 10Y minus 2Y Treasury'}
      icon={inverted ? <TrendingDownIcon fontSize="inherit" /> : <TrendingUpIcon fontSize="inherit" />}
    />
  )
}

function VixCard({ vix, regime }: { vix: number; regime: string }) {
  const color = vixColor(vix)
  const regimeColor = VIX_REGIME_COLOR[regime] ?? palette.series.blue
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: alpha(color, 0.2),
        bgcolor: alpha(color, 0.04),
        borderRadius: 2,
        height: '100%',
        '&:hover': {
          borderColor: alpha(color, 0.45),
          boxShadow: `0 0 14px ${alpha(color, 0.12)}`,
        },
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
      }}
    >
      <Stack spacing={0.75}>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          VIX
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h5" sx={{ color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            {vix.toFixed(1)}
          </Typography>
          <Chip
            label={regime.charAt(0).toUpperCase() + regime.slice(1)}
            size="small"
            sx={{
              bgcolor: alpha(regimeColor, 0.15),
              color: regimeColor,
              fontWeight: 700,
              fontSize: '0.65rem',
              border: `1px solid ${alpha(regimeColor, 0.3)}`,
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  )
}

function TopSignalRow({ signal }: { signal: TopSignal }) {
  const color = STATE_COLOR[signal.state] ?? palette.series.blue
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        py: 1,
        px: 1.5,
        borderRadius: 1.5,
        bgcolor: alpha(color, 0.06),
        border: `1px solid ${alpha(color, 0.18)}`,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: color,
          flexShrink: 0,
          boxShadow: `0 0 6px ${alpha(color, 0.7)}`,
        }}
      />
      <Typography variant="body2" sx={{ flex: 1, color: 'text.primary', fontWeight: 500 }}>
        {signal.name}
      </Typography>
      <Typography variant="body2" sx={{ color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
        {signal.value}
      </Typography>
      <Chip
        label={signal.state}
        size="small"
        sx={{
          bgcolor: alpha(color, 0.14),
          color,
          fontWeight: 700,
          fontSize: '0.6rem',
          textTransform: 'uppercase',
          border: `1px solid ${alpha(color, 0.28)}`,
        }}
      />
    </Stack>
  )
}

function NarrativeCard({ text }: { text: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: alpha(palette.brand, 0.25),
        bgcolor: alpha(palette.brand, 0.04),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          bgcolor: palette.brand,
          borderRadius: '2px 0 0 2px',
          opacity: 0.7,
        }}
      />
      <Stack spacing={1} sx={{ pl: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FlashOnIcon sx={{ fontSize: 16, color: palette.brand }} />
          <Typography variant="overline" sx={{ color: palette.brand, letterSpacing: '0.1em' }}>
            Macro Narrative
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, fontStyle: 'italic' }}>
          {text}
        </Typography>
      </Stack>
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

function SnapshotContent({ data }: { data: MacroSnapshot }) {
  const hasSignals = data.top_signals.length > 0
  const stagflPct = Math.round(data.stagflation_score * 100)
  const stagflColor =
    data.stagflation_score >= 0.66 ? palette.negative :
    data.stagflation_score >= 0.40 ? palette.series.orange :
    data.stagflation_score >= 0.20 ? palette.warning :
    palette.positive

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          As of <strong style={{ color: palette.brand }}>{data.date}</strong>
        </Typography>
        {data.yield_curve_inverted && (
          <Chip
            icon={<TrendingDownIcon />}
            label="Yield Curve Inverted"
            size="small"
            sx={{
              bgcolor: alpha(palette.negative, 0.15),
              color: palette.negative,
              fontWeight: 700,
              border: `1px solid ${alpha(palette.negative, 0.35)}`,
            }}
          />
        )}
      </Stack>

      {/* Risk gauges */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <RiskGauge score={data.recession_composite} label={data.recession_label} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PanelCard>
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1, letterSpacing: '0.08em' }}>
                Stagflation Pressure
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1.5}>
                <Typography
                  variant="h2"
                  sx={{ color: stagflColor, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
                >
                  {stagflPct}%
                </Typography>
                <Chip
                  label={stagflPct >= 66 ? 'High' : stagflPct >= 40 ? 'Elevated' : stagflPct >= 20 ? 'Moderate' : 'Low'}
                  size="small"
                  sx={{ bgcolor: alpha(stagflColor, 0.16), color: stagflColor, fontWeight: 700, border: `1px solid ${alpha(stagflColor, 0.35)}` }}
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={stagflPct}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(stagflColor, 0.12),
                  '& .MuiLinearProgress-bar': { bgcolor: stagflColor, borderRadius: 4 },
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Composite of CPI, unemployment, energy, and credit stress
              </Typography>
            </Stack>
          </PanelCard>
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: alpha(palette.border, 0.6) }} />

      {/* Key macro stats */}
      <Box>
        <SectionHeader title="Key Indicators" />
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={6} sm={4} md={2}>
            <YieldCurveCard spread={data.yield_curve_spread_2_10} inverted={data.yield_curve_inverted} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <VixCard vix={data.vix} regime={data.vix_regime} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              label="HY Spread"
              value={Math.round(data.hy_spread).toString()}
              unit="bps"
              color={data.hy_spread > 500 ? palette.negative : data.hy_spread > 350 ? palette.warning : palette.positive}
              tooltip="ICE BofA US High Yield OAS — credit risk premium"
              icon={<RemoveIcon fontSize="inherit" />}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              label="Unemployment"
              value={data.unemployment.toFixed(1)}
              unit="%"
              color={data.unemployment > 5.5 ? palette.negative : data.unemployment > 4.5 ? palette.warning : palette.positive}
              tooltip="U-3 unemployment rate (UNRATE)"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              label="CPI YoY"
              value={data.cpi_yoy.toFixed(1)}
              unit="%"
              color={data.cpi_yoy > 4 ? palette.negative : data.cpi_yoy > 2.5 ? palette.warning : palette.positive}
              tooltip="Consumer Price Index, year-over-year change"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              label="Fed Funds"
              value={data.fed_funds_rate.toFixed(2)}
              unit="%"
              color={palette.series.blue}
              tooltip="Effective Federal Funds Rate"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ borderColor: alpha(palette.border, 0.6) }} />

      {/* Top signals + narrative */}
      <Grid container spacing={3}>
        {hasSignals && (
          <Grid item xs={12} md={6}>
            <SectionHeader title="Active Signals" />
            <Stack spacing={1} sx={{ mt: 1 }}>
              {data.top_signals.map((s, i) => (
                <TopSignalRow key={i} signal={s} />
              ))}
              {data.top_signals.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No elevated signals detected.
                </Typography>
              )}
            </Stack>
          </Grid>
        )}
        <Grid item xs={12} md={hasSignals ? 6 : 12}>
          {data.narrative && (
            <>
              <SectionHeader title="Narrative" />
              <Box sx={{ mt: 1 }}>
                <NarrativeCard text={data.narrative} />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </Stack>
  )
}

export function MacroSnapshotPanel() {
  const { data, isLoading, error } = useMacroSnapshot()

  if (isLoading) return <LoadingState message="Loading macro snapshot…" />
  if (error || !data) return <ErrorState message="Failed to load macro snapshot." />

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <SnapshotContent data={data} />
    </Box>
  )
}
