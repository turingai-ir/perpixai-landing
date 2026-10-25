/**
 * Seasonal dressing for the page and for Pixo. Switch `season` when the season changes;
 * 'none' falls back to the year-round look (usher outfit without the Yalda scarf).
 * The gate/marquee copy (`showing`, `greeting`) is translated: `locales/<lang>/season.json`, keyed by id.
 */
export type SeasonId = 'yalda' | 'none'

export const seasons = {
  yalda: {
    id: 'yalda' as const,
    /** Demo shown first in the reel and the magic show. */
    featuredDemo: 'yalda-pomegranate',
  },
  none: { id: 'none' as const, featuredDemo: 'paykan-rain' },
}

export const season: (typeof seasons)[SeasonId] = seasons.none
