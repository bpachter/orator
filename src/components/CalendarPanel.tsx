import { useMemo, useState } from 'react'
import {
  Box,
  Chip,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  alpha,
} from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import { useFilters } from '../state/filters'
import { useAllSeries } from '../hooks/useAllSeries'
import { SectionHeader } from './shared/SectionHeader'
import { PanelCard } from './shared/PanelCard'
import { LoadingState } from './shared/LoadingState'
import {
  generateAllEvents,
  RELEASE_CALENDAR,
  type CalendarEvent,
  type ReleaseImportance,
} from '../utils/economicCalendar'
import { useOratorPalette } from '../state/themeMode'
import { latest } from '../utils/series'

type Filter = 'all' | ReleaseImportance

/**
 * Economic Calendar panel — Bloomberg-style timeline of upcoming and recent
 * U.S. macro data releases. Each row shows the release date, agency, what
 * the data updates, and the most-recent observed value (where available).
 */
export function CalendarPanel() {
  const { filters } = useFilters()
  const all = useAllSeries(filters.range)
  const [filter, setFilter] = useState<Filter>('all')

  const events = useMemo<CalendarEvent[]>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const from = new Date(today)
    from.setMonth(from.getMonth() - 1)
    const to = new Date(today)
    to.setMonth(to.getMonth() + 3)
    return generateAllEvents(from, to).filter((e) =>
      filter === 'all' ? true : e.release.importance === filter,
    )
  }, [filter])

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = events.filter((e) => e.date >= today)
  const recent = events.filter((e) => e.date < today).slice(-12).reverse()

  if (all.isLoading) return <LoadingState message="Loading calendar…" height={500} />

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Bloomberg-style timeline"
        title="Economic Calendar"
        subtitle={`${RELEASE_CALENDAR.length} recurring U.S. data releases — past 1mo and next 3mo.`}
        updated={all.updated}
        action={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filter}
            onChange={(_, v: Filter | null) => v && setFilter(v)}
          >
            <ToggleButton value="all" sx={{ px: 1.5, py: 0.25 }}>
              All
            </ToggleButton>
            <ToggleButton value="high" sx={{ px: 1.5, py: 0.25 }}>
              High Impact
            </ToggleButton>
            <ToggleButton value="medium" sx={{ px: 1.5, py: 0.25 }}>
              Medium
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />

      <PanelCard dense title="Upcoming Releases" subtitle={`Next ${upcoming.length} scheduled events`}>
        <Stack spacing={0.5} sx={{ pt: 1 }} divider={<Divider flexItem />}>
          {upcoming.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.disabled', py: 2, textAlign: 'center' }}>
              No upcoming releases match the filter.
            </Typography>
          )}
          {upcoming.map((evt) => (
            <CalendarRow key={evt.id} event={evt} all={all} />
          ))}
        </Stack>
      </PanelCard>

      <PanelCard dense title="Recently Released" subtitle="Last 12 events with the most-recent observed value">
        <Stack spacing={0.5} sx={{ pt: 1 }} divider={<Divider flexItem />}>
          {recent.map((evt) => (
            <CalendarRow key={evt.id} event={evt} all={all} muted />
          ))}
        </Stack>
      </PanelCard>

      <PanelCard dense title="Importance Legend">
        <Stack direction="row" spacing={2} sx={{ pt: 1, flexWrap: 'wrap' }}>
          <ImportanceChip importance="high" />
          <ImportanceChip importance="medium" />
          <ImportanceChip importance="low" />
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Schedule estimates based on typical BLS / BEA / Federal Reserve release rules.
          </Typography>
        </Stack>
      </PanelCard>
    </Stack>
  )
}

function CalendarRow({
  event,
  all,
  muted = false,
}: {
  event: CalendarEvent
  all: ReturnType<typeof useAllSeries>
  muted?: boolean
}) {
  const palette = useOratorPalette()
  const indicator = event.release.indicatorId ? all.byId.get(event.release.indicatorId) : undefined
  const lastObs = indicator ? latest(indicator.data) : undefined

  const colorBy: Record<ReleaseImportance, string> = {
    high: palette.negative,
    medium: palette.warning,
    low: palette.textMuted,
  }
  const dotColor = colorBy[event.release.importance]
  const dateObj = new Date(event.date + 'T00:00:00')
  const dayOfWeek = dateObj.toLocaleDateString(undefined, { weekday: 'short' })
  const monthDay = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ py: 1, px: 1, opacity: muted ? 0.7 : 1 }}
    >
      <Box sx={{ minWidth: 80, textAlign: 'center', borderRight: `1px solid ${palette.border}`, pr: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', fontSize: 10 }}>
          {dayOfWeek}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {monthDay}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: dotColor,
          boxShadow: `0 0 8px ${alpha(dotColor, 0.6)}`,
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {event.release.name}
          </Typography>
          <Chip
            label={event.release.agency}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: 10 }}
          />
        </Stack>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
          {event.release.description}
        </Typography>
      </Box>
      {lastObs && (
        <Box sx={{ minWidth: 100, textAlign: 'right' }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 600,
              color: indicator?.meta.color,
            }}
          >
            {lastObs.value.toFixed(2)}
            {indicator?.meta.unit ? ` ${indicator.meta.unit}` : ''}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            <TrendingFlatIcon sx={{ fontSize: 10, verticalAlign: 'middle' }} /> {lastObs.date}
          </Typography>
        </Box>
      )}
      <EventIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
    </Stack>
  )
}

function ImportanceChip({ importance }: { importance: ReleaseImportance }) {
  const palette = useOratorPalette()
  const colorBy: Record<ReleaseImportance, string> = {
    high: palette.negative,
    medium: palette.warning,
    low: palette.textMuted,
  }
  const c = colorBy[importance]
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
        {importance} impact
      </Typography>
    </Stack>
  )
}
