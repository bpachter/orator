import { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { monoFont, palette } from '../../theme'

interface KpiChipProps {
  label: ReactNode
  value: ReactNode
  unit?: string
  trend?: 'up' | 'down' | 'flat' | null
  valueColor?: string
  size?: 'sm' | 'md' | 'lg'
  caption?: ReactNode
  align?: 'left' | 'right' | 'center'
}

const SIZE = {
  sm: { value: 14, label: 10 },
  md: { value: 18, label: 11 },
  lg: { value: 28, label: 12 },
} as const

export function KpiChip({
  label,
  value,
  unit,
  trend,
  valueColor,
  size = 'md',
  caption,
  align = 'left',
}: KpiChipProps) {
  const sz = SIZE[size]
  const color = valueColor ?? palette.textPrimary

  const trendIcon =
    trend === 'up' ? (
      <ArrowDropUpIcon fontSize="small" sx={{ color: palette.positive }} />
    ) : trend === 'down' ? (
      <ArrowDropDownIcon fontSize="small" sx={{ color: palette.negative }} />
    ) : null

  return (
    <Stack spacing={0.25} alignItems={align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start'}>
      <Typography variant="subtitle2" component="div" sx={{ fontSize: sz.label }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.25}>
        {trendIcon}
        <Box
          component="span"
          sx={{
            fontFamily: monoFont,
            fontWeight: 600,
            fontSize: sz.value,
            color,
            lineHeight: 1.1,
          }}
        >
          {value}
          {unit && (
            <Box component="span" sx={{ ml: 0.25, fontSize: sz.value * 0.7, color: palette.textMuted }}>
              {unit}
            </Box>
          )}
        </Box>
      </Stack>
      {caption && (
        <Typography variant="caption" component="div">
          {caption}
        </Typography>
      )}
    </Stack>
  )
}
