import faContact from './locales/fa/contact.json'
import faDemos from './locales/fa/demos.json'
import faDialogue from './locales/fa/dialogue.json'
import faHome from './locales/fa/home.json'
import faPrivacy from './locales/fa/privacy.json'
import faSeason from './locales/fa/season.json'
import faSeo from './locales/fa/seo.json'
import faTerms from './locales/fa/terms.json'
import faUi from './locales/fa/ui.json'
import type { Locale } from './config'

/** Declared by hand: the JSON's inferred array-of-objects type makes i18next's key types too deep for the compiler (TS2589). */
/** Terms and privacy share one document shape (rendered by sections/LegalPage). */
type LegalCopy = {
  meta: { title: string; description: string }
  eyebrow: string
  title: string
  intro: string
  updated: string
  tocLabel: string
  back: string
  sections: { title: string; lead: string[]; note: string[]; items: string[]; tail: string[] }[]
  contact: { before: string; email: string; after: string }
}

export const resources = {
  fa: {
    ui: faUi,
    home: faHome,
    dialogue: faDialogue,
    demos: faDemos,
    season: faSeason,
    seo: faSeo,
    terms: faTerms satisfies LegalCopy as LegalCopy,
    contact: faContact,
    privacy: faPrivacy satisfies LegalCopy as LegalCopy,
  },
} satisfies Record<Locale, unknown>
