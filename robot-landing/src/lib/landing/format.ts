import type { TFunction } from 'i18next'
import { localizeDigits } from '@/i18n/format'
import type { LandingData } from './types'

type HomeT = TFunction<'home'>

/** "یک‌ساله" / "یک سال" for 365 days, "یک‌ماهه" / "یک ماه" for 30, otherwise "N روزه" / "N روز". Copy never hard-codes the duration. */
export function durationLabels(days: number, t: HomeT) {
  const key = days === 365 ? 'year' : days === 30 ? 'month' : 'days'
  const opts = { days: localizeDigits(days) }
  return { adj: t(`plans.duration.${key}.adj`, opts), noun: t(`plans.duration.${key}.noun`, opts) }
}

/** The duration most paid plans share: used where the copy speaks about "the plans" in general. */
export function primaryDuration(landing: LandingData) {
  const count = new Map<number, number>()
  for (const p of landing.plans) count.set(p.durationDays, (count.get(p.durationDays) ?? 0) + 1)
  return [...count.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

/** Credits shown to people: whole numbers, but a fraction for tiny prices (4.6, not 5). */
export const roundCredits = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10)
