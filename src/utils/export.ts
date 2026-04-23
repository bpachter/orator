import type { FredObs } from '../types'

/**
 * Convert FRED observations to CSV format and download
 * @param data Array of observations
 * @param filename Download filename (without .csv)
 * @param seriesName Optional series name to include as header
 */
export function downloadCSV(data: FredObs[], filename: string, seriesName?: string) {
  if (!data.length) {
    console.warn('No data to export')
    return
  }

  const headers = ['Date', 'Value']
  const rows = data.map((o) => [o.date, o.value.toString()])

  let csv = headers.join(',') + '\n'
  if (seriesName) {
    csv = `# ${seriesName}\n` + csv
  }
  csv += rows.map((row) => row.join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export multi-series data as CSV
 * @param seriesMap Object mapping series name to observations array
 * @param filename Download filename
 */
export function downloadMultiSeriesCSV(
  seriesMap: Record<string, FredObs[]>,
  filename: string,
) {
  const allDates = new Set<string>()
  Object.values(seriesMap).forEach((obs) => {
    obs.forEach((o) => allDates.add(o.date))
  })

  const sortedDates = Array.from(allDates).sort()
  const seriesNames = Object.keys(seriesMap)

  // Build date-indexed lookup
  const lookup: Record<string, Record<string, number>> = {}
  Object.entries(seriesMap).forEach(([name, obs]) => {
    obs.forEach((o) => {
      if (!lookup[o.date]) lookup[o.date] = {}
      lookup[o.date][name] = o.value
    })
  })

  const headers = ['Date', ...seriesNames]
  let csv = headers.join(',') + '\n'

  for (const date of sortedDates) {
    const row = [date, ...seriesNames.map((name) => lookup[date]?.[name] ?? '')]
    csv += row.join(',') + '\n'
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
