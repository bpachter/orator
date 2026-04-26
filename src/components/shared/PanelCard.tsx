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
  // When no explicit padding is provided, use responsive defaults:
  // 12px (1.5 × 8) on mobile → 16/20px on desktop for space efficiency.
  const pad = padding ?? (dense ? { xs: 1.5, sm: 2 } : { xs: 1.5, sm: 2.5 })
  return (
    <Paper
      sx={(muiTheme) => ({
        p: pad,
        display: 'flex',
        flexDirection: 'column',
        height: fullHeight ? '100%' : 'auto',
        gap: dense ? 1 : { xs: 1, sm: 1.5 },
        // Glassmorphism: see the ambient background through the panel
        backgroundColor:
          muiTheme.palette.mode === 'dark'
            ? 'rgba(13,21,37,0.80)'
            : 'rgba(255,255,255,0.84)',
        backgroundImage:
          muiTheme.palette.mode === 'dark'
            ? 'linear-gradient(155deg, rgba(22,34,56,0.88) 0%, rgba(11,19,33,0.95) 100%)'
            : 'linear-gradient(155deg, rgba(255,255,255,0.93) 0%, rgba(243,246,250,0.87) 100%)',
        backdropFilter: 'blur(12px) saturate(125%)',
        WebkitBackdropFilter: 'blur(12px) saturate(125%)',
        transition: 'box-shadow 0.24s ease, border-color 0.24s ease',
        '&:hover': {
          boxShadow:
            muiTheme.palette.mode === 'dark'
              ? '0 8px 40px rgba(0,0,0,0.32), inset 0 1px 0 rgba(90,150,220,0.10)'
              : '0 6px 28px rgba(0,0,0,0.09), inset 0 1px 0 rgba(180,145,76,0.12)',
          borderColor:
            muiTheme.palette.mode === 'dark'
              ? 'rgba(56,88,138,0.80)'
              : 'rgba(182,196,218,0.90)',
        },
      })}
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
