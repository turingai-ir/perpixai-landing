/**
 * Seasonal dressing for the page and for Pixo. Switch `current` when the season changes;
 * 'none' falls back to the year-round look (usher outfit without the Yalda scarf).
 */
export type SeasonId = 'yalda' | 'none'

export const seasons = {
  yalda: {
    id: 'yalda' as const,
    /** Shown on the gate and the hero marquee. */
    showing: 'اکران ویژه‌ی شب یلدا',
    /** Shown on the gate. Leave empty until Yalda night itself (30 Azar); then e.g. 'یلداتون مبارک'. */
    greeting: '',
    /** Demo shown first in the reel and the magic show. */
    featuredDemo: 'yalda-pomegranate',
  },
  none: { id: 'none' as const, showing: 'اکران امشب', greeting: '', featuredDemo: '' },
}

export const season = seasons.yalda
