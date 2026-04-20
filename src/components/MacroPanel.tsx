import { useEffect, useRef, useState } from 'react'
import type Plotly from 'plotly.js'
import type { FredObs } from '../types'
import { fetchSeries, MACRO_SERIES, getStartDate } from '../api/fred'

interface Props {
  apiKey: string
}

interface SeriesState {
  data: FredObs[]
  loading: boolean
  error: string
}

export function MacroPanel({ apiKey }: Props) {
  const [seriesData, setSeriesData] = useState<Record<string, SeriesState>>({})

  useEffect(() => {
    const start = getStartDate('10Y')
    const end = new Date().toISOString().slice(0, 10)

    // Mark all loading upfront
    setSeriesData(
      Object.fromEntries(MACRO_SERIES.map(s => [s.id, { data: [], loading: true, error: '' }]))
    )

    // Stagger requests — avoids hitting corsproxy.io rate limits after the
    // 10 concurrent yield-curve fetches that may have just completed.
    MACRO_SERIES.forEach((s, i) => {
      setTimeout(() => {
        fetchSeries(s.id, start, end, apiKey)
          .then(data => setSeriesData(prev => ({ ...prev, [s.id]: { data, loading: false, error: '' } })))
          .catch(e => setSeriesData(prev => ({
            ...prev,
            [s.id]: { data: [], loading: false, error: String(e.message) },
          })))
      }, i * 500)
    })
  }, [apiKey])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%' }}>
      {MACRO_SERIES.map(s => (
        <MacroChart
          key={s.id}
          label={s.label}
          unit={s.unit}
          color={s.color}
          state={seriesData[s.id] ?? { data: [], loading: true, error: '' }}
          seriesId={s.id}
        />
      ))}
    </div>
  )
}

interface ChartProps {
  label: string
  unit: string
  color: string
  state: SeriesState
  seriesId: string
}

function MacroChart({ label, color, state, seriesId }: ChartProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || state.loading || state.error || !state.data.length) return

    import('plotly.js-dist-min').then(mod => {
      const P = (mod as unknown as { default: typeof Plotly }).default ?? mod
      if (!ref.current) return

      let data = state.data
      if (seriesId === 'CPIAUCSL' && data.length > 12) {
        data = data.slice(12).map((obs, i) => ({
          date: obs.date,
          value: ((obs.value - state.data[i].value) / state.data[i].value) * 100,
        }))
      }

      const trace: Partial<Plotly.PlotData> = {
        type: 'scatter',
        mode: 'lines',
        x: data.map(o => o.date),
        y: data.map(o => o.value),
        line: { color, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: color + '18',
        hovertemplate: '%{x}: %{y:.2f}<extra></extra>',
      }

      const layout: Partial<Plotly.Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#7d9bc0', family: 'Inter, sans-serif', size: 10 },
        xaxis: {
          color: '#7d9bc0', gridcolor: '#1e2d4a',
          showgrid: false, zeroline: false,
        },
        yaxis: {
          color: '#7d9bc0', gridcolor: '#162035',
          showgrid: true, zeroline: true, zerolinecolor: '#1e2d4a',
        },
        margin: { l: 40, r: 8, t: 8, b: 28 },
        hovermode: 'x unified',
      }

      P.react(ref.current, [trace], layout, {
        responsive: true,
        displayModeBar: false,
      })
    })
  }, [state, color, seriesId])

  const latest = state.data[state.data.length - 1]
  let displayVal: string | null = null
  if (latest && seriesId === 'CPIAUCSL' && state.data.length > 12) {
    const prev = state.data[state.data.length - 13]
    if (prev) displayVal = (((latest.value - prev.value) / prev.value) * 100).toFixed(2) + '%'
  } else if (latest) {
    displayVal = latest.value.toFixed(2) + '%'
  }

  return (
    <div style={{
      background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 10,
      padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ color: '#7d9bc0', fontSize: 12, fontWeight: 500 }}>{label.toUpperCase()}</div>
        {displayVal && (
          <div style={{ color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 18 }}>
            {displayVal}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 160, position: 'relative' }}>
        {state.loading && (
          <div style={{ color: '#7d9bc0', fontSize: 12, paddingTop: 60, textAlign: 'center' }}>
            Loading…
          </div>
        )}
        {state.error && (
          <div style={{ color: '#ef4444', fontSize: 12, paddingTop: 60, textAlign: 'center' }}>
            {state.error}
          </div>
        )}
        <div ref={ref} style={{ width: '100%', height: '100%', minHeight: 160 }} />
      </div>
    </div>
  )
}
