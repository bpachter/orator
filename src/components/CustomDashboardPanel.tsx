import { useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { useFilters } from '../state/filters'
import { useAllSeries } from '../hooks/useAllSeries'
import { useCustomDashboards, type CustomDashboard } from '../state/customDashboards'
import { SectionHeader } from './shared/SectionHeader'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { KpiChip } from './shared/KpiChip'
import { useOratorPalette } from '../state/themeMode'
import { INDICATOR_REGISTRY } from '../utils/seriesRegistry'
import { latest, trendDirection } from '../utils/series'

/**
 * Custom Dashboard Builder — users can create personal dashboards composed
 * of any indicators across the registry. Each dashboard persists to
 * localStorage and renders a responsive grid of mini-charts. Reorder via
 * up/down arrows; remove with the trash icon.
 */
export function CustomDashboardPanel() {
  const { filters } = useFilters()
  const all = useAllSeries(filters.range)
  const dashboards = useCustomDashboards()
  const palette = useOratorPalette()
  const [newName, setNewName] = useState('')

  if (all.isLoading) return <LoadingState message="Loading indicators…" height={400} />

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Personal workspace"
        title="Custom Dashboard Builder"
        subtitle="Compose your own dashboards from any indicator. Saved to this browser."
        updated={all.updated}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Select
              size="small"
              value={dashboards.activeId ?? ''}
              displayEmpty
              onChange={(e) => dashboards.setActive(e.target.value || null)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">— select dashboard —</MenuItem>
              {dashboards.dashboards.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        }
      />

      <PanelCard dense title="Manage Dashboards">
        <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
          <TextField
            size="small"
            placeholder="New dashboard name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (newName.trim()) {
                dashboards.create(newName)
                setNewName('')
              }
            }}
          >
            Create
          </Button>
        </Stack>

        {dashboards.dashboards.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {dashboards.dashboards.map((d) => (
              <Box
                key={d.id}
                onClick={() => dashboards.setActive(d.id)}
                sx={{
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  border: `1px solid ${dashboards.activeId === d.id ? palette.brand : palette.border}`,
                  bgcolor: dashboards.activeId === d.id ? 'action.selected' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: dashboards.activeId === d.id ? 600 : 400 }}>
                  {d.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  ({d.indicators.length})
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`Delete "${d.name}"?`)) dashboards.remove(d.id)
                  }}
                  sx={{ p: 0.25 }}
                >
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </PanelCard>

      {dashboards.active ? (
        <DashboardEditor dashboard={dashboards.active} all={all} />
      ) : (
        <PanelCard dense title="Get started">
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.disabled' }}>
            <Typography variant="body2">
              Create a new dashboard above, or select an existing one from the dropdown.
            </Typography>
          </Box>
        </PanelCard>
      )}
    </Stack>
  )
}

function DashboardEditor({
  dashboard,
  all,
}: {
  dashboard: CustomDashboard
  all: ReturnType<typeof useAllSeries>
}) {
  const dashboards = useCustomDashboards()
  const palette = useOratorPalette()
  const available = INDICATOR_REGISTRY.filter((i) => !dashboard.indicators.includes(i.id))

  return (
    <>
      <PanelCard dense title={`Editing "${dashboard.name}"`} subtitle={`${dashboard.indicators.length} indicators`}>
        <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
          <Autocomplete
            size="small"
            sx={{ flex: 1 }}
            options={available}
            getOptionLabel={(o) => `${o.label} (${o.id})`}
            value={null}
            onChange={(_, v) => v && dashboards.addIndicator(dashboard.id, v.id)}
            renderInput={(params) => <TextField {...params} placeholder="Add indicator…" />}
          />
        </Stack>
      </PanelCard>

      {dashboard.indicators.length === 0 ? (
        <PanelCard dense>
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.disabled' }}>
            <Typography variant="body2">Add indicators above to populate this dashboard.</Typography>
          </Box>
        </PanelCard>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {dashboard.indicators.map((id, idx) => {
            const bundle = all.byId.get(id)
            if (!bundle) return null
            return (
              <DashboardCell
                key={id}
                bundle={bundle}
                index={idx}
                total={dashboard.indicators.length}
                onMove={(dir) => dashboards.reorder(dashboard.id, idx, idx + dir)}
                onRemove={() => dashboards.removeIndicator(dashboard.id, id)}
                paletteBorder={palette.border}
              />
            )
          })}
        </Box>
      )}
    </>
  )
}

function DashboardCell({
  bundle,
  index,
  total,
  onMove,
  onRemove,
  paletteBorder,
}: {
  bundle: NonNullable<ReturnType<ReturnType<typeof useAllSeries>['byId']['get']>>
  index: number
  total: number
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  paletteBorder: string
}) {
  const traces = useMemo<PlotlyTrace[]>(() => {
    if (!bundle.data.length) return []
    return [
      {
        type: 'scatter',
        mode: 'lines',
        x: bundle.data.map((o) => o.date),
        y: bundle.data.map((o) => o.value),
        line: { color: bundle.meta.color, width: 1.75 },
        fill: 'tozeroy',
        fillcolor: bundle.meta.color + '18',
        hovertemplate: `%{x}: %{y:.2f}${bundle.meta.unit}<extra></extra>`,
      },
    ]
  }, [bundle])
  const last = latest(bundle.data)
  const trend = trendDirection(bundle.data, 6)

  return (
    <PanelCard
      dense
      title={bundle.meta.label}
      subtitle={last ? `As of ${last.date}` : 'No data'}
      action={
        <Stack direction="row" alignItems="center" spacing={0.25}>
          <Tooltip title="Move up" arrow>
            <span>
              <IconButton size="small" disabled={index === 0} onClick={() => onMove(-1)}>
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down" arrow>
            <span>
              <IconButton size="small" disabled={index === total - 1} onClick={() => onMove(1)}>
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove" arrow>
            <IconButton size="small" onClick={onRemove}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <Box sx={{ borderTop: `1px solid ${paletteBorder}`, mt: 1, pt: 1 }}>
        {last && (
          <KpiChip
            label="Latest"
            value={last.value.toFixed(2)}
            unit={bundle.meta.unit}
            valueColor={bundle.meta.color}
            trend={trend}
            size="md"
            align="left"
          />
        )}
        <Box sx={{ mt: 1 }}>
          <PlotlyChart
            traces={traces}
            minHeight={160}
            ariaLabel={`${bundle.meta.label} mini chart`}
          />
        </Box>
      </Box>
    </PanelCard>
  )
}
