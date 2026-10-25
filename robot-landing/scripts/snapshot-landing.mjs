#!/usr/bin/env node
/**
 * Refresh src/data/landing-snapshot.json from the live API (`pnpm snapshot:landing`).
 * The snapshot is the build's fallback when the API is unreachable, so a Docker/CI build never fails because of it.
 * Only the fields the landing reads are kept (no scopes, ids or timestamps).
 */
import { writeFileSync } from 'node:fs'

const base = process.env.LANDING_API_URL || 'https://api.perpixai.ir'
const get = async (path) => {
  const res = await fetch(base + path, { signal: AbortSignal.timeout(30000), headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`)
  return res.json()
}
const [plansRaw, modelsRaw] = await Promise.all([get('/api/v1/user/subscription/plans'), get('/api/v1/ai-registry/models')])
const plans = (Array.isArray(plansRaw) ? plansRaw : plansRaw.items).map((p) => ({
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
}))
const models = (Array.isArray(modelsRaw) ? modelsRaw : modelsRaw.items).map((m) => ({
  name: m.name,
  model_owner: m.model_owner,
  display_name: m.display_name,
  description: m.description,
  supported_inputs: m.supported_inputs,
  supported_outputs: m.supported_outputs,
  min_cost: m.min_cost,
  max_cost: m.max_cost,
}))
writeFileSync(
  new URL('../src/data/landing-snapshot.json', import.meta.url),
  JSON.stringify({ fetchedAt: new Date().toISOString(), plans, models }, null, 2) + '\n',
)
console.log(`snapshot: ${plans.length} plans, ${models.length} models from ${base}`)
