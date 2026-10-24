import faDemos from './locales/fa/demos.json'
import faDialogue from './locales/fa/dialogue.json'
import faHome from './locales/fa/home.json'
import faSeason from './locales/fa/season.json'
import faSeo from './locales/fa/seo.json'
import faUi from './locales/fa/ui.json'
import type { Locale } from './config'

export const resources = {
  fa: { ui: faUi, home: faHome, dialogue: faDialogue, demos: faDemos, season: faSeason, seo: faSeo },
} satisfies Record<Locale, unknown>
