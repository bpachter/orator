import { Chip, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'

interface FreshnessBadgeProps {
  updated?: string | null
  /** Threshold in hours after which the data is considered stale (default 6) */
  staleAfterHours?: number
}

function parseUpdated(updated: string | null | undefined): Date | null {
  if (!updated) return null
  const d = new Date(updated)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function formatRelative(diffMs: number): string {
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function FreshnessBadge({ updated, staleAfterHours = 6 }: FreshnessBadgeProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const ts = parseUpdated(updated)
  if (!ts) return null

  const diffMs = Date.now() - ts.getTime()
  const stale = diffMs > staleAfterHours * 60 * 60 * 1000
  const label = stale ? `Stale · ${formatRelative(diffMs)}` : `Fresh · ${formatRelative(diffMs)}`
  const color: 'success' | 'warning' = stale ? 'warning' : 'success'

  return (
    <Tooltip title={`Source last updated ${ts.toLocaleString()}`}>
      <Chip
        size="small"
        variant="outlined"
        color={color}
        label={label}
        sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, height: 22 }}
      />
    </Tooltip>
  )
}
