/**
 * NBER-dated US recessions since 1990
 * Sourced from: https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions
 */
export const RECESSIONS = [
  { start: '1990-07-01', end: '1991-03-01', label: '1990-91' },
  { start: '2001-03-01', end: '2001-11-01', label: '2001' },
  { start: '2007-12-01', end: '2009-06-01', label: '2007-09' },
  { start: '2020-02-01', end: '2020-04-01', label: '2020' },
]

/**
 * Generate Plotly shape objects for recession shading
 * @param startDate earliest date on chart (ISO string)
 * @param endDate latest date on chart (ISO string)
 * @returns Array of Plotly shape objects with gray background rectangles
 */
export function getRecessionShapes(startDate: string, endDate: string) {
  const chartStart = new Date(startDate)
  const chartEnd = new Date(endDate)

  return RECESSIONS
    .filter(
      (r) =>
        new Date(r.end) > chartStart &&
        new Date(r.start) < chartEnd,
    )
    .map((recession) => ({
      type: 'rect' as const,
      xref: 'paper' as const,
      yref: 'paper' as const,
      x0: Math.max(new Date(recession.start).getTime(), chartStart.getTime()),
      x1: Math.min(new Date(recession.end).getTime(), chartEnd.getTime()),
      y0: 0,
      y1: 1,
      fillcolor: 'rgba(128, 128, 128, 0.08)',
      line: { width: 0 },
      layer: 'below' as const,
    }))
}
