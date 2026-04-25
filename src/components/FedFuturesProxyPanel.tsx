import { useMemo, useState } from 'react'
import { Box, Chip, Stack, Switch, Typography } from '@mui/material'
import { useMacro, useYieldSurface } from '../hooks/useFredQueries'
import { useFilters } from '../state/filters'
import { palette } from '../theme'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import { ErrorState } from './shared/ErrorState'
import { SectionHeader } from './shared/SectionHeader'
import { DownloadMultiButton } from './shared/DownloadButton'
import { PlotlyChart, type PlotlyTrace } from './shared/PlotlyChart'
import { latest } from '../utils/series'
import { RECESSIONS } from '../utils/recessions'

type DensityMode = 'sparse' | 'standard' | 'dense'
type HorizonMode = 3 | 5

const DENSITY_PATHS: Record<DensityMode, number> = {
  sparse: 45,
  standard: 110,
  dense: 220,
}

function addYearFraction(dateIso: string, years: number): string {
  const dt = new Date(`${dateIso}T00:00:00Z`)
  const days = Math.round(years * 365.25)
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

export function FedFuturesProxyPanel() {
  const { filters } = useFilters()
  const macro = useMacro(filters.range)
  const yc = useYieldSurface(filters.range)
  const [density, setDensity] = useState<DensityMode>('standard')
  const [horizon, setHorizon] = useState<HorizonMode>(3)
  const [showRecessions, setShowRecessions] = useState(true)

  const fedFunds = macro.data?.series?.FEDFUNDS ?? []
  const surface = yc.data
  const maxGhostPaths = DENSITY_PATHS[density]

  const horizonIdx = (surface?.maturityYears ?? [])
    .map((years, idx) => ({ years, idx }))
    .filter((m) => m.years <= horizon)

  const traces: PlotlyTrace[] = useMemo(() => {
    if (!surface || !surface.dates.length || !horizonIdx.length) return []

    const out: PlotlyTrace[] = []

    const stride = Math.max(1, Math.floor(surface.dates.length / maxGhostPaths))

    for (let i = 0; i < surface.dates.length; i += stride) {
      const startDate = surface.dates[i]
      const curveRow = surface.z[i] ?? []
      const points = horizonIdx
        .map((m) => ({
          x: addYearFraction(startDate, m.years),
          y: curveRow[m.idx],
          years: m.years,
        }))
        .filter((p) => Number.isFinite(p.y))

      if (points.length < 2) continue

      out.push({
        type: 'scatter',
        mode: 'lines',
        x: points.map((p) => p.x),
        y: points.map((p) => p.y),
        line: { color: 'rgba(148,163,184,0.26)', width: 1.15 },
        hoverinfo: 'skip',
        showlegend: false,
      })
    }

    const latestIdx = surface.dates.length - 1
    const latestStart = surface.dates[latestIdx]
    const latestRow = surface.z[latestIdx] ?? []
    const latestPoints = horizonIdx
      .map((m) => ({
        x: addYearFraction(latestStart, m.years),
        y: latestRow[m.idx],
        years: m.years,
      }))
      .filter((p) => Number.isFinite(p.y))

    if (latestPoints.length >= 2) {
      out.push({
        type: 'scatter',
        mode: 'lines',
        name: 'Latest implied path',
        x: latestPoints.map((p) => p.x),
        y: latestPoints.map((p) => p.y),
        line: { color: palette.series.cyan, width: 2.5 },
        hovertemplate: 'Implied %{x}: %{y:.2f}%<extra>Latest path</extra>',
      })
    }

    out.push({
      type: 'scatter',
      mode: 'lines',
      name: 'Effective Fed Funds Rate',
      x: fedFunds.map((o) => o.date),
      y: fedFunds.map((o) => o.value),
      line: { color: palette.textPrimary, width: 2.5 },
      hovertemplate: 'Fed Funds %{x}: %{y:.2f}%<extra></extra>',
    })

    return out
  }, [surface, horizonIdx, fedFunds, maxGhostPaths])

  const recessionShapes = useMemo(() => {
    if (!showRecessions || !fedFunds.length) return []
    const chartStart = fedFunds[0].date
    const chartEnd = fedFunds[fedFunds.length - 1].date
    const startMs = new Date(chartStart).getTime()
    const endMs = new Date(chartEnd).getTime()

    return RECESSIONS
      .filter((r) => new Date(r.end).getTime() > startMs && new Date(r.start).getTime() < endMs)
      .map((r) => ({
        type: 'rect' as const,
        xref: 'x' as const,
        yref: 'paper' as const,
        x0: r.start,
        x1: r.end,
        y0: 0,
        y1: 1,
        fillcolor: 'rgba(128, 128, 128, 0.08)',
        line: { width: 0 },
        layer: 'below' as const,
      }))
  }, [showRecessions, fedFunds])

  if (macro.isLoading || yc.isLoading) {
    return (
      <PanelCard title="Fed Funds vs Market-Implied Path" subtitle="Building historical trajectory map...">
        <LoadingState />
      </PanelCard>
    )
  }

  if (macro.isError || yc.isError) {
    return (
      <PanelCard title="Fed Funds vs Market-Implied Path">
        <ErrorState
          message={(macro.error as Error)?.message ?? (yc.error as Error)?.message}
          onRetry={() => {
            void macro.refetch()
            void yc.refetch()
          }}
        />
      </PanelCard>
    )
  }

  const latestFed = latest(fedFunds)
  const latestSurfaceRow = surface?.z?.[surface.dates.length - 1] ?? []
  const oneYearIdx = (surface?.maturityYears ?? []).findIndex((y) => y === 1)
  const twoYearIdx = (surface?.maturityYears ?? []).findIndex((y) => y === 2)
  const implied1y = oneYearIdx >= 0 ? latestSurfaceRow[oneYearIdx] : undefined
  const implied2y = twoYearIdx >= 0 ? latestSurfaceRow[twoYearIdx] : undefined

  return (
    <Stack spacing={2.5}>
      <SectionHeader
        eyebrow="Rates & Yields"
        title="Fed Funds vs Historical Implied Trajectories"
        subtitle="Free proxy for Fed Funds futures using Treasury curve snapshots projected forward across history"
        updated={macro.data?.updated ?? yc.data?.updated}
        action={
          <DownloadMultiButton
            series={{ FEDFUNDS: fedFunds }}
            filename="fed-futures-proxy"
          />
        }
      />

      <PanelCard>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(320px, 0.9fr)' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          <Stack spacing={1.25} justifyContent="space-between">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 88 }}>
                Density
              </Typography>
              <Stack direction="row" spacing={0.75}>
                <Chip
                  size="small"
                  label="Sparse"
                  clickable
                  onClick={() => setDensity('sparse')}
                  sx={{
                    bgcolor: density === 'sparse' ? palette.series.blue + '22' : undefined,
                    color: density === 'sparse' ? palette.series.blue : 'text.secondary',
                    border: `1px solid ${density === 'sparse' ? palette.series.blue : palette.border}`,
                    fontWeight: density === 'sparse' ? 700 : 500,
                  }}
                />
                <Chip
                  size="small"
                  label="Standard"
                  clickable
                  onClick={() => setDensity('standard')}
                  sx={{
                    bgcolor: density === 'standard' ? palette.series.blue + '22' : undefined,
                    color: density === 'standard' ? palette.series.blue : 'text.secondary',
                    border: `1px solid ${density === 'standard' ? palette.series.blue : palette.border}`,
                    fontWeight: density === 'standard' ? 700 : 500,
                  }}
                />
                <Chip
                  size="small"
                  label="Dense"
                  clickable
                  onClick={() => setDensity('dense')}
                  sx={{
                    bgcolor: density === 'dense' ? palette.series.blue + '22' : undefined,
                    color: density === 'dense' ? palette.series.blue : 'text.secondary',
                    border: `1px solid ${density === 'dense' ? palette.series.blue : palette.border}`,
                    fontWeight: density === 'dense' ? 700 : 500,
                  }}
                />
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 88 }}>
                Horizon
              </Typography>
              <Stack direction="row" spacing={0.75}>
                <Chip
                  size="small"
                  label="3Y"
                  clickable
                  onClick={() => setHorizon(3)}
                  sx={{
                    bgcolor: horizon === 3 ? palette.series.cyan + '22' : undefined,
                    color: horizon === 3 ? palette.series.cyan : 'text.secondary',
                    border: `1px solid ${horizon === 3 ? palette.series.cyan : palette.border}`,
                    fontWeight: horizon === 3 ? 700 : 500,
                  }}
                />
                <Chip
                  size="small"
                  label="5Y"
                  clickable
                  onClick={() => setHorizon(5)}
                  sx={{
                    bgcolor: horizon === 5 ? palette.series.cyan + '22' : undefined,
                    color: horizon === 5 ? palette.series.cyan : 'text.secondary',
                    border: `1px solid ${horizon === 5 ? palette.series.cyan : palette.border}`,
                    fontWeight: horizon === 5 ? 700 : 500,
                  }}
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: { md: 1 } }}>
                <Switch size="small" checked={showRecessions} onChange={(e) => setShowRecessions(e.target.checked)} />
                <Typography variant="caption" color="text.secondary">
                  Recession shading
                </Typography>
              </Stack>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Historical implied paths are sampled from the selected period with {maxGhostPaths} target trajectories and a {horizon}Y forward horizon.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 1,
            }}
          >
            <Box
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: `1px solid ${palette.series.blue}55`,
                bgcolor: palette.series.blue + '14',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 82,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                Fed Funds
              </Typography>
              <Typography variant="h5" sx={{ color: palette.series.blue, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                {latestFed ? `${latestFed.value.toFixed(2)}%` : 'n/a'}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: `1px solid ${palette.series.cyan}55`,
                bgcolor: palette.series.cyan + '14',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 82,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                Implied 1Y
              </Typography>
              <Typography variant="h5" sx={{ color: palette.series.cyan, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                {implied1y !== undefined ? `${implied1y.toFixed(2)}%` : 'n/a'}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: `1px solid ${palette.series.purple}55`,
                bgcolor: palette.series.purple + '14',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 82,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                Implied 2Y
              </Typography>
              <Typography variant="h5" sx={{ color: palette.series.purple, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                {implied2y !== undefined ? `${implied2y.toFixed(2)}%` : 'n/a'}
              </Typography>
            </Box>
          </Box>
        </Box>
        </Stack>
      </PanelCard>

      <PanelCard dense title="Fed Funds Rate vs Historical Implied Policy Paths" subtitle="Black: realized Fed Funds. Grey: past implied trajectories. Cyan: latest implied path.">
        <PlotlyChart
          traces={traces}
          shapes={recessionShapes}
          minHeight={520}
          ariaLabel="Fed Funds versus historical implied policy trajectories"
          layout={{
            legend: { orientation: 'h', x: 0, y: 1.12 },
            yaxis: { title: 'Rate (%)' },
          }}
        />
      </PanelCard>
    </Stack>
  )
}
