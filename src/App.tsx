import { lazy, Suspense } from 'react'
import {
  AppBar,
  Box,
  Chip,
  Container,
  Link,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import CircleIcon from '@mui/icons-material/Circle'
import { useTheme } from '@mui/material/styles'
import type { ActiveView } from './types'
import { useFilters } from './state/filters'
import { RangePicker } from './components/shared/RangePicker'
import { LoadingState } from './components/shared/LoadingState'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { useHealth } from './hooks/useFredQueries'
import { palette } from './theme'

const YieldCurve3D = lazy(() =>
  import('./components/YieldCurve3D').then((m) => ({ default: m.YieldCurve3D })),
)
const MacroPanel = lazy(() =>
  import('./components/MacroPanel').then((m) => ({ default: m.MacroPanel })),
)
const CpiBreakdown = lazy(() =>
  import('./components/CpiBreakdown').then((m) => ({ default: m.CpiBreakdown })),
)
const SpreadPanel = lazy(() =>
  import('./components/SpreadPanel').then((m) => ({ default: m.SpreadPanel })),
)
const GroceryPanel = lazy(() =>
  import('./components/GroceryPanel').then((m) => ({ default: m.GroceryPanel })),
)
const LaborPanel = lazy(() =>
  import('./components/LaborPanel').then((m) => ({ default: m.LaborPanel })),
)
const HousingPanel = lazy(() =>
  import('./components/HousingPanel').then((m) => ({ default: m.HousingPanel })),
)
const RecessionSignalsPanel = lazy(() =>
  import('./components/RecessionSignalsPanel').then((m) => ({
    default: m.RecessionSignalsPanel,
  })),
)

const TABS: { value: ActiveView; label: string; description: string }[] = [
  { value: 'yield-curve', label: 'Yield Curve', description: 'U.S. Treasury yield surface' },
  { value: 'macro', label: 'Macro Dashboard', description: 'Rates, prices, labor, growth' },
  { value: 'cpi', label: 'CPI Breakdown', description: 'Inflation by component' },
  { value: 'spreads', label: 'Spreads', description: 'Yield curve spreads & policy' },
  { value: 'grocery', label: 'Grocery', description: 'BLS average price inflation' },
  { value: 'labor', label: 'Labor', description: 'Employment, wages, participation' },
  { value: 'housing', label: 'Housing', description: 'Home prices, mortgages, supply' },
  { value: 'recession', label: 'Recession Signals', description: 'Composite leading indicators' },
]

export default function App() {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('md'))
  const { filters, setView, setRange } = useFilters()
  const health = useHealth()

  const showRangePicker = filters.view === 'yield-curve'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default">
        <Toolbar disableGutters sx={{ px: { xs: 2, md: 3 }, minHeight: 56, gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={3} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 3,
                fontSize: 16,
                whiteSpace: 'nowrap',
              }}
            >
              ORATOR
            </Typography>
            <Tabs
              value={filters.view}
              onChange={(_, v: ActiveView) => setView(v)}
              variant={isCompact ? 'scrollable' : 'standard'}
              scrollButtons={isCompact ? 'auto' : false}
              allowScrollButtonsMobile
              sx={{ minHeight: 44 }}
              aria-label="Dashboard sections"
            >
              {TABS.map((t) => (
                <Tab
                  key={t.value}
                  value={t.value}
                  label={t.label}
                  aria-label={`${t.label}: ${t.description}`}
                />
              ))}
            </Tabs>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            {showRangePicker && (
              <RangePicker value={filters.range} onChange={setRange} />
            )}
            <ApiStatus
              healthy={health.data?.status === 'ok' && Boolean(health.data?.fred_key)}
              loading={health.isLoading}
              error={health.isError}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth={false}
        sx={{ flex: 1, py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 } }}
      >
        <ErrorBoundary>
          <Suspense fallback={<LoadingState message="Preparing view…" height={400} />}>
            {filters.view === 'yield-curve' && <YieldCurve3D />}
            {filters.view === 'macro' && <MacroPanel />}
            {filters.view === 'cpi' && <CpiBreakdown />}
            {filters.view === 'spreads' && <SpreadPanel />}
            {filters.view === 'grocery' && <GroceryPanel />}
            {filters.view === 'labor' && <LaborPanel />}
            {filters.view === 'housing' && <HousingPanel />}
            {filters.view === 'recession' && <RecessionSignalsPanel />}
          </Suspense>
        </ErrorBoundary>
      </Container>

      <Box
        component="footer"
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.25,
          borderTop: `1px solid ${palette.border}`,
          color: 'text.disabled',
          fontSize: 11,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <span>Data: Federal Reserve Bank of St. Louis (FRED) · BLS</span>
        <span>
          <Link href="https://bpachter.github.io" color="inherit" underline="hover">
            ← Portfolio
          </Link>
        </span>
      </Box>
    </Box>
  )
}

function ApiStatus({
  healthy,
  loading,
  error,
}: {
  healthy: boolean
  loading: boolean
  error: boolean
}) {
  const color = loading ? palette.textMuted : error || !healthy ? palette.negative : palette.positive
  const label = loading ? 'Checking…' : error ? 'API offline' : healthy ? 'API live' : 'Degraded'
  return (
    <Tooltip title={`Backend status: ${label}`} arrow>
      <Chip
        size="small"
        variant="outlined"
        icon={<CircleIcon sx={{ fontSize: 10, color: `${color} !important` }} />}
        label={label}
        sx={{
          borderColor: 'divider',
          color: 'text.secondary',
          fontSize: 11,
          height: 24,
        }}
      />
    </Tooltip>
  )
}
