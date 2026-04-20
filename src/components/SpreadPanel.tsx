import { useEffect, useRef, useState } from 'react'
import type Plotly from 'plotly.js'
import type { FredObs } from '../types'
import { fetchSpreads } from '../api/fred'

interface State {
  series: Record<string, FredObs[]>
  loading: boolean
  error: string
}

const CARD = { background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 10, padding: '1rem' }

function recessionShapes(usrec: FredObs[]): Partial<Plotly.Shape>[] {
  const shapes: Partial<Plotly.Shape>[] = []
  let start: string | null = null
  for (const obs of usrec) {
    if (obs.value === 1 && start === null) {
      start = obs.date
    } else if (obs.value === 0 && start !== null) {
      shapes.push({ type: 'rect', xref: 'x', yref: 'paper', x0: start, x1: obs.date, y0: 0, y1: 1, fillcolor: '#ef444418', line: { width: 0 } })
      start = null
    }
  }
  if (start !== null && usrec.length) {
    shapes.push({ type: 'rect', xref: 'x', yref: 'paper', x0: start, x1: usrec[usrec.length - 1].date, y0: 0, y1: 1, fillcolor: '#ef444418', line: { width: 0 } })
  }
  return shapes
}

export function SpreadPanel() {
  const [state, setState] = useState<State>({ series: {}, loading: true, error: '' })

  useEffect(() => {
    fetchSpreads()
      .then(data => setState({ series: data.series, loading: false, error: '' }))
      .catch(e => setState(s => ({ ...s, loading: false, error: String(e.message) })))
  }, [])

  if (state.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#7d9bc0' }}>
        Loading spread data…
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

  const usrec = state.series['USREC'] ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SpreadChart
          title="10Y – 2Y Spread"
          subtitle="Inversion = recession signal"
          data={state.series['T10Y2Y'] ?? []}
          color="#4a9eff"
          usrec={usrec}
          zeroLine
        />
        <SpreadChart
          title="10Y – 3M Spread"
          subtitle="Near-term inversion indicator"
          data={state.series['T10Y3M'] ?? []}
          color="#22c55e"
          usrec={usrec}
          zeroLine
        />
      </div>
      <FedVsCpiChart
        fedfunds={state.series['FEDFUNDS'] ?? []}
        coreCpi={state.series['CPILFESL'] ?? []}
        usrec={usrec}
      />
    </div>
  )
}

interface SpreadChartProps {
  title: string
  subtitle: string
  data: FredObs[]
  color: string
  usrec: FredObs[]
  zeroLine?: boolean
}

function SpreadChart({ title, subtitle, data, color, usrec, zeroLine }: SpreadChartProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !data.length) return

    import('plotly.js-dist-min').then(mod => {
      const P = (mod as unknown as { default: typeof Plotly }).default ?? mod
      if (!ref.current) return

      const latest = data[data.length - 1]
      const isInverted = latest && latest.value < 0
      const lineColor = isInverted ? '#ef4444' : color
      const fillColor = isInverted ? '#ef444418' : color + '18'

      const trace: Partial<Plotly.PlotData> = {
        type: 'scatter', mode: 'lines',
        x: data.map(o => o.date),
        y: data.map(o => o.value),
        line: { color: lineColor, width: 1.5 },
        fill: 'tozeroy', fillcolor: fillColor,
        hovertemplate: '%{x}: %{y:.2f}%<extra></extra>',
      }

      const shapes: Partial<Plotly.Shape>[] = [...recessionShapes(usrec)]
      if (zeroLine) {
        shapes.push({ type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: '#3a5070', width: 1, dash: 'dot' } })
      }

      const layout: Partial<Plotly.Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#7d9bc0', family: 'Inter, sans-serif', size: 10 },
        xaxis: { color: '#7d9bc0', showgrid: false, zeroline: false },
        yaxis: { color: '#7d9bc0', gridcolor: '#162035', showgrid: true, zeroline: false, ticksuffix: '%' },
        margin: { l: 44, r: 8, t: 8, b: 28 },
        hovermode: 'x unified',
        shapes,
      }

      P.react(ref.current, [trace], layout, { responsive: true, displayModeBar: false })
    })
  }, [data, color, usrec, zeroLine])

  const latest = data[data.length - 1]
  const isInverted = latest && latest.value < 0
  const displayVal = latest != null ? `${latest.value.toFixed(2)}%` : null

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ color: '#e8edf5', fontSize: 13, fontWeight: 600 }}>{title}</div>
          <div style={{ color: '#3a5070', fontSize: 11, marginTop: 2 }}>{subtitle}</div>
        </div>
        {displayVal && (
          <div style={{
            color: isInverted ? '#ef4444' : color,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 20,
          }}>
            {displayVal}
            {isInverted && <span style={{ fontSize: 10, marginLeft: 6, color: '#ef4444' }}>INVERTED</span>}
          </div>
        )}
      </div>
      <div ref={ref} style={{ width: '100%', minHeight: 220 }} />
    </div>
  )
}

function FedVsCpiChart({ fedfunds, coreCpi, usrec }: { fedfunds: FredObs[]; coreCpi: FredObs[]; usrec: FredObs[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !fedfunds.length || !coreCpi.length) return

    import('plotly.js-dist-min').then(mod => {
      const P = (mod as unknown as { default: typeof Plotly }).default ?? mod
      if (!ref.current) return

      const fedTrace: Partial<Plotly.PlotData> = {
        type: 'scatter', mode: 'lines', name: 'Fed Funds Rate',
        x: fedfunds.map(o => o.date), y: fedfunds.map(o => o.value),
        line: { color: '#e8b84b', width: 2 },
        hovertemplate: 'Fed Funds: %{y:.2f}%<extra></extra>',
      }

      const cpiTrace: Partial<Plotly.PlotData> = {
        type: 'scatter', mode: 'lines', name: 'Core CPI YoY',
        x: coreCpi.map(o => o.date), y: coreCpi.map(o => o.value),
        line: { color: '#ef4444', width: 2, dash: 'dot' },
        hovertemplate: 'Core CPI: %{y:.2f}%<extra></extra>',
      }

      const layout: Partial<Plotly.Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#7d9bc0', family: 'Inter, sans-serif', size: 10 },
        xaxis: { color: '#7d9bc0', showgrid: false, zeroline: false },
        yaxis: { color: '#7d9bc0', gridcolor: '#162035', showgrid: true, zeroline: false, ticksuffix: '%' },
        legend: { x: 0.01, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#7d9bc0', size: 11 } },
        margin: { l: 44, r: 8, t: 8, b: 28 },
        hovermode: 'x unified',
        shapes: recessionShapes(usrec),
      }

      P.react(ref.current, [fedTrace, cpiTrace], layout, { responsive: true, displayModeBar: false })
    })
  }, [fedfunds, coreCpi, usrec])

  const latestFed = fedfunds[fedfunds.length - 1]
  const latestCpi = coreCpi[coreCpi.length - 1]

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ color: '#e8edf5', fontSize: 13, fontWeight: 600 }}>Fed Funds vs Core CPI</div>
          <div style={{ color: '#3a5070', fontSize: 11, marginTop: 2 }}>Real interest rate context — shaded areas = recessions</div>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {latestFed && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#3a5070', fontSize: 10 }}>FED FUNDS</div>
              <div style={{ color: '#e8b84b', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 18 }}>
                {latestFed.value.toFixed(2)}%
              </div>
            </div>
          )}
          {latestCpi && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#3a5070', fontSize: 10 }}>CORE CPI</div>
              <div style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 18 }}>
                {latestCpi.value.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </div>
      <div ref={ref} style={{ width: '100%', minHeight: 280 }} />
    </div>
  )
}
