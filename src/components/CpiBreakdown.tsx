import { useEffect, useRef, useState } from 'react'
import type Plotly from 'plotly.js'
import type { FredObs, CpiComponent } from '../types'
import { fetchCpiBreakdown } from '../api/fred'

interface State {
  components: CpiComponent[]
  series: Record<string, FredObs[]>
  loading: boolean
  error: string
}

const CARD = { background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 10, padding: '1rem' }

export function CpiBreakdown() {
  const [state, setState] = useState<State>({ components: [], series: {}, loading: true, error: '' })

  useEffect(() => {
    fetchCpiBreakdown()
      .then(data => setState({ ...data, loading: false, error: '' }))
      .catch(e => setState(s => ({ ...s, loading: false, error: String(e.message) })))
  }, [])

  if (state.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#7d9bc0' }}>
        Loading CPI data…
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

  const [top2, rest] = [state.components.slice(0, 2), state.components.slice(2)]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {top2.map(c => (
          <CpiChart key={c.id} component={c} data={state.series[c.id] ?? []} minHeight={220} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {rest.map(c => (
          <CpiChart key={c.id} component={c} data={state.series[c.id] ?? []} minHeight={160} />
        ))}
      </div>
    </div>
  )
}

function CpiChart({ component, data, minHeight }: { component: CpiComponent; data: FredObs[]; minHeight: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !data.length) return

    import('plotly.js-dist-min').then(mod => {
      const P = (mod as unknown as { default: typeof Plotly }).default ?? mod
      if (!ref.current) return

      const latest = data[data.length - 1]
      const isNeg = latest && latest.value < 0

      const trace: Partial<Plotly.PlotData> = {
        type: 'scatter',
        mode: 'lines',
        x: data.map(o => o.date),
        y: data.map(o => o.value),
        line: { color: component.color, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: component.color + '18',
        hovertemplate: '%{x}: %{y:.2f}%<extra></extra>',
      }

      const layout: Partial<Plotly.Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#7d9bc0', family: 'Inter, sans-serif', size: 10 },
        xaxis: { color: '#7d9bc0', showgrid: false, zeroline: false },
        yaxis: { color: '#7d9bc0', gridcolor: '#162035', showgrid: true, zeroline: true, zerolinecolor: '#1e2d4a' },
        margin: { l: 36, r: 8, t: 8, b: 28 },
        hovermode: 'x unified',
        shapes: [{
          type: 'line', xref: 'paper', yref: 'y',
          x0: 0, x1: 1, y0: 0, y1: 0,
          line: { color: '#1e2d4a', width: 1 },
        }],
      }

      P.react(ref.current, [trace], layout, { responsive: true, displayModeBar: false })
      void isNeg
    })
  }, [data, component])

  const latest = data[data.length - 1]
  const displayVal = latest != null ? `${latest.value.toFixed(2)}%` : null

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ color: '#7d9bc0', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
          {component.label}
        </div>
        {displayVal && (
          <div style={{
            color: component.color,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            fontSize: minHeight >= 200 ? 20 : 16,
          }}>
            {displayVal}
          </div>
        )}
      </div>
      <div ref={ref} style={{ width: '100%', minHeight }} />
    </div>
  )
}
