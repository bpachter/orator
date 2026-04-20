import { useEffect, useRef, useState } from 'react'
import type Plotly from 'plotly.js'
import type { FredObs } from '../types'
import { fetchGrocery } from '../api/fred'

interface GroceryItem {
  id: string
  label: string
  unit: string
  color: string
}

interface State {
  items: GroceryItem[]
  series: Record<string, FredObs[]>
  loading: boolean
  error: string
}

export function GroceryPanel() {
  const [state, setState] = useState<State>({ items: [], series: {}, loading: true, error: '' })
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchGrocery()
      .then(data => setState({ ...data, loading: false, error: '' }))
      .catch(e => setState(s => ({ ...s, loading: false, error: String(e.message) })))
  }, [])

  useEffect(() => {
    if (!chartRef.current || state.loading || state.error || !state.items.length) return

    import('plotly.js-dist-min').then(mod => {
      const P = (mod as unknown as { default: typeof Plotly }).default ?? mod
      if (!chartRef.current) return

      const traces: Partial<Plotly.PlotData>[] = state.items
        .filter(item => (state.series[item.id] ?? []).length > 0)
        .map(item => ({
          type: 'scatter',
          mode: 'lines',
          name: item.label,
          x: state.series[item.id].map(o => o.date),
          y: state.series[item.id].map(o => o.value),
          line: { color: item.color, width: 1.75 },
          hovertemplate: `<b>${item.label}</b> ${item.unit}: %{y:.1f}%<extra></extra>`,
        }))

      const layout: Partial<Plotly.Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#7d9bc0', family: 'Inter, sans-serif', size: 11 },
        xaxis: { color: '#7d9bc0', showgrid: false, zeroline: false },
        yaxis: {
          color: '#7d9bc0', gridcolor: '#162035', showgrid: true,
          zeroline: true, zerolinecolor: '#3a5070', zerolinewidth: 1,
          ticksuffix: '%',
        },
        legend: {
          orientation: 'h',
          x: 0, y: -0.12,
          font: { color: '#7d9bc0', size: 11 },
          bgcolor: 'rgba(0,0,0,0)',
        },
        margin: { l: 48, r: 12, t: 12, b: 80 },
        hovermode: 'x',
        shapes: [{
          type: 'line', xref: 'paper', yref: 'y',
          x0: 0, x1: 1, y0: 0, y1: 0,
          line: { color: '#3a5070', width: 1, dash: 'dot' },
        }],
      }

      P.react(chartRef.current, traces, layout, { responsive: true, displayModeBar: false })
    })
  }, [state])

  if (state.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#7d9bc0' }}>
        Loading grocery price data…
      </div>
    )
  }

  if (state.error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#ef4444' }}>
        {state.error}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 10, padding: '1rem',
      }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: '#e8edf5', fontSize: 14, fontWeight: 600 }}>
            Grocery Price Inflation — Year-over-Year %
          </div>
          <div style={{ color: '#3a5070', fontSize: 11, marginTop: 3 }}>
            BLS average prices, U.S. city average — monthly
          </div>
        </div>
        <div ref={chartRef} style={{ width: '100%', minHeight: 440 }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
      }}>
        {state.items.map(item => {
          const data = state.series[item.id] ?? []
          const latest = data[data.length - 1]
          const isUp = latest && latest.value > 0
          return (
            <div key={item.id} style={{
              background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8,
              padding: '0.75rem', textAlign: 'center',
            }}>
              <div style={{ color: '#7d9bc0', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                {item.label}
                <span style={{ color: '#3a5070', fontWeight: 400 }}> {item.unit}</span>
              </div>
              {latest ? (
                <div style={{
                  color: isUp ? item.color : '#22c55e',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: 18,
                }}>
                  {isUp ? '+' : ''}{latest.value.toFixed(1)}%
                </div>
              ) : (
                <div style={{ color: '#3a5070', fontSize: 13 }}>—</div>
              )}
              {latest && (
                <div style={{ color: '#3a5070', fontSize: 10, marginTop: 2 }}>
                  {latest.date}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
