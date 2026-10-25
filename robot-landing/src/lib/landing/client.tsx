'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { config } from '@/config'
import { fetchRawLanding, proxyEndpoints } from './fetch'
import { parseLanding, sameLanding } from './normalize'
import type { LandingData } from './types'

const LandingContext = createContext<LandingData | null>(null)

/**
 * Plans and models. They arrive baked into the page (server snapshot of the API at build time), so there is no loading state and
 * crawlers see real prices; after hydration they are quietly refreshed from the same-origin API proxy (nginx `/api/landing`),
 * so a price changed since the last deploy is corrected within minutes. Any failure keeps the baked data.
 */
export function LandingProvider({ initial, children }: { initial: LandingData; children: ReactNode }) {
  const [data, setData] = useState(initial)

  useEffect(() => {
    if (config.landingApiUrl === 'off') return
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 6000)
    fetchRawLanding(proxyEndpoints(config.landingApiUrl), controller.signal)
      .then((raw) => {
        const next = parseLanding(raw.plans, raw.models, 'live')
        if (next && !sameLanding(next, initial)) setData(next)
        else if (next) setData((current) => (current.source === 'live' ? current : { ...current, source: 'live' }))
      })
      .catch(() => {}) // proxy missing (local dev) or API down: keep what was baked
      .finally(() => window.clearTimeout(timer))
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [initial])

  return <LandingContext value={data}>{children}</LandingContext>
}

export function useLanding() {
  const data = useContext(LandingContext)
  if (!data) throw new Error('useLanding must be used inside <LandingProvider>')
  return data
}
