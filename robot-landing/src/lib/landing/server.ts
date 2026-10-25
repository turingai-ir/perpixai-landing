import snapshot from '@/data/landing-snapshot.json'
import { directEndpoints, fetchRawLanding } from './fetch'
import { parseLanding } from './normalize'
import type { LandingData } from './types'

let cached: Promise<LandingData> | undefined

/**
 * Plans and models for the static export, resolved once per build worker.
 *  1. the live API (`LANDING_API_URL`, default https://api.perpixai.ir), 20 s timeout;
 *  2. otherwise the committed snapshot (`pnpm snapshot:landing`), with a loud warning, so a build never fails because the API is down.
 * `LANDING_DATA_STRICT=1` turns the fallback into a build error (use it in CI/release builds where stale prices are unacceptable).
 */
export const getLandingData = () => (cached ??= load())

async function load(): Promise<LandingData> {
  const base = process.env.LANDING_API_URL || 'https://api.perpixai.ir'
  try {
    const raw = await fetchRawLanding(directEndpoints(base), AbortSignal.timeout(20_000))
    const data = parseLanding(raw.plans, raw.models, 'live')
    if (!data) throw new Error('the API answered with an unexpected shape')
    console.info(`[landing-data] live from ${base}: ${data.plans.length} plans, ${data.models.length} models`)
    return data
  } catch (error) {
    if (process.env.LANDING_DATA_STRICT === '1') throw new Error(`[landing-data] LANDING_DATA_STRICT=1 and the live fetch failed: ${error}`)
    console.warn(
      `[landing-data] live fetch from ${base} failed (${error}); using the committed snapshot from ${snapshot.fetchedAt}. Prices may be stale.`,
    )
    const data = parseLanding(snapshot.plans, snapshot.models, 'snapshot', snapshot.fetchedAt)
    if (!data) throw new Error('[landing-data] the committed snapshot is invalid: run `pnpm snapshot:landing`')
    return data
  }
}
