import { useEffect, useRef, useState } from 'react'
import type Plotly from 'plotly.js'
import type { TimeRange, YieldSurface } from '../types'
import { fetchYieldSurface } from '../api/fred'

const RANGES: TimeRange[] = ['1Y', '2Y', '5Y', '10Y', 'MAX']

export function YieldCurve3D() {
  const plotRef = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState<TimeRange>('5Y')
  const [surface, setSurface] = useState<YieldSurface | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ loaded: 0, total: 10 })
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setProgress({ loaded: 0, total: 10 })
    setError('')
    fetchYieldSurface(range, (loaded, total) => setProgress({ loaded, total }))
      .then(s => { setSurface(s); setLoading(false) })
      .catch(e => { setError(String(e.message)); setLoading(false) })
  }, [range])

  useEffect(() => {
    if (!surface || !plotRef.current) return

    const PlotlyLib = (window as unknown as { Plotly?: typeof Plotly }).Plotly
    const plot = PlotlyLib ?? undefined

    import('plotly.js-dist-min').then((mod) => {
      const P = (mod as unknown as { default: typeof Plotly }).default ?? mod
      if (!plotRef.current) return

      void plot

      const trace: Partial<Plotly.PlotData> = {
        type: 'surface' as const,
        x: surface.maturityYears,
        y: surface.dates,
        z: surface.z,
        colorscale: [
          [0,    '#1d4ed8'],  // deep blue  — near-zero rates
          [0.15, '#0891b2'],  // cyan
          [0.35, '#10b981'],  // green
          [0.55, '#f59e0b'],  // amber
          [0.75, '#f97316'],  // orange
          [1,    '#dc2626'],  // red        — high rates
        ] as [number, string][],
        showscale: true,
        colorbar: {
          title: { text: 'Yield (%)', side: 'right' } as unknown as string,
          thickness: 12,
          len: 0.55,
          tickfont: { size: 10, color: '#7d9bc0' },
          outlinecolor: '#1e2d4a',
          bgcolor: 'rgba(0,0,0,0)',
        } as unknown as Plotly.ColorBar,
        hovertemplate:
          '<b>Maturity:</b> %{x}yr<br>' +
          '<b>Date:</b> %{y}<br>' +
          '<b>Yield:</b> %{z:.2f}%<extra></extra>',
        contours: {
          z: { show: true, usecolormap: true, highlightcolor: '#ffffff55', project: { z: false } },
        },
      } as unknown as Partial<Plotly.PlotData>

      const layout: Partial<Plotly.Layout> = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#7d9bc0', family: 'Inter, sans-serif', size: 11 },
        scene: {
          bgcolor: 'rgba(0,0,0,0)',
          xaxis: {
            title: { text: 'Maturity (Years)', font: { color: '#7d9bc0' } } as Plotly.LayoutAxis['title'],
            color: '#7d9bc0',
            gridcolor: '#1e2d4a',
            tickvals: surface.maturityYears,
            ticktext: surface.maturityLabels,
            showbackground: true,
            backgroundcolor: '#0a1220',
          } as unknown as Plotly.LayoutAxis,
          yaxis: {
            title: { text: 'Date', font: { color: '#7d9bc0' } } as Plotly.LayoutAxis['title'],
            color: '#7d9bc0',
            gridcolor: '#1e2d4a',
            showbackground: true,
            backgroundcolor: '#0a1220',
            tickfont: { size: 9 },
          } as unknown as Plotly.LayoutAxis,
          zaxis: {
            title: { text: 'Yield (%)', font: { color: '#7d9bc0' } } as Plotly.LayoutAxis['title'],
            color: '#7d9bc0',
            gridcolor: '#1e2d4a',
            showbackground: true,
            backgroundcolor: '#0a1220',
          } as unknown as Plotly.LayoutAxis,
          camera: { eye: { x: 1.6, y: -1.9, z: 0.7 } },
          aspectmode: 'manual',
          aspectratio: { x: 1.2, y: 2.5, z: 0.6 },
        } as unknown as Plotly.Scene,
        margin: { l: 0, r: 0, t: 0, b: 0 },
      }

      P.react(plotRef.current, [trace], layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'] as Plotly.ModeBarDefaultButtons[],
        displaylogo: false,
      })
    })
  }, [surface])

  const currentCurve = surface
    ? surface.maturityLabels.map((label, i) => ({
        label,
        value: surface.z[surface.z.length - 1]?.[i] ?? NaN,
      }))
    : []

  const spread10y2y = surface
    ? (() => {
        const last = surface.z[surface.z.length - 1]
        return last ? (last[7] - last[3]).toFixed(2) : null
      })()
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#e8edf5', fontWeight: 600, fontSize: 18 }}>
            U.S. Treasury Yield Curve
          </div>
          <div style={{ color: '#7d9bc0', fontSize: 13 }}>
            3D surface — time × maturity × rate
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '4px 12px', borderRadius: 6, border: 'none',
                background: range === r ? '#e8b84b' : '#162035',
                color: range === r ? '#070d1a' : '#7d9bc0',
                fontWeight: 500, fontSize: 13, cursor: 'pointer',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1, minHeight: 460, position: 'relative',
        background: '#0f1729', borderRadius: 12, border: '1px solid #1e2d4a', overflow: 'hidden',
      }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#7d9bc0', fontSize: 14, background: '#0f1729', zIndex: 2,
          }}>
            Loading {range} yield data… {progress.loaded}/{progress.total} maturities
          </div>
        )}
        {error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#ef4444', fontSize: 14, padding: 24, textAlign: 'center',
          }}>
            {error}
          </div>
        )}
        <div ref={plotRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 10, padding: '1rem',
        }}>
          <div style={{ color: '#7d9bc0', fontSize: 12, marginBottom: 10, fontWeight: 500 }}>
            CURRENT CURVE SNAPSHOT
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {currentCurve.map(({ label, value }) => (
              <div key={label} style={{
                background: '#162035', borderRadius: 6, padding: '4px 10px',
                textAlign: 'center', minWidth: 52,
              }}>
                <div style={{ color: '#7d9bc0', fontSize: 10 }}>{label}</div>
                <div style={{ color: '#e8b84b', fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                  {isNaN(value) ? '—' : value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 10, padding: '1rem',
        }}>
          <div style={{ color: '#7d9bc0', fontSize: 12, marginBottom: 10, fontWeight: 500 }}>
            10Y–2Y SPREAD
          </div>
          {spread10y2y !== null && (
            <>
              <div style={{
                fontSize: 36, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                color: parseFloat(spread10y2y) < 0 ? '#ef4444' : '#22c55e',
              }}>
                {parseFloat(spread10y2y) > 0 ? '+' : ''}{spread10y2y}%
              </div>
              <div style={{ color: '#7d9bc0', fontSize: 12, marginTop: 4 }}>
                {parseFloat(spread10y2y) < 0
                  ? '⚠ Inverted — historically precedes recession by 12–18 months'
                  : 'Normal slope — no inversion signal'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
