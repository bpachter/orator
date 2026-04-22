import { Alert, AlertTitle, Box, Button, Stack } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  height?: number | string
  compact?: boolean
}

export function ErrorState({
  title = 'Could not load data',
  message,
  onRetry,
  height,
  compact = false,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: height ?? (compact ? 'auto' : 240),
        width: '100%',
      }}
    >
      <Alert
        severity="error"
        variant="outlined"
        sx={{ maxWidth: 520, width: '100%' }}
        role="alert"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={onRetry}
            >
              Retry
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message && (
          <Stack component="span" sx={{ fontSize: 13, opacity: 0.85 }}>
            {message}
          </Stack>
        )}
      </Alert>
    </Box>
  )
}
