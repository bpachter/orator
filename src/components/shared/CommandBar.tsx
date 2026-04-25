import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  InputAdornment,
  List,
  ListItemButton,
  Stack,
  TextField,
  Typography,
  Chip,
  Divider,
} from '@mui/material'
import TerminalIcon from '@mui/icons-material/Terminal'
import { useFilters } from '../../state/filters'
import { useThemeMode } from '../../state/themeMode'
import { useCompareList } from '../../state/compareList'
import { INDICATOR_REGISTRY } from '../../utils/seriesRegistry'
import type { ActiveView } from '../../types'

export interface CommandBarProps {
  open: boolean
  onClose: () => void
}

interface CommandResult {
  type: 'view' | 'series' | 'command' | 'theme' | 'compare'
  label: string
  description?: string
  hint?: string
  action: () => void
  /** Search relevance score (computed on the fly) */
  score: number
}

const VIEW_LABELS: Record<ActiveView, string> = {
  'yield-curve': 'Yield Curve 3D',
  'fed-futures-proxy': 'Fed Futures Proxy',
  macro: 'Macro Dashboard',
  cpi: 'CPI Breakdown',
  spreads: 'Spreads',
  grocery: 'Grocery Prices',
  labor: 'Labor',
  housing: 'Housing',
  recession: 'Recession Signals',
  inflation: 'Inflation',
  credit: 'Credit Conditions',
  activity: 'Industrial Activity',
  markets: 'Markets',
  consumer: 'Consumer',
  heatmap: 'Macro Heatmap',
  compare: 'Series Comparison',
  correlation: 'Correlation Matrix',
  calendar: 'Economic Calendar',
  crisis: 'Crisis Comparison',
  custom: 'Custom Dashboards',
}

/**
 * Bloomberg-style Command Bar (Ctrl+T) — fuzzy search across views,
 * indicators, and slash-commands. Power users can:
 *
 *   "/heatmap"          → open heatmap view
 *   "cpi"               → jump to CPI panel
 *   "/compare cpi unrate" → add both to compare list and open Compare view
 *   "/theme"            → toggle dark/light
 */
export function CommandBar({ open, onClose }: CommandBarProps) {
  const { setView } = useFilters()
  const { toggleMode } = useThemeMode()
  const compare = useCompareList()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = useMemo<CommandResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // Empty: show recommended quick actions
      return defaultResults({ setView, toggleMode })
    }

    // Slash command parsing
    if (q.startsWith('/')) {
      return parseSlashCommand(q, { setView, toggleMode, compare })
    }

    const out: CommandResult[] = []
    // View matches
    for (const [view, label] of Object.entries(VIEW_LABELS) as [ActiveView, string][]) {
      const score = matchScore(`${view} ${label}`.toLowerCase(), q)
      if (score > 0) {
        out.push({
          type: 'view',
          label,
          description: `Open ${label}`,
          hint: 'View',
          action: () => setView(view),
          score: score * 0.8,
        })
      }
    }
    // Series matches
    for (const ind of INDICATOR_REGISTRY) {
      const haystack = `${ind.id} ${ind.label} ${ind.short} ${ind.section} ${ind.keywords.join(' ')}`.toLowerCase()
      const score = matchScore(haystack, q)
      if (score > 0) {
        out.push({
          type: 'series',
          label: ind.label,
          description: `${ind.id} · ${ind.section} · ${ind.category}`,
          hint: ind.short,
          action: () => setView(ind.view),
          score,
        })
      }
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 12)
  }, [query, setView, toggleMode, compare])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      results[activeIdx]?.action()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Stack>
          <TextField
            inputRef={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIdx(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Type a series, view, or /command…"
            fullWidth
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TerminalIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: { fontSize: 16, py: 1.5, px: 1, border: 'none' },
              disableUnderline: true,
            }}
            variant="standard"
            sx={{ p: 1.5 }}
          />
          <Divider />
          <List dense disablePadding sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {results.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  No results. Try /heatmap, /compare, /theme, /calendar, /correlation
                </Typography>
              </Box>
            )}
            {results.map((r, idx) => (
              <ListItemButton
                key={`${r.type}-${r.label}-${idx}`}
                selected={idx === activeIdx}
                onClick={() => {
                  r.action()
                  onClose()
                }}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                  <Chip
                    label={r.type}
                    size="small"
                    sx={{ fontSize: 9, height: 18, textTransform: 'uppercase' }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {r.label}
                    </Typography>
                    {r.description && (
                      <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
                        {r.description}
                      </Typography>
                    )}
                  </Box>
                  {r.hint && (
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>
                      {r.hint}
                    </Typography>
                  )}
                </Stack>
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ px: 2, py: 1, display: 'flex', gap: 2, color: 'text.disabled', fontSize: 11 }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Close</span>
            <span style={{ marginLeft: 'auto' }}>Try: /heatmap · /compare · /calendar</span>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- helpers ------------------------------------------------ */

function matchScore(haystack: string, needle: string): number {
  if (!needle) return 0
  if (haystack.includes(needle)) return 100 - haystack.indexOf(needle)
  // Simple fuzzy: each char must appear in order
  let i = 0
  for (const ch of haystack) {
    if (ch === needle[i]) i++
    if (i === needle.length) return 30
  }
  return 0
}

function defaultResults({
  setView,
  toggleMode,
}: {
  setView: (v: ActiveView) => void
  toggleMode: () => void
}): CommandResult[] {
  return [
    { type: 'command', label: '/heatmap', description: 'Open Macro Heatmap', action: () => setView('heatmap'), score: 1, hint: '⚡' },
    { type: 'command', label: '/compare', description: 'Open Series Comparison', action: () => setView('compare'), score: 1, hint: '⚡' },
    { type: 'command', label: '/correlation', description: 'Open Correlation Matrix', action: () => setView('correlation'), score: 1, hint: '⚡' },
    { type: 'command', label: '/calendar', description: 'Open Economic Calendar', action: () => setView('calendar'), score: 1, hint: '⚡' },
    { type: 'command', label: '/crisis', description: 'Open Crisis Comparison', action: () => setView('crisis'), score: 1, hint: '⚡' },
    { type: 'command', label: '/custom', description: 'Open Custom Dashboards', action: () => setView('custom'), score: 1, hint: '⚡' },
    { type: 'theme', label: '/theme', description: 'Toggle dark/light mode', action: () => toggleMode(), score: 1, hint: '⚡' },
  ]
}

function parseSlashCommand(
  q: string,
  ctx: {
    setView: (v: ActiveView) => void
    toggleMode: () => void
    compare: ReturnType<typeof useCompareList>
  },
): CommandResult[] {
  const tokens = q.slice(1).split(/\s+/).filter(Boolean)
  const cmd = tokens[0] ?? ''
  const args = tokens.slice(1)

  // Direct view commands
  const viewMap: Record<string, ActiveView> = {
    heatmap: 'heatmap',
    compare: 'compare',
    correlation: 'correlation',
    calendar: 'calendar',
    crisis: 'crisis',
    custom: 'custom',
    macro: 'macro',
    yield: 'yield-curve',
    cpi: 'cpi',
    inflation: 'inflation',
    labor: 'labor',
    housing: 'housing',
    activity: 'activity',
    markets: 'markets',
    consumer: 'consumer',
    credit: 'credit',
    recession: 'recession',
    spreads: 'spreads',
    grocery: 'grocery',
  }

  if (cmd === 'theme') {
    return [{ type: 'theme', label: '/theme', description: 'Toggle dark/light', action: () => ctx.toggleMode(), score: 1, hint: '⚡' }]
  }

  if (cmd === 'compare') {
    // Add args to compare list and open
    return [
      {
        type: 'compare',
        label: `/compare ${args.join(' ')}`,
        description: `Add ${args.length} indicator(s) and open compare view`,
        action: () => {
          for (const a of args) {
            const ind = INDICATOR_REGISTRY.find(
              (i) =>
                i.id.toLowerCase() === a.toLowerCase() ||
                i.short.toLowerCase().replace(/\s+/g, '') === a.toLowerCase(),
            )
            if (ind) ctx.compare.add(ind.id)
          }
          ctx.setView('compare')
        },
        score: 1,
        hint: 'cmd',
      },
    ]
  }

  const view = viewMap[cmd]
  if (view) {
    return [
      {
        type: 'command',
        label: `/${cmd}`,
        description: `Open ${VIEW_LABELS[view]}`,
        action: () => ctx.setView(view),
        score: 1,
        hint: 'cmd',
      },
    ]
  }

  // Fall back: search commands matching prefix
  return Object.keys(viewMap)
    .filter((k) => k.startsWith(cmd))
    .map((k) => ({
      type: 'command' as const,
      label: `/${k}`,
      description: `Open ${VIEW_LABELS[viewMap[k]]}`,
      action: () => ctx.setView(viewMap[k]),
      score: 1,
      hint: 'cmd',
    }))
}
