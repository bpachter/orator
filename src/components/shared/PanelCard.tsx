import { ReactNode } from 'react'
import { Box, Paper, Stack, Typography } from '@mui/material'

interface PanelCardProps {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  dense?: boolean
  children: ReactNode
  fullHeight?: boolean
  padding?: number | string
}

/**
 * Standard surface for every dashboard panel.
 * Provides a header (title/subtitle/action) and a flex body region.
 */
export function PanelCard({
  title,
  subtitle,
  action,
  dense = false,
  children,
  fullHeight = false,
  padding,
}: PanelCardProps) {
  const pad = padding ?? (dense ? 2 : 2.5)
  return (
    <Paper
      sx={{
        p: pad,
        display: 'flex',
        flexDirection: 'column',
        height: fullHeight ? '100%' : 'auto',
        gap: dense ? 1 : 1.5,
      }}
    >
      {(title || action) && (
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography variant={dense ? 'subtitle2' : 'h5'} component="div">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" component="div" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>
      )}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Paper>
  )
}
