import { lazy, Suspense, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import {
  AppBar,
  Box,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import CircleIcon from '@mui/icons-material/Circle'
import MenuIcon from '@mui/icons-material/Menu'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore'
import PaidIcon from '@mui/icons-material/Paid'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import FactoryIcon from '@mui/icons-material/Factory'
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import WorkIcon from '@mui/icons-material/Work'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import DashboardIcon from '@mui/icons-material/Dashboard'
import TimelineIcon from '@mui/icons-material/Timeline'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import GridViewIcon from '@mui/icons-material/GridView'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import GridOnIcon from '@mui/icons-material/GridOn'
import EventNoteIcon from '@mui/icons-material/EventNote'
import HistoryIcon from '@mui/icons-material/History'
import BuildIcon from '@mui/icons-material/Build'
import TerminalIcon from '@mui/icons-material/Terminal'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import { useTheme } from '@mui/material/styles'
import type { ActiveView } from './types'
import { useFilters } from './state/filters'
import { useThemeMode } from './state/themeMode'
import { useKeyboardShortcuts, type KeyboardShortcut } from './hooks/useKeyboardShortcuts'
import { KeyboardShortcutsDialog, type ShortcutEntry } from './components/shared/KeyboardShortcutsDialog'
import { RangePicker } from './components/shared/RangePicker'
import { SavedViewsMenu } from './components/shared/SavedViewsMenu'
import { SeriesSearch } from './components/shared/SeriesSearch'
import { LoadingState } from './components/shared/LoadingState'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { useHealth } from './hooks/useFredQueries'
import { palette } from './theme'

const YieldCurve3D = lazy(() => import('./components/YieldCurve3D').then((m) => ({ default: m.YieldCurve3D })))
const FedFuturesProxyPanel = lazy(() => import('./components/FedFuturesProxyPanel').then((m) => ({ default: m.FedFuturesProxyPanel })))
const MacroPanel = lazy(() => import('./components/MacroPanel').then((m) => ({ default: m.MacroPanel })))
const CpiBreakdown = lazy(() => import('./components/CpiBreakdown').then((m) => ({ default: m.CpiBreakdown })))
const SpreadPanel = lazy(() => import('./components/SpreadPanel').then((m) => ({ default: m.SpreadPanel })))
const GroceryPanel = lazy(() => import('./components/GroceryPanel').then((m) => ({ default: m.GroceryPanel })))
const LaborPanel = lazy(() => import('./components/LaborPanel').then((m) => ({ default: m.LaborPanel })))
const HousingPanel = lazy(() => import('./components/HousingPanel').then((m) => ({ default: m.HousingPanel })))
const RecessionSignalsPanel = lazy(() => import('./components/RecessionSignalsPanel').then((m) => ({ default: m.RecessionSignalsPanel })))
const InflationPanel = lazy(() => import('./components/InflationPanel').then((m) => ({ default: m.InflationPanel })))
const CreditConditionsPanel = lazy(() => import('./components/CreditConditionsPanel').then((m) => ({ default: m.CreditConditionsPanel })))
const ActivityPanel = lazy(() => import('./components/ActivityPanel').then((m) => ({ default: m.ActivityPanel })))
const MarketsPanel = lazy(() => import('./components/MarketsPanel').then((m) => ({ default: m.MarketsPanel })))
const ConsumerPanel = lazy(() => import('./components/ConsumerPanel').then((m) => ({ default: m.ConsumerPanel })))
const HeatmapPanel = lazy(() => import('./components/HeatmapPanel').then((m) => ({ default: m.HeatmapPanel })))
const ComparePanel = lazy(() => import('./components/ComparePanel').then((m) => ({ default: m.ComparePanel })))
const CorrelationPanel = lazy(() => import('./components/CorrelationPanel').then((m) => ({ default: m.CorrelationPanel })))
const CalendarPanel = lazy(() => import('./components/CalendarPanel').then((m) => ({ default: m.CalendarPanel })))
const CrisisComparePanel = lazy(() => import('./components/CrisisComparePanel').then((m) => ({ default: m.CrisisComparePanel })))
const CustomDashboardPanel = lazy(() => import('./components/CustomDashboardPanel').then((m) => ({ default: m.CustomDashboardPanel })))

import { CommandBar } from './components/shared/CommandBar'

interface NavItem {
  value: ActiveView
  label: string
  icon: ReactElement
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { value: 'macro', label: 'Macro Dashboard', icon: <DashboardIcon fontSize="small" /> },
      { value: 'recession', label: 'Recession Signals', icon: <WarningAmberIcon fontSize="small" /> },
    ],
  },
  {
    id: 'rates',
    label: 'Rates & Yields',
    items: [
      { value: 'yield-curve', label: 'Yield Curve', icon: <TimelineIcon fontSize="small" /> },
      { value: 'fed-futures-proxy', label: 'Fed Futures Proxy', icon: <QueryStatsIcon fontSize="small" /> },
      { value: 'spreads', label: 'Spreads', icon: <ShowChartIcon fontSize="small" /> },
      { value: 'credit', label: 'Credit Conditions', icon: <AccountBalanceIcon fontSize="small" /> },
    ],
  },
  {
    id: 'prices',
    label: 'Prices & Inflation',
    items: [
      { value: 'inflation', label: 'Inflation', icon: <TrendingUpIcon fontSize="small" /> },
      { value: 'cpi', label: 'CPI Breakdown', icon: <PaidIcon fontSize="small" /> },
      { value: 'grocery', label: 'Grocery Prices', icon: <LocalGroceryStoreIcon fontSize="small" /> },
    ],
  },
  {
    id: 'activity',
    label: 'Activity & Markets',
    items: [
      { value: 'activity', label: 'Industrial Activity', icon: <FactoryIcon fontSize="small" /> },
      { value: 'markets', label: 'Markets', icon: <CandlestickChartIcon fontSize="small" /> },
      { value: 'consumer', label: 'Consumer', icon: <ShoppingCartIcon fontSize="small" /> },
    ],
  },
  {
    id: 'sectors',
    label: 'Labor & Housing',
    items: [
      { value: 'labor', label: 'Labor', icon: <WorkIcon fontSize="small" /> },
      { value: 'housing', label: 'Housing', icon: <HomeWorkIcon fontSize="small" /> },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { value: 'heatmap', label: 'Macro Heatmap', icon: <GridViewIcon fontSize="small" /> },
      { value: 'compare', label: 'Series Compare', icon: <CompareArrowsIcon fontSize="small" /> },
      { value: 'correlation', label: 'Correlation Matrix', icon: <GridOnIcon fontSize="small" /> },
      { value: 'calendar', label: 'Economic Calendar', icon: <EventNoteIcon fontSize="small" /> },
      { value: 'crisis', label: 'Crisis Comparison', icon: <HistoryIcon fontSize="small" /> },
      { value: 'custom', label: 'Custom Dashboards', icon: <BuildIcon fontSize="small" /> },
    ],
  },
]

const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)
const SIDEBAR_WIDTH = 248

export default function App() {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('md'))
  const { filters, setView, setRange } = useFilters()
  const { toggleMode } = useThemeMode()
  const health = useHealth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  const showRangePicker = true
  const currentItem = ALL_NAV_ITEMS.find((i) => i.value === filters.view)
  const currentGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.value === filters.view))

  const handleNavigate = (view: ActiveView) => {
    setView(view)
    if (isCompact) setMobileOpen(false)
  }

  // Build keyboard shortcuts: Alt+1..9 jump to first 9 dashboards; common power-user combos
  const shortcuts = useMemo<KeyboardShortcut[]>(() => {
    const list: KeyboardShortcut[] = ALL_NAV_ITEMS.slice(0, 9).map((item, idx) => ({
      combo: `Alt+${idx + 1}`,
      description: `Open ${item.label}`,
      handler: () => setView(item.value),
    }))
    list.push(
      { combo: 'Mod+K', description: 'Search indicators', handler: () => setSearchOpen(true), allowInInputs: true },
      { combo: 'Mod+T', description: 'Open Terminal Command Bar', handler: () => setCommandOpen(true), allowInInputs: true },
      { combo: '/', description: 'Search indicators', handler: () => setSearchOpen(true) },
      { combo: 'Mod+J', description: 'Toggle theme', handler: () => toggleMode() },
      { combo: '?', description: 'Show keyboard shortcuts', handler: () => setShortcutsOpen(true) },
      { combo: 'Escape', description: 'Close dialogs', handler: () => { setSearchOpen(false); setShortcutsOpen(false) }, allowInInputs: true },
    )
    return list
  }, [setView, toggleMode])

  useKeyboardShortcuts(shortcuts)

  const shortcutEntries = useMemo<ShortcutEntry[]>(() => {
    const navEntries: ShortcutEntry[] = ALL_NAV_ITEMS.slice(0, 9).map((item, idx) => ({
      combo: `Alt+${idx + 1}`,
      description: item.label,
      group: 'Navigation',
    }))
    return [
      ...navEntries,
      { combo: 'Mod+K', description: 'Search indicators', group: 'General' },
      { combo: 'Mod+T', description: 'Open command bar (slash commands)', group: 'General' },
      { combo: '/', description: 'Search indicators', group: 'General' },
      { combo: 'Mod+J', description: 'Toggle dark/light theme', group: 'General' },
      { combo: '?', description: 'Show this help', group: 'General' },
    ]
  }, [])

  const sidebar = <SidebarContent currentView={filters.view} onNavigate={handleNavigate} />

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isCompact ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, bgcolor: 'background.paper', borderRight: `1px solid ${palette.border}` } }}
        >
          {sidebar}
        </Drawer>
      ) : (
        <Box
          component="nav"
          sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, borderRight: `1px solid ${palette.border}`, bgcolor: 'background.paper', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}
        >
          {sidebar}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: `1px solid ${palette.border}` }}>
          <Toolbar disableGutters sx={{ px: { xs: 2, md: 3 }, minHeight: 56, gap: 2 }}>
            {isCompact && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Stack sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', lineHeight: 1.2 }}>
                {currentGroup?.label ?? 'Dashboard'}
              </Typography>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 600, fontSize: 17, lineHeight: 1.3, color: 'text.primary' }}>
                {currentItem?.label ?? 'Orator'}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {showRangePicker && <RangePicker value={filters.range} onChange={setRange} />}
              <SeriesSearch open={searchOpen} onOpenChange={setSearchOpen} />
              <SavedViewsMenu />
              <Tooltip title="Command bar (Ctrl+T)" arrow>
                <IconButton size="small" onClick={() => setCommandOpen(true)} aria-label="Open command bar" sx={{ color: 'text.secondary' }}>
                  <TerminalIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Keyboard shortcuts (?)" arrow>
                <IconButton size="small" onClick={() => setShortcutsOpen(true)} aria-label="Show keyboard shortcuts" sx={{ color: 'text.secondary' }}>
                  <KeyboardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <ThemeToggle />
              <ApiStatus
                healthy={health.data?.status === 'ok' && Boolean(health.data?.fred_key)}
                loading={health.isLoading}
                error={health.isError}
              />
            </Stack>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 }, maxWidth: '100%' }}>
          <ErrorBoundary>
            <Suspense fallback={<LoadingState message="Preparing view…" height={400} />}>
              {filters.view === 'yield-curve' && <YieldCurve3D />}
              {filters.view === 'fed-futures-proxy' && <FedFuturesProxyPanel />}
              {filters.view === 'macro' && <MacroPanel />}
              {filters.view === 'cpi' && <CpiBreakdown />}
              {filters.view === 'spreads' && <SpreadPanel />}
              {filters.view === 'grocery' && <GroceryPanel />}
              {filters.view === 'inflation' && <InflationPanel />}
              {filters.view === 'credit' && <CreditConditionsPanel />}
              {filters.view === 'activity' && <ActivityPanel />}
              {filters.view === 'markets' && <MarketsPanel />}
              {filters.view === 'consumer' && <ConsumerPanel />}
              {filters.view === 'labor' && <LaborPanel />}
              {filters.view === 'housing' && <HousingPanel />}
              {filters.view === 'recession' && <RecessionSignalsPanel />}
              {filters.view === 'heatmap' && <HeatmapPanel />}
              {filters.view === 'compare' && <ComparePanel />}
              {filters.view === 'correlation' && <CorrelationPanel />}
              {filters.view === 'calendar' && <CalendarPanel />}
              {filters.view === 'crisis' && <CrisisComparePanel />}
              {filters.view === 'custom' && <CustomDashboardPanel />}
            </Suspense>
          </ErrorBoundary>
        </Box>

        <Box component="footer" sx={{ px: { xs: 2, md: 3 }, py: 1.25, borderTop: `1px solid ${palette.border}`, color: 'text.disabled', fontSize: 11, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <span>Data: Federal Reserve Bank of St. Louis (FRED) · BLS</span>
          <span>
            <Link href="https://bpachter.github.io" color="inherit" underline="hover">← Portfolio</Link>
          </span>
        </Box>
      </Box>

      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        shortcuts={shortcutEntries}
      />
      <CommandBar open={commandOpen} onClose={() => setCommandOpen(false)} />
    </Box>
  )
}

function SidebarContent({ currentView, onNavigate }: { currentView: ActiveView; onNavigate: (v: ActiveView) => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.25, minHeight: 56 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="orator-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
          </defs>
          <circle cx="14" cy="14" r="13" fill="url(#orator-grad)" />
          <circle cx="14" cy="14" r="11" fill="white" opacity="0.12" />
          <polyline points="6,17 10,13 14,15 18,9 22,11" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14" cy="15" r="0.9" fill="white" opacity="0.8" />
        </svg>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 3, fontSize: 15 }}>
          ORATOR
        </Typography>
      </Box>
      <Divider sx={{ borderColor: palette.border }} />

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {NAV_GROUPS.map((group) => {
          const isCollapsed = !!collapsed[group.id]
          return (
            <Box key={group.id} sx={{ mb: 0.5 }}>
              <ListItemButton onClick={() => toggle(group.id)} disableRipple sx={{ px: 2.5, py: 0.5, '&:hover': { bgcolor: 'transparent' } }}>
                <ListItemText
                  primary={group.label}
                  primaryTypographyProps={{ variant: 'caption', sx: { color: 'text.disabled', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 } }}
                />
                {isCollapsed ? <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.disabled' }} /> : <ExpandLessIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
              </ListItemButton>
              <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {group.items.map((item) => {
                    const active = item.value === currentView
                    return (
                      <ListItemButton
                        key={item.value}
                        selected={active}
                        onClick={() => onNavigate(item.value)}
                        sx={{ mx: 1, my: 0.25, borderRadius: 1, px: 1.5, py: 0.75, '&.Mui-selected': { bgcolor: 'action.selected', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } } }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 600 : 400 }} />
                      </ListItemButton>
                    )
                  })}
                </List>
              </Collapse>
            </Box>
          )
        })}
      </Box>

      <Divider sx={{ borderColor: palette.border }} />
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
          {ALL_NAV_ITEMS.length} dashboards · FRED + BLS
        </Typography>
      </Box>
    </Box>
  )
}

function ApiStatus({ healthy, loading, error }: { healthy: boolean; loading: boolean; error: boolean }) {
  const color = loading ? palette.textMuted : error || !healthy ? palette.negative : palette.positive
  const label = loading ? 'Checking…' : error ? 'API offline' : healthy ? 'API live' : 'Degraded'
  return (
    <Tooltip title={`Backend status: ${label}`} arrow>
      <Chip
        size="small"
        variant="outlined"
        icon={<CircleIcon sx={{ fontSize: 10, color: `${color} !important` }} />}
        label={label}
        sx={{ borderColor: 'divider', color: 'text.secondary', fontSize: 11, height: 24 }}
      />
    </Tooltip>
  )
}

function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode()
  const isDark = mode === 'dark'
  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`} arrow>
      <IconButton size="small" onClick={toggleMode} aria-label="Toggle color mode" sx={{ color: 'text.secondary' }}>
        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  )
}
