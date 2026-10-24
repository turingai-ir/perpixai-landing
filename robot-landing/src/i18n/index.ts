import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { defaultLocale, defaultNS, namespaces } from './config'
import { resources } from './resources'

/**
 * The one i18next instance. Resources are bundled and init is synchronous, so the server
 * (static export) and the browser render the same text on the first pass: no hydration mismatch.
 * Non-React code (dialogue, SEO, route handlers) uses `i18n.t` / `i18n.getFixedT(locale, ns)`.
 */
const i18n = i18next.createInstance()

void i18n.use(initReactI18next).init({
  resources,
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  supportedLngs: Object.keys(resources),
  ns: [...namespaces],
  defaultNS,
  initAsync: false,
  interpolation: { escapeValue: false }, // React escapes
  returnNull: false,
})

export { i18n }
