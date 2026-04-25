import { useState, useMemo } from 'react'
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import { useFilters } from '../../state/filters'
import type { ActiveView } from '../../types'

// All available series with metadata
const SERIES_INDEX: Array<{
  id: string
  name: string
  view: ActiveView
  keywords: string[]
}> = [
  // Macro
  { id: 'DFF', name: 'Federal Funds Rate', view: 'macro', keywords: ['fed', 'rates', 'interest', 'monetary'] },
  { id: 'MORTGAGE30US', name: '30-Year Mortgage Rate', view: 'macro', keywords: ['mortgage', 'rates', 'housing'] },
  { id: 'T10Y2Y', name: '10Y-2Y Spread', view: 'macro', keywords: ['spread', 'yield', 'recession signal'] },
  { id: 'UNRATE', name: 'Unemployment Rate', view: 'macro', keywords: ['employment', 'labor', 'jobless'] },
  { id: 'PAYEMS', name: 'Nonfarm Payrolls', view: 'macro', keywords: ['employment', 'jobs', 'labor', 'payroll'] },
  { id: 'INDPRO', name: 'Industrial Production', view: 'macro', keywords: ['output', 'production', 'manufacturing'] },
  // Yield Curve
  { id: 'DGS2', name: '2-Year Yield', view: 'yield-curve', keywords: ['treasury', 'yield', 'rates'] },
  { id: 'DGS10', name: '10-Year Yield', view: 'yield-curve', keywords: ['treasury', 'yield', 'rates'] },
  // CPI
  { id: 'CPIAUCSL', name: 'CPI (All Items)', view: 'cpi', keywords: ['inflation', 'prices'] },
  { id: 'CPILFESL', name: 'CPI (Core)', view: 'cpi', keywords: ['inflation', 'prices', 'ex-food'] },
  { id: 'GASREGCOVW', name: 'Gas Price', view: 'cpi', keywords: ['energy', 'prices'] },
  // Spreads
  { id: 'T10Y3M', name: '10Y-3M Spread', view: 'spreads', keywords: ['yield curve', 'inversion', 'recession'] },
  // Grocery
  { id: 'APU0000708111', name: 'Milk Price', view: 'grocery', keywords: ['food', 'dairy'] },
  { id: 'APU0000717311', name: 'Bread Price', view: 'grocery', keywords: ['food', 'grain'] },
  // Labor
  { id: 'ICSA', name: 'Initial Jobless Claims', view: 'labor', keywords: ['unemployment', 'claims'] },
  { id: 'AWHNONAG', name: 'Avg Weekly Hours', view: 'labor', keywords: ['employment', 'hours worked'] },
  // Housing
  { id: 'MORTGAGE30US', name: 'Mortgage Rate', view: 'housing', keywords: ['rates', 'real estate'] },
  { id: 'HOUST', name: 'Housing Starts', view: 'housing', keywords: ['construction', 'residential'] },
  // Recession Signals
  { id: 'RECPROUSM156N', name: 'Recession Probability', view: 'recession', keywords: ['forecast', 'probability'] },
  // Inflation
  { id: 'CPIAUCSL', name: 'CPI', view: 'inflation', keywords: ['prices', 'inflation'] },
  { id: 'DCOILWTICO', name: 'Oil Price', view: 'inflation', keywords: ['energy', 'commodities'] },
  // Credit
  { id: 'MMNRNJ', name: 'High Yield Spread', view: 'credit', keywords: ['spreads', 'risk'] },
  // Activity
  { id: 'INDPRO', name: 'Industrial Production', view: 'activity', keywords: ['output', 'manufacturing'] },
  { id: 'NEWORDER', name: 'Factory Orders', view: 'activity', keywords: ['orders', 'manufacturing'] },
  // Markets
  { id: 'SP500', name: 'S&P 500', view: 'markets', keywords: ['equity', 'stocks', 'index'] },
  { id: 'VIXCLS', name: 'VIX (Volatility)', view: 'markets', keywords: ['volatility', 'fear'] },
  { id: 'DCOILWTICO', name: 'Oil', view: 'markets', keywords: ['commodities', 'energy'] },
  // Consumer
  { id: 'RSXFS', name: 'Retail Sales', view: 'consumer', keywords: ['spending', 'consumption'] },
  { id: 'UMCSENT', name: 'Consumer Sentiment', view: 'consumer', keywords: ['confidence', 'households'] },
]

export function SeriesSearch({ open: controlledOpen, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) {
  const { filters, setFilters } = useFilters()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next)
    if (controlledOpen === undefined) setInternalOpen(next)
  }
  const [query, setQuery] = useState('')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const results = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return SERIES_INDEX.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.id.toLowerCase().includes(lower) ||
        s.keywords.some((k) => k.includes(lower)),
    ).slice(0, 12)
  }, [query])

  const handleSelect = (view: ActiveView) => {
    setFilters({ ...filters, view })
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        size="small"
        sx={{ ml: 1 }}
        title="Search series"
      >
        <SearchIcon fontSize="small" />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Search Indicators</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              placeholder="Search by name, ID, or keyword…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              // inputProps fontSize=16 prevents iOS from auto-zooming the viewport on focus
              inputProps={{ style: { fontSize: 16 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
            />

            {query.trim() && (
              <Box>
                {results.length > 0 ? (
                  <List sx={{ pt: 0 }}>
                    {results.map((s) => (
                      <ListItemButton
                        key={s.id}
                        onClick={() => handleSelect(s.view)}
                        dense
                      >
                        <ListItemText
                          primary={s.name}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                              <Chip label={s.view} size="small" variant="outlined" />
                              <Chip label={s.id} size="small" />
                            </Box>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    No indicators found
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}
