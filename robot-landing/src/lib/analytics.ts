declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/** Funnel events. Picked up by GTM / GA4 if present, otherwise a no-op. */
export function track(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer?.push({ event: `perpix_${event}`, ...params })
  if (import.meta.env.DEV) console.debug('[track]', event, params)
}
