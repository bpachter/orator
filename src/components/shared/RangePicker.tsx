import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import type { TimeRange } from '../../types'

interface RangePickerProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  options?: TimeRange[]
  size?: 'small' | 'medium'
}

const ALL_RANGES: TimeRange[] = ['1Y', '2Y', '5Y', '10Y', 'MAX']

const HELP: Record<TimeRange, string> = {
  '1Y': 'Past 1 year',
  '2Y': 'Past 2 years',
  '5Y': 'Past 5 years',
  '10Y': 'Past 10 years',
  MAX: 'Maximum available history',
}

export function RangePicker({
  value,
  onChange,
  options = ALL_RANGES,
  size = 'small',
}: RangePickerProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size={size}
      aria-label="Time range"
      onChange={(_, next: TimeRange | null) => {
        if (next) onChange(next)
      }}
    >
      {options.map((r) => (
        <Tooltip key={r} title={HELP[r]} arrow>
          <ToggleButton value={r} aria-label={HELP[r]} sx={{ px: 1.5, py: 0.4 }}>
            {r}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  )
}
