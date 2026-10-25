import type { ApiModel, ApiPlan, LandingData, Model, ModelInput, ModelKind, Plan } from './types'

const OWNERS: Record<string, string> = {
  BLACK_FOREST_LABS: 'Black Forest Labs',
  GOOGLE: 'Google',
  ALIBABA: 'Alibaba',
  OPEN_AI: 'OpenAI',
  X_AI: 'xAI',
  BYTE_DANCE: 'ByteDance',
  RUNWAY: 'Runway',
  K_LING_AI: 'Kling AI',
  IDEOGRAM: 'Ideogram',
}
const ownerLabel = (key: string) =>
  OWNERS[key] ??
  key
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')

/** Analytics ids from before the plans came from the API: keeps funnel dashboards continuous. */
const LEGACY_SLUGS: Record<string, string> = { LOW_USAGE: 'economy', CREATOR: 'creator', CREATOR_PLUS: 'pro', BASIC: 'free' }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null)
const strs = (v: unknown) => (Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : null)
/** Both endpoints have shipped as a bare array and as `{ items: [...] }`. */
const list = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : isObj(v) && Array.isArray(v.items) ? v.items : null)

function readPlan(v: unknown): ApiPlan | null {
  if (!isObj(v)) return null
  const name = str(v.name)
  const display = str(v.display_name)
  const base = num(v.base_price_irr)
  const disc = num(v.discounted_price_irr)
  const days = num(v.duration_days)
  const gift = num(v.balance_gift_amount_usdmicro)
  const allowed = strs(v.allowed_models)
  if (!name || !display || base === null || disc === null || days === null || gift === null || !allowed) return null
  const features = isObj(v.meta) ? strs(v.meta.features) : null
  return {
    name,
    display_name: display,
    description: typeof v.description === 'string' ? v.description.trim().replace(/^"|"$/g, '').trim() : '',
    base_price_irr: base,
    discounted_price_irr: disc,
    duration_days: days,
    balance_gift_amount_usdmicro: gift,
    allowed_models: allowed,
    meta: { features: features ?? [] },
    is_active: v.is_active !== false,
    is_recommended: v.is_recommended === true,
    is_default: v.is_default === true,
  }
}

function readModel(v: unknown): ApiModel | null {
  if (!isObj(v)) return null
  const name = str(v.name)
  const display = str(v.display_name)
  const owner = str(v.model_owner)
  const inputs = strs(v.supported_inputs)
  const outputs = strs(v.supported_outputs)
  const min = num(v.min_cost)
  const max = num(v.max_cost)
  if (!name || !display || !owner || !inputs || !outputs || min === null || max === null) return null
  return {
    name,
    display_name: display,
    model_owner: owner,
    description: typeof v.description === 'string' ? v.description.trim() : '',
    supported_inputs: inputs,
    supported_outputs: outputs,
    min_cost: min,
    max_cost: max,
  }
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
/** 159 → 150, 2782 → 2700, 22 → 22: a rough figure should not look precise. */
const roughly = (n: number) => {
  if (n < 100) return Math.floor(n)
  const step = 10 ** (String(Math.floor(n)).length - 2)
  return Math.floor(n / step) * step
}

/**
 * How much a plan's credit buys, as a deliberately rough number: the credit divided by the *median* starting price of the
 * models the plan unlocks (the cheapest model alone would promise far more than most people get).
 */
function estimateCapacity(creditUsdMicro: number, allowed: Set<string>, models: ApiModel[]) {
  const by = (kind: 'IMAGE' | 'VIDEO') =>
    models.filter((m) => allowed.has(m.name) && m.supported_outputs.includes(kind) && m.min_cost > 0).map((m) => m.min_cost)
  const images = by('IMAGE')
  const videos = by('VIDEO')
  return {
    images: images.length ? roughly(creditUsdMicro / median(images)) : 0,
    videos: videos.length ? roughly(creditUsdMicro / median(videos)) : 0,
  }
}

const kindOf = (m: ApiModel): ModelKind => (m.supported_outputs.includes('VIDEO') ? 'video' : 'image')
const INPUTS: ModelInput[] = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO']

/**
 * Raw API payloads → what the page renders. Returns null unless there is at least one paid plan and one model, so a
 * malformed or empty response never replaces good data (build fallback and runtime refresh both rely on this).
 */
export function parseLanding(
  rawPlans: unknown,
  rawModels: unknown,
  source: LandingData['source'],
  fetchedAt = new Date().toISOString(),
): LandingData | null {
  const apiPlans = (list(rawPlans) ?? []).map(readPlan).filter((p): p is ApiPlan => p !== null && p.is_active)
  const apiModels = (list(rawModels) ?? []).map(readModel).filter((m): m is ApiModel => m !== null)
  if (!apiModels.length) return null

  const toPlan = (p: ApiPlan): Plan => {
    const priceToman = Math.round(p.discounted_price_irr / 10)
    const wasToman = Math.round(p.base_price_irr / 10)
    const discounted = wasToman > priceToman
    return {
      id: p.name,
      slug: LEGACY_SLUGS[p.name] ?? p.name.toLowerCase(),
      name: p.display_name,
      tagline: p.description,
      priceToman,
      ...(discounted ? { wasToman, offPercent: Math.round(((wasToman - priceToman) / wasToman) * 100) } : {}),
      credits: Math.round(p.balance_gift_amount_usdmicro / 1000),
      durationDays: p.duration_days,
      features: p.meta?.features ?? [],
      recommended: p.is_recommended,
      free: priceToman === 0,
      modelCount: p.allowed_models.length,
      capacity: estimateCapacity(p.balance_gift_amount_usdmicro, new Set(p.allowed_models), apiModels),
    }
  }
  const all = apiPlans.map(toPlan)
  const plans = all.filter((p) => !p.free).sort((a, b) => a.priceToman - b.priceToman)
  if (!plans.length) return null
  const freePlan = all.find((p) => p.free) ?? null

  const models: Model[] = apiModels
    .map((m) => ({
      id: m.name,
      owner: ownerLabel(m.model_owner),
      name: m.display_name,
      description: m.description,
      inputs: INPUTS.filter((i) => m.supported_inputs.includes(i)),
      kind: kindOf(m),
      minCredits: m.min_cost / 1000,
    }))
    .sort((a, b) => (a.kind === b.kind ? a.minCredits - b.minCredits : a.kind === 'image' ? -1 : 1))

  return { plans, freePlan, models, source, fetchedAt }
}

/** Same plans and models (ignores source/fetchedAt): used to skip a pointless re-render after the runtime refresh. */
export const sameLanding = (a: LandingData, b: LandingData) =>
  JSON.stringify([a.plans, a.freePlan, a.models]) === JSON.stringify([b.plans, b.freePlan, b.models])
