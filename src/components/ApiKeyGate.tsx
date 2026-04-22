import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

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

/**
 * Optional FRED API-key gate. The production deployment proxies through the
 * FastAPI backend (which holds the key server-side), so this component is
 * only used for local dev modes that talk to FRED directly.
 */
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 460, width: '100%' }}>
        <Stack spacing={2}>
          <Typography
            variant="h4"
            component="div"
            sx={{ color: 'primary.main', letterSpacing: 3, fontWeight: 600 }}
          >
            ORATOR
          </Typography>
          <Typography variant="body2">
            Enter your{' '}
            <Link
              href="https://fred.stlouisfed.org/docs/api/api_key.html"
              target="_blank"
              rel="noreferrer"
              color="secondary"
            >
              FRED API key
            </Link>{' '}
            to load live economic data. Free to register — takes 30 seconds. Your
            key is stored only in your browser.
          </Typography>

          <Box component="form" onSubmit={submit}>
            <TextField
              fullWidth
              autoFocus
              spellCheck={false}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setErr('')
              }}
              placeholder="32-character hex key"
              error={Boolean(err)}
              inputProps={{
                'aria-label': 'FRED API key',
                style: { fontFamily: 'JetBrains Mono, monospace' },
              }}
            />
            {err && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                {err}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              Load Orator
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}
