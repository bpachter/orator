import { useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { useFilters } from '../state/filters'
import { useAllSeries } from '../hooks/useAllSeries'
import { useCompareList, COMPARE_MAX_ITEMS } from '../state/compareList'
import { SectionHeader } from './shared/SectionHeader'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { KpiChip } from './shared/KpiChip'
import { useOratorPalette } from '../state/themeMode'
import { INDICATOR_REGISTRY, INDICATOR_BY_ID } from '../utils/seriesRegistry'
import { alignSeries, normalize01, pearson, summarize } from '../utils/stats'
import { getRecessionShapes } from '../utils/recessions'

type AxisMode = 'dual' | 'normalized'

/**
 * Series Comparison Tool — pick up to 4 indicators and overlay them on a
 * shared chart. Two modes: "dual" (multiple Y axes) and "normalized"
 * (rebase to 0-100 for shape comparison). Correlation matrix shown below.
 */
export function ComparePanel() {
  const { filters } = useFilters()
  const all = useAllSeries(filters.range)
  const { ids, add, remove, clear } = useCompareList()
  const palette = useOratorPalette()
  const [mode, setMode] = useState<AxisMode>('normalized')

  const selected = useMemo(
    () => ids.map((id) => all.byId.get(id)).filter((b): b is NonNullable<typeof b> => Boolean(b)),
    [ids, all.byId],
  )

  const traces = useMemo<PlotlyTrace[]>(() => {
    if (!selected.length) return []
    return selected.map((b, idx) => {
      const xs = b.data.map((o) => o.date)
      const ys = mode === 'normalized' ? normalize01(b.data.map((o) => o.value)) : b.data.map((o) => o.value)
      const trace: PlotlyTrace = {
        type: 'scatter',
        mode: 'lines',
        name: `${b.meta.short} (${b.meta.unit || '—'})`,
        x: xs,
        y: ys,
        line: { color: b.meta.color, width: 2, shape: 'spline' },
        hovertemplate: `<b>${b.meta.short}</b><br>%{x}: %{y:.2f}<extra></extra>`,
      }
      if (mode === 'dual' && idx > 0) {
        trace.yaxis = `y${idx + 1}`
      }
      return trace
    })
  }, [selected, mode])

  const layout = useMemo(() => {
    if (!selected.length) return {}
    if (mode === 'normalized') {
      return {
        yaxis: { title: 'Normalized (0-100)', color: palette.textSecondary, gridcolor: palette.border },
        showlegend: true,
        legend: { orientation: 'h' as const, y: -0.2 },
        margin: { l: 56, r: 16, t: 16, b: 56 },
      }
    }
    // dual axis layout — give every series after the first a side axis
    const axes: Record<string, unknown> = {
      yaxis: {
        title: selected[0]?.meta.short,
        color: selected[0]?.meta.color,
        gridcolor: palette.border,
      },
    }
    selected.slice(1).forEach((b, idx) => {
      const k = `yaxis${idx + 2}`
      axes[k] = {
        title: b.meta.short,
        color: b.meta.color,
        overlaying: 'y',
        side: idx % 2 === 0 ? 'right' : 'left',
        position: idx > 1 ? 1 - idx * 0.06 : undefined,
        showgrid: false,
      }
    })
    return {
      ...axes,
      showlegend: true,
      legend: { orientation: 'h' as const, y: -0.2 },
      margin: { l: 56, r: 56, t: 16, b: 56 },
    }
  }, [selected, mode, palette])

  // Correlation matrix
  const corr = useMemo(() => {
    if (selected.length < 2) return []
    const rows: { a: string; b: string; r: number; n: number }[] = []
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const aligned = alignSeries(selected[i].data, selected[j].data)
        const r = pearson(aligned.x, aligned.y)
        rows.push({ a: selected[i].meta.short, b: selected[j].meta.short, r, n: aligned.x.length })
      }
    }
    return rows
  }, [selected])

  const recessionShapes = useMemo(() => {
    if (!selected.length || !selected[0].data.length) return []
    const dates = selected[0].data.map((o) => o.date)
    return getRecessionShapes(dates[0], dates[dates.length - 1])
  }, [selected])

  if (all.isLoading) return <LoadingState message="Loading indicators…" height={400} />

  const options = INDICATOR_REGISTRY.filter((i) => !ids.includes(i.id))
  const isFull = ids.length >= COMPARE_MAX_ITEMS

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Bloomberg-style overlay"
        title="Series Comparison"
        subtitle={`Overlay up to ${COMPARE_MAX_ITEMS} indicators with dual-axis, normalized, and correlation views.`}
        updated={all.updated}
        action={
          ids.length > 0 && (
            <Button variant="text" size="small" onClick={clear}>
              Clear
            </Button>
          )
        }
      />

      <PanelCard
        dense
        title="Selection"
        subtitle={`${ids.length}/${COMPARE_MAX_ITEMS} indicators selected`}
        action={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={(_, v: AxisMode | null) => v && setMode(v)}
          >
            <ToggleButton value="normalized" sx={{ px: 1.5, py: 0.25 }}>
              Normalized
            </ToggleButton>
            <ToggleButton value="dual" sx={{ px: 1.5, py: 0.25 }}>
              Dual-axis
            </ToggleButton>
          </ToggleButtonGroup>
        }
      >
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {selected.map((b) => (
              <Chip
                key={b.meta.id}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: b.meta.color }} />
                    <span>{b.meta.short}</span>
                  </Stack>
                }
                onDelete={() => remove(b.meta.id)}
                deleteIcon={<CloseIcon />}
                size="small"
                sx={{ borderColor: b.meta.color }}
                variant="outlined"
              />
            ))}
            {ids.length === 0 && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                No indicators selected. Add some below.
              </Typography>
            )}
          </Stack>

          <Autocomplete
            size="small"
            options={options}
            getOptionLabel={(o) => `${o.label} (${o.id})`}
            disabled={isFull}
            value={null}
            onChange={(_, v) => v && add(v.id)}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: option.color }} />
                  <Box>
                    <Typography variant="body2">{option.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {option.id} · {option.section}
                    </Typography>
                  </Box>
                </Stack>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={isFull ? 'Maximum reached — remove one to add more' : 'Add indicator…'}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <AddIcon fontSize="small" sx={{ color: 'text.disabled', mr: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Stack>
      </PanelCard>

      <PanelCard
        dense
        title="Overlay Chart"
        subtitle={mode === 'normalized' ? 'Each series rebased to 0-100 for shape comparison' : 'Dual-axis preserves native units'}
      >
        {selected.length === 0 ? (
          <Box
            sx={{
              height: 360,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
              gap: 1,
            }}
          >
            <Typography variant="body2">Select indicators above to begin comparing.</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['UNRATE', 'AHETPI', 'FEDFUNDS', 'CPIAUCSL'].map((id) => {
                const meta = INDICATOR_BY_ID[id]
                if (!meta) return null
                return (
                  <Button key={id} size="small" variant="outlined" onClick={() => add(id)}>
                    + {meta.short}
                  </Button>
                )
              })}
            </Stack>
          </Box>
        ) : (
          <PlotlyChart
            traces={traces}
            layout={layout}
            shapes={recessionShapes}
            minHeight={420}
            ariaLabel="Series comparison overlay chart"
          />
        )}
      </PanelCard>

      {selected.length >= 2 && corr.length > 0 && (
        <PanelCard dense title="Correlation Matrix" subtitle="Pearson r over the aligned date range">
          <Stack spacing={1} sx={{ pt: 1 }}>
            {corr.map((row) => (
              <CorrRow key={`${row.a}-${row.b}`} {...row} />
            ))}
          </Stack>
        </PanelCard>
      )}

      {selected.length >= 1 && (
        <PanelCard dense title="Per-Series Statistics">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' },
              gap: 1.5,
              pt: 1,
            }}
          >
            {selected.map((b) => {
              const stats = summarize(b.data)
              return (
                <Box
                  key={b.meta.id}
                  sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${palette.border}` }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: b.meta.color }} />
                    <Typography variant="subtitle2">{b.meta.short}</Typography>
                  </Stack>
                  <KpiChip
                    label="Latest"
                    value={stats.latest !== null ? stats.latest.toFixed(2) : '—'}
                    unit={b.meta.unit}
                    valueColor={b.meta.color}
                    size="md"
                  />
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Mean
                      </Typography>
                      <Typography variant="body2">{stats.mean.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Stdev
                      </Typography>
                      <Typography variant="body2">{stats.stdev.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Z
                      </Typography>
                      <Typography variant="body2">{stats.zscore.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Pct rk
                      </Typography>
                      <Typography variant="body2">{stats.percentile.toFixed(0)}%</Typography>
                    </Box>
                  </Stack>
                </Box>
              )
            })}
          </Box>
        </PanelCard>
      )}
    </Stack>
  )
}

function CorrRow({ a, b, r, n }: { a: string; b: string; r: number; n: number }) {
  const palette = useOratorPalette()
  const strength = Math.abs(r)
  const color =
    !Number.isFinite(r) ? palette.textMuted
    : r > 0 ? palette.positive : palette.negative
  const label =
    !Number.isFinite(r) ? '—'
    : strength > 0.7 ? 'Strong' : strength > 0.4 ? 'Moderate' : strength > 0.2 ? 'Weak' : 'None'
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 0.75, px: 1, borderRadius: 1, bgcolor: 'action.hover' }}
    >
      <Typography variant="body2">
        <strong>{a}</strong> vs <strong>{b}</strong>
        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.disabled' }}>
          (n={n})
        </Typography>
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Tooltip title={label} arrow>
          <Box sx={{ width: 80, height: 6, bgcolor: palette.border, borderRadius: 3, position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                width: `${strength * 50}%`,
                height: '100%',
                bgcolor: color,
                borderRadius: 3,
                transform: r >= 0 ? 'translateX(0)' : 'translateX(-100%)',
              }}
            />
          </Box>
        </Tooltip>
        <Typography
          variant="body2"
          sx={{ fontFamily: 'ui-monospace, monospace', color, fontWeight: 600, minWidth: 56, textAlign: 'right' }}
        >
          {Number.isFinite(r) ? `${r >= 0 ? '+' : ''}${r.toFixed(3)}` : '—'}
        </Typography>
      </Stack>
    </Stack>
  )
}

/**
 * Reusable "Add to Compare" button for indicator cards. Drops the given
 * indicator id into the global compare list and (optionally) navigates to
 * the Compare view.
 */
export function CompareButton({ id, navigate = false }: { id: string; navigate?: boolean }) {
  const { has, toggle, isFull } = useCompareList()
  const { setView } = useFilters()
  const active = has(id)
  const onClick = () => {
    toggle(id)
    if (navigate && !active) setView('compare')
  }
  return (
    <Tooltip
      title={active ? 'Remove from comparison' : isFull ? 'Compare list full' : 'Add to comparison'}
      arrow
    >
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={!active && isFull}
          sx={{ color: active ? 'primary.main' : 'text.secondary' }}
          aria-label="Toggle compare"
        >
          {active ? <CloseIcon fontSize="small" /> : <AddIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  )
}
