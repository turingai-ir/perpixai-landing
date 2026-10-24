/**
 * Locales the site is translated into. Add a language: create `locales/<code>/*.json`, register it in
 * `resources.ts`, and add its entry here. Voice lines (`public/audio/<code>/`) are per language too.
 */
export const locales = ['fa'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fa'

export const localeMeta: Record<Locale, { dir: 'rtl' | 'ltr'; ogLocale: string; hreflang: string; digits: 'fa' | 'latn' }> = {
  fa: { dir: 'rtl', ogLocale: 'fa_IR', hreflang: 'fa-IR', digits: 'fa' },
}

export const namespaces = ['ui', 'home', 'dialogue', 'demos', 'season', 'seo'] as const
export type Namespace = (typeof namespaces)[number]
export const defaultNS: Namespace = 'ui'
