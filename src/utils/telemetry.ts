/// <reference types="vite/client" />

interface SentryGlobal {
  captureException?: (error: unknown, ctx?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    Sentry?: SentryGlobal
  }
}

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

/** Lazily wires window.Sentry if a DSN is supplied. Safe to call repeatedly. */
export function initTelemetry(): void {
  if (!DSN || typeof window === 'undefined' || window.Sentry) return
  // Sentry SDK is intentionally not bundled by default; integrators can drop
  // in @sentry/browser via index.html or a side-effectful import. Until then
  // reportError falls back to console output.
}

export function reportError(error: unknown, ctx?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.Sentry?.captureException) {
    window.Sentry.captureException(error, ctx)
    return
  }
  // eslint-disable-next-line no-console
  console.error('[orator]', error, ctx)
}
