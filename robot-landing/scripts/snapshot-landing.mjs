#!/usr/bin/env node
/**
 * Plans and models for the landing page: refresh src/data/landing-snapshot.json from the Perpix API.
 *
 * Runs automatically before `pnpm dev` and `pnpm build` (see package.json), so every dev session and every build starts from
 * the API's current data; `pnpm snapshot:landing` runs it by hand. The Next.js code only ever reads this file (lib/landing/server.ts).
 *
 *  - If the API cannot be reached (or answers with something unusable) the existing snapshot is kept and a warning is printed,
 *    so offline development and a Docker build without egress still work. With `--strict` or LANDING_DATA_STRICT=1 it exits 1 instead.
 *  - The file is rewritten only when plans/models actually changed (so git stays clean), and an answer is accepted only if
 *    parseLanding() (the same validation the page uses) can read it: a malformed response never replaces good data.
 *  - Only the fields the landing reads are kept (no scopes, ids or timestamps).
 *
 * LANDING_API_URL overrides the API base (default https://api.perpixai.ir).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { parseLanding } from '../src/lib/landing/normalize.ts'

const base = process.env.LANDING_API_URL || 'https://api.perpixai.ir'
const strict = process.argv.includes('--strict') || process.env.LANDING_DATA_STRICT === '1'
const file = new URL('../src/data/landing-snapshot.json', import.meta.url)

const get = async (path) => {
  const res = await fetch(base + path, { signal: AbortSignal.timeout(10_000), headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${path} answered HTTP ${res.status}`)
  return res.json()
}
const items = (v) => (Array.isArray(v) ? v : (v?.items ?? []))
const same = (a, b) => JSON.stringify([a.plans, a.models]) === JSON.stringify([b.plans, b.models])

try {
  const [plansRaw, modelsRaw] = await Promise.all([get('/api/v1/user/subscription/plans'), get('/api/v1/ai-registry/models')])
  const next = {
    plans: items(plansRaw).map((p) => ({
      name: p.name,
      display_name: p.display_name,
      description: p.description,
      base_price_irr: p.base_price_irr,
      discounted_price_irr: p.discounted_price_irr,
      duration_days: p.duration_days,
      balance_gift_amount_usdmicro: p.balance_gift_amount_usdmicro,
      allowed_models: p.allowed_models,
      meta: { features: p.meta?.features ?? [] },
      is_active: p.is_active,
      is_recommended: p.is_recommended,
      is_default: p.is_default,
    })),
    models: items(modelsRaw).map((m) => ({
      name: m.name,
      model_owner: m.model_owner,
      display_name: m.display_name,
      description: m.description,
      supported_inputs: m.supported_inputs,
      supported_outputs: m.supported_outputs,
      min_cost: m.min_cost,
      max_cost: m.max_cost,
    })),
  }
  const parsed = parseLanding(next.plans, next.models, 'snapshot')
  if (!parsed) throw new Error('the API answered with a shape the landing cannot read')

  const current = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
  if (current && same(current, next)) {
    console.log(
      `[landing-data] snapshot is current (${parsed.plans.length} paid plans, ${parsed.models.length} models, from ${current.fetchedAt})`,
    )
  } else {
    writeFileSync(file, JSON.stringify({ fetchedAt: new Date().toISOString(), ...next }, null, 2) + '\n')
    console.log(`[landing-data] snapshot updated from ${base}: ${parsed.plans.length} paid plans, ${parsed.models.length} models`)
  }
} catch (error) {
  const message = `[landing-data] could not refresh the snapshot from ${base}: ${error?.message ?? error}`
  if (strict) {
    console.error(`${message} (strict mode)`)
    process.exit(1)
  }
  const kept = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).fetchedAt : null
  console.warn(`${message}. ${kept ? `Keeping the existing snapshot from ${kept}; prices may be stale.` : 'There is no snapshot either!'}`)
  if (!kept) process.exit(1)
}
