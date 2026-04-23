/**
 * Economic Release Calendar — recurring U.S. macroeconomic data releases.
 *
 * For each release we define a typical day-of-month (or weekday rule) and
 * the indicator it relates to. Combined with FRED observation history this
 * lets us project upcoming releases without an external calendar API.
 *
 * Notes
 * -----
 * Bloomberg-style importance ratings: 'high' moves markets, 'medium' is
 * watched, 'low' is informational. Rules are approximations — exact timing
 * depends on BLS / BEA / Fed schedules.
 */
export type ReleaseImportance = 'high' | 'medium' | 'low'

export interface ReleaseDef {
  id: string
  name: string
  agency: string
  /** Indicator id from seriesRegistry that this release updates */
  indicatorId?: string
  importance: ReleaseImportance
  /** Frequency: M=monthly, Q=quarterly, W=weekly, P=Periodic (FOMC) */
  frequency: 'M' | 'Q' | 'W' | 'P'
  /**
   * Typical release rule. For monthly: { dayOfMonth?: number, weekdayOrdinal?: [n, weekday] }
   * For weekly: { weekday: number (0=Sun..6=Sat) }
   * For periodic: { dates: ISO date strings }
   */
  rule:
    | { kind: 'dayOfMonth'; day: number; offsetMonths?: number }
    | { kind: 'weekdayOrdinal'; ordinal: 1 | 2 | 3 | 4; weekday: number; offsetMonths?: number }
    | { kind: 'weekly'; weekday: number }
    | { kind: 'fixed'; dates: string[] }
  /** Releases the data for which period (e.g. previous month) */
  refPeriodLag?: string
  description: string
}

/**
 * Curated set of high-impact U.S. economic releases. Schedule rules are
 * approximations — actual release dates come from BLS / BEA / Fed.
 */
export const RELEASE_CALENDAR: ReleaseDef[] = [
  {
    id: 'nfp',
    name: 'Nonfarm Payrolls',
    agency: 'BLS',
    indicatorId: 'PAYEMS',
    importance: 'high',
    frequency: 'M',
    rule: { kind: 'weekdayOrdinal', ordinal: 1, weekday: 5 }, // 1st Friday
    refPeriodLag: 'Prior month',
    description: 'Employment Situation: payrolls, unemployment, wages.',
  },
  {
    id: 'cpi',
    name: 'Consumer Price Index (CPI)',
    agency: 'BLS',
    indicatorId: 'CPIAUCSL',
    importance: 'high',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 12 },
    refPeriodLag: 'Prior month',
    description: 'Headline + Core CPI inflation reading.',
  },
  {
    id: 'ppi',
    name: 'Producer Price Index (PPI)',
    agency: 'BLS',
    indicatorId: 'PPIACO',
    importance: 'medium',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 14 },
    refPeriodLag: 'Prior month',
    description: 'Wholesale price inflation.',
  },
  {
    id: 'pce',
    name: 'PCE Price Index',
    agency: 'BEA',
    indicatorId: 'PCEPI',
    importance: 'high',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 28 },
    refPeriodLag: 'Prior month',
    description: "Fed's preferred inflation gauge (Personal Income & Outlays).",
  },
  {
    id: 'retail',
    name: 'Retail Sales',
    agency: 'Census',
    indicatorId: 'RSXFS',
    importance: 'high',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 16 },
    refPeriodLag: 'Prior month',
    description: 'Monthly retail and food services sales.',
  },
  {
    id: 'gdp',
    name: 'Real GDP (Advance / 2nd / 3rd)',
    agency: 'BEA',
    indicatorId: 'A191RL1Q225SBEA',
    importance: 'high',
    frequency: 'Q',
    rule: { kind: 'dayOfMonth', day: 27 },
    refPeriodLag: 'Prior quarter',
    description: 'Quarterly Gross Domestic Product release.',
  },
  {
    id: 'jolts',
    name: 'JOLTS Job Openings',
    agency: 'BLS',
    indicatorId: 'JTSJOL',
    importance: 'medium',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 8 },
    refPeriodLag: '2 months back',
    description: 'Job Openings and Labor Turnover Survey.',
  },
  {
    id: 'umich',
    name: 'U. Michigan Consumer Sentiment',
    agency: 'U. Michigan',
    indicatorId: 'UMCSENT',
    importance: 'medium',
    frequency: 'M',
    rule: { kind: 'weekdayOrdinal', ordinal: 2, weekday: 5 }, // 2nd Friday (preliminary)
    refPeriodLag: 'Current month (prelim)',
    description: 'Consumer sentiment, expectations, inflation expectations.',
  },
  {
    id: 'indpro',
    name: 'Industrial Production',
    agency: 'Federal Reserve',
    indicatorId: 'INDPRO',
    importance: 'medium',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 17 },
    refPeriodLag: 'Prior month',
    description: 'Industrial output and capacity utilization.',
  },
  {
    id: 'durables',
    name: 'Durable Goods Orders',
    agency: 'Census',
    indicatorId: 'DGORDER',
    importance: 'medium',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 24 },
    refPeriodLag: 'Prior month',
    description: 'New orders for manufactured durable goods.',
  },
  {
    id: 'starts',
    name: 'Housing Starts & Building Permits',
    agency: 'Census',
    indicatorId: 'HOUST',
    importance: 'medium',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 18 },
    refPeriodLag: 'Prior month',
    description: 'New residential construction.',
  },
  {
    id: 'caseshiller',
    name: 'Case-Shiller Home Price Index',
    agency: 'S&P / FHFA',
    indicatorId: 'CSUSHPISA',
    importance: 'low',
    frequency: 'M',
    rule: { kind: 'dayOfMonth', day: 30 },
    refPeriodLag: '2 months back',
    description: '20-city composite home price index.',
  },
  {
    id: 'jobless',
    name: 'Initial Jobless Claims',
    agency: 'DOL',
    indicatorId: 'ICSA',
    importance: 'medium',
    frequency: 'W',
    rule: { kind: 'weekly', weekday: 4 }, // Thursday
    refPeriodLag: 'Prior week',
    description: 'Weekly count of new unemployment insurance filings.',
  },
  {
    id: 'fomc',
    name: 'FOMC Statement & Press Conference',
    agency: 'Federal Reserve',
    indicatorId: 'FEDFUNDS',
    importance: 'high',
    frequency: 'P',
    // 2026 scheduled FOMC meeting end-dates (approximate, second day of meeting)
    rule: {
      kind: 'fixed',
      dates: [
        '2026-01-28',
        '2026-03-18',
        '2026-04-29',
        '2026-06-17',
        '2026-07-29',
        '2026-09-16',
        '2026-11-04',
        '2026-12-16',
      ],
    },
    refPeriodLag: 'Policy decision',
    description: 'Federal Open Market Committee policy statement and SEP (every other meeting).',
  },
]

/* ------------------------------------------------------------------ */
/* Scheduling helpers                                                  */
/* ------------------------------------------------------------------ */

function nthWeekdayOfMonth(year: number, month: number, ordinal: number, weekday: number): Date {
  const d = new Date(year, month, 1)
  const offset = (weekday - d.getDay() + 7) % 7
  return new Date(year, month, 1 + offset + (ordinal - 1) * 7)
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export interface CalendarEvent {
  id: string
  date: string
  release: ReleaseDef
}

/**
 * Generate calendar events for `release` between [from, to] (inclusive).
 */
export function generateEvents(release: ReleaseDef, from: Date, to: Date): CalendarEvent[] {
  const out: CalendarEvent[] = []
  const fromMs = from.getTime()
  const toMs = to.getTime()

  const push = (d: Date) => {
    const ms = d.getTime()
    if (ms < fromMs || ms > toMs) return
    out.push({ id: `${release.id}-${dateStr(d)}`, date: dateStr(d), release })
  }

  if (release.rule.kind === 'fixed') {
    for (const ds of release.rule.dates) {
      const d = new Date(ds + 'T00:00:00')
      push(d)
    }
    return out
  }

  if (release.rule.kind === 'weekly') {
    const cursor = new Date(from)
    cursor.setHours(0, 0, 0, 0)
    while (cursor.getDay() !== release.rule.weekday) cursor.setDate(cursor.getDate() + 1)
    while (cursor.getTime() <= toMs) {
      push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 7)
    }
    return out
  }

  // Monthly: iterate months between from and to + 1 month buffer
  const start = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth() + 1, 1)
  const cursor = new Date(start)
  while (cursor.getTime() <= end.getTime()) {
    let d: Date
    if (release.rule.kind === 'dayOfMonth') {
      d = new Date(cursor.getFullYear(), cursor.getMonth(), release.rule.day)
    } else {
      // weekdayOrdinal
      d = nthWeekdayOfMonth(cursor.getFullYear(), cursor.getMonth(), release.rule.ordinal, release.rule.weekday)
    }
    push(d)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return out
}

export function generateAllEvents(from: Date, to: Date): CalendarEvent[] {
  return RELEASE_CALENDAR.flatMap((r) => generateEvents(r, from, to)).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  )
}
