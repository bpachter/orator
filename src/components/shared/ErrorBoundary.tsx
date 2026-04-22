import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { reportError } from '../../utils/telemetry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, { component: info.componentStack ?? undefined })
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <Typography variant="h5" color="error">
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {this.state.error.message || 'An unexpected error occurred while rendering this view.'}
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            onClick={() => {
              this.reset()
              if (typeof window !== 'undefined') window.location.reload()
            }}
          >
            Reload
          </Button>
        </Stack>
      </Box>
    )
  }
}
