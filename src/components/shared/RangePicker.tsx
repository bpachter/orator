import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import type { TimeRange } from '../../types'

interface RangePickerProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  options?: TimeRange[]
  size?: 'small' | 'medium'
}

const ALL_RANGES: TimeRange[] = ['6M', '1Y', '3Y', '5Y', '10Y', '20Y', '30Y', 'MAX']

const HELP: Record<TimeRange, string> = {
  '6M': 'Past 6 months',
  '1Y': 'Past 1 year',
  '3Y': 'Past 3 years',
  '5Y': 'Past 5 years',
  '10Y': 'Past 10 years',
  '20Y': 'Past 20 years',
  '30Y': 'Past 30 years',
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
          <ToggleButton
            value={r}
            aria-label={HELP[r]}
            sx={{
              px: 1.5,
              py: { xs: 0.75, sm: 0.4 },
              // Minimum 36px height on touch devices for comfortable tapping
              minHeight: { xs: 36, sm: 'auto' },
              touchAction: 'manipulation',
            }}
          >
            {r}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  )
}
