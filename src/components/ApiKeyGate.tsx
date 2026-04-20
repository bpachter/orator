import { useState } from 'react'

const KEY = 'orator_fred_api_key'
const VALID = /^[a-f0-9]{32}$/i

export function loadApiKey(): string | null {
  return localStorage.getItem(KEY)
}

export function clearApiKey(): void {
  localStorage.removeItem(KEY)
}

interface Props {
  onKey: (key: string) => void
}

export function ApiKeyGate({ onKey }: Props) {
  const [input, setInput] = useState('')
  const [err, setErr] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const k = input.trim()
    if (!VALID.test(k)) {
      setErr('FRED API keys are 32 lowercase hex characters.')
      return
    }
    localStorage.setItem(KEY, k)
    onKey(k)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#070d1a',
    }}>
      <div style={{
        background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 12,
        padding: '2.5rem', maxWidth: 420, width: '100%',
      }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: '#e8b84b', marginBottom: 8, letterSpacing: 3 }}>
          ORATOR
        </div>
        <div style={{ color: '#7d9bc0', marginBottom: 24, lineHeight: 1.6 }}>
          Enter your{' '}
          <a
            href="https://fred.stlouisfed.org/docs/api/api_key.html"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#4a9eff' }}
          >
            FRED API key
          </a>{' '}
          to load live economic data. Free to register — takes 30 seconds.
          Your key is stored only in your browser.
        </div>
        <form onSubmit={submit}>
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setErr('') }}
            placeholder="32-character hex key"
            spellCheck={false}
            style={{
              width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
              border: `1px solid ${err ? '#ef4444' : '#1e2d4a'}`,
              background: '#162035', color: '#e8edf5',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {err && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 6 }}>{err}</div>}
          <button
            type="submit"
            style={{
              marginTop: 16, width: '100%', padding: '0.75rem',
              background: '#e8b84b', color: '#070d1a', border: 'none',
              borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer',
            }}
          >
            Load Orator
          </button>
        </form>
      </div>
    </div>
  )
}
