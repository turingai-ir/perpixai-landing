import { i18n } from './index'
import { localeMeta, type Locale } from './config'
import { toFa } from '@/lib/digits'

const current = () => (i18n.language in localeMeta ? (i18n.language as Locale) : 'fa')

/** 1882800 → "۱,۸۸۲,۸۰۰" in Persian, "1,882,800" in Latin-digit locales. */
export function formatNumber(n: number, locale: Locale = current()) {
  const s = n.toLocaleString('en-US')
  return localeMeta[locale].digits === 'fa' ? toFa(s) : s
}

/** Digits in the current locale's numeral system (counters, years, step numbers). */
export function localizeDigits(v: string | number, locale: Locale = current()) {
  return localeMeta[locale].digits === 'fa' ? toFa(v) : String(v)
}
