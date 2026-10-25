import snapshot from '@/data/landing-snapshot.json'
import { parseLanding } from './normalize'
import type { LandingData } from './types'

let cached: LandingData | undefined

/**
 * Plans and models for the static export (and the dev server): the snapshot `scripts/snapshot-landing.mjs` wrote from the API
 * right before `pnpm dev` / `pnpm build`. Pages only read this file; the fetching (and its fallback/strict rules) lives in the script.
 */
export function getLandingData(): LandingData {
  if (!cached) {
    const data = parseLanding(snapshot.plans, snapshot.models, 'snapshot', snapshot.fetchedAt)
    if (!data) throw new Error('[landing-data] src/data/landing-snapshot.json is invalid: run `pnpm snapshot:landing`')
    cached = data
    console.info(`[landing-data] ${data.plans.length} paid plans, ${data.models.length} models (snapshot from ${snapshot.fetchedAt})`)
  }
  return cached
}
