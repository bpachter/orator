import { Box, CircularProgress, Skeleton, Stack, Typography } from '@mui/material'

interface LoadingStateProps {
  message?: string
  variant?: 'spinner' | 'skeleton'
  height?: number | string
  rows?: number
}

export function LoadingState({
  message = 'Loading…',
  variant = 'spinner',
  height = 240,
  rows = 4,
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <Stack spacing={1} sx={{ width: '100%', py: 1 }} aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={i === 0 ? 28 : 16}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Stack>
    )
  }

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        gap: 1.5,
        color: 'text.secondary',
      }}
    >
      <CircularProgress size={28} thickness={4} color="primary" />
      <Typography variant="body2">{message}</Typography>
    </Box>
  )
}
