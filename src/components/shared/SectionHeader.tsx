import { ReactNode } from 'react'
import { Stack, Typography } from '@mui/material'
import { FreshnessBadge } from './FreshnessBadge'

interface SectionHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  /** ISO timestamp string used to render a freshness badge alongside the action area. */
  updated?: string | null
}

export function SectionHeader({ eyebrow, title, subtitle, action, updated }: SectionHeaderProps) {
  const hasTrailing = Boolean(action) || Boolean(updated)
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 1 }}
    >
      <Stack spacing={0.5}>
        {eyebrow && (
          <Typography variant="subtitle2" component="div">
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h3" component="h2">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" component="div">
            {subtitle}
          </Typography>
        )}
      </Stack>
      {hasTrailing && (
        <Stack direction="row" alignItems="center" spacing={1}>
          {updated && <FreshnessBadge updated={updated} />}
          {action}
        </Stack>
      )}
    </Stack>
  )
}
