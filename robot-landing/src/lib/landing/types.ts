/** Raw shapes of the Perpix API (only the fields the landing reads). */
export type ApiPlan = {
  name: string
  display_name: string
  description: string
  base_price_irr: number
  discounted_price_irr: number
  duration_days: number
  /** micro-USD of wallet credit that comes with the plan */
  balance_gift_amount_usdmicro: number
  allowed_models: string[]
  meta?: { features?: string[] }
  is_active: boolean
  is_recommended: boolean
  is_default: boolean
}

export type ApiModel = {
  name: string
  model_owner: string
  display_name: string
  description: string
  supported_inputs: string[]
  supported_outputs: string[]
  /** micro-USD per generation, cheapest and most expensive configuration */
  min_cost: number
  max_cost: number
  tags?: string[]
}

export type ModelInput = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO'
export type ModelKind = 'image' | 'video'

/** What the page renders. All money is already converted: Toman for prices, "credits" (= micro-USD / 1000) for balances. */
export type Plan = {
  /** API plan name, e.g. CREATOR_PLUS */
  id: string
  /** stable id used by analytics: economy | creator | pro | free (falls back to the API name) */
  slug: string
  name: string
  tagline: string
  priceToman: number
  /** price before the discount, only when there is one */
  wasToman?: number
  offPercent?: number
  credits: number
  durationDays: number
  features: string[]
  recommended: boolean
  free: boolean
  modelCount: number
}

export type Model = {
  id: string
  owner: string
  name: string
  description: string
  inputs: ModelInput[]
  kind: ModelKind
  /** starting price per generation, in credits */
  minCredits: number
}

export type LandingData = {
  /** paid plans, cheapest first */
  plans: Plan[]
  /** the default (price 0) plan, if the API has one */
  freePlan: Plan | null
  /** images first, then videos; cheapest first inside each group */
  models: Model[]
  /** where this came from: the live API at build/run time, or the committed snapshot */
  source: 'live' | 'snapshot'
  fetchedAt: string
}
