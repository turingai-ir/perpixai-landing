import type { IconName } from '@/ui/icons.data'

/**
 * Language-neutral data for the sections below the conversation. All copy lives in
 * `src/i18n/locales/<lang>/home.json` (keyed by these ids); only numbers, ids and icons stay here.
 * Prices (Toman) are from the Perpix plans page, Oct 2026.
 */

export const toolItems: { id: 'image' | 'video' | 'edit' | 'models'; icon: IconName }[] = [
  { id: 'image', icon: 'image' },
  { id: 'video', icon: 'video' },
  { id: 'edit', icon: 'magic' },
  { id: 'models', icon: 'cpu' },
]

export type Plan = {
  id: 'economy' | 'creator' | 'pro'
  /** Toman */
  price: number
  /** Price before the discount, Toman */
  was?: number
  /** Discount, percent */
  off?: number
  /** Gift tokens */
  tokens: number
  featured?: boolean
}

export const plans: Plan[] = [
  { id: 'economy', price: 564840, tokens: 2000 },
  { id: 'creator', price: 1882800, was: 1941638, off: 3, tokens: 6840, featured: true },
  { id: 'pro', price: 3765600, was: 3953880, off: 5, tokens: 13910 },
]

/** Id of the clip shown in the pinned "prompt → film" section. */
export const filmDemoId = 'yalda-pomegranate'
