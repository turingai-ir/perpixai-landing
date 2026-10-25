import { season } from './season'

/**
 * "Magic show" demos. Put the generated clips in public/demo/<id>.mp4
 * (and optionally <id>.jpg as poster). The visible chip and prompt are translations:
 * `src/i18n/locales/<lang>/demos.json`, keyed by `id`.
 * Set `ready: true` once the clip is in place; only ready demos are offered.
 */
export const demos = [
  { id: 'paykan-rain', ready: true },
  { id: 'yalda-pomegranate', ready: true },
  { id: 'flying-carpet', ready: true },
] as const

/** Ready demos, with the season's featured clip first. */
export const readyDemos = demos
  .filter((d) => d.ready)
  .sort((a, b) => Number(b.id === season.featuredDemo) - Number(a.id === season.featuredDemo))

export type Demo = (typeof demos)[number]
export type DemoId = Demo['id']
