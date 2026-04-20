import { useState } from 'react'
import type { ActiveView } from './types'
import { ApiKeyGate, loadApiKey, clearApiKey } from './components/ApiKeyGate'
import { YieldCurve3D } from './components/YieldCurve3D'
import { MacroPanel } from './components/MacroPanel'

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(loadApiKey)
  const [view, setView] = useState<ActiveView>('yield-curve')

  if (!apiKey) {
    return <ApiKeyGate onKey={setApiKey} />
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#070d1a', color: '#e8edf5',
      fontFamily: "'Inter', sans-serif",
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: 52,
        borderBottom: '1px solid #1e2d4a', background: '#0a1220',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ color: '#e8b84b', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>
            ORATOR
          </span>
          <nav style={{ display: 'flex', gap: 4 }}>
            {([
              ['yield-curve', 'Yield Curve'],
              ['macro', 'Macro Dashboard'],
            ] as [ActiveView, string][]).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '4px 14px', borderRadius: 6, border: 'none',
                  background: view === v ? '#162035' : 'transparent',
                  color: view === v ? '#e8edf5' : '#7d9bc0',
                  fontWeight: 500, fontSize: 13, cursor: 'pointer',
                  borderBottom: view === v ? '2px solid #e8b84b' : '2px solid transparent',
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => { clearApiKey(); setApiKey(null) }}
          style={{
            padding: '4px 12px', borderRadius: 6, border: '1px solid #1e2d4a',
            background: 'transparent', color: '#7d9bc0', fontSize: 12, cursor: 'pointer',
          }}
          title="Clear API key"
        >
          API Key
        </button>
      </header>

      <main style={{ flex: 1, overflow: 'auto', padding: '1.25rem 1.5rem' }}>
        {view === 'yield-curve' && <YieldCurve3D apiKey={apiKey} />}
        {view === 'macro' && <MacroPanel apiKey={apiKey} />}
      </main>

      <footer style={{
        padding: '0.5rem 1.5rem', borderTop: '1px solid #1e2d4a',
        color: '#3a5070', fontSize: 11, display: 'flex', justifyContent: 'space-between',
      }}>
        <span>Data: Federal Reserve Bank of St. Louis (FRED)</span>
        <span>
          <a href="https://bpachter.github.io" style={{ color: '#3a5070' }}>← Portfolio</a>
        </span>
      </footer>
    </div>
  )
}
