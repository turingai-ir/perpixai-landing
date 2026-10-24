import { Color } from 'three'
import { colors } from '@/styles/tokens'

/** The logo gradient as three.js colours (same values as the CSS brand tokens). */
export const brand = {
  magenta: new Color(colors.magenta),
  purple: new Color(colors.purple),
  blue: new Color(colors.blue),
  cyan: new Color(colors.cyan),
  arc: new Color('#bfe9ff'), // Tesla arc: ice white-blue
}

/**
 * Material colours of the 3D scene, by role. These describe physical materials (brass, velvet, skin)
 * under scene lighting, so they are a palette of their own and not UI tokens.
 */
export const paint = {
  // Lights
  keyLight: '#fff4ea',
  skyLight: '#c9c3ff',
  groundLight: '#0a0710',
  white: '#ffffff',

  // Metals
  chassis: '#17151f',
  brass: '#c9a25a',
  brassDeep: '#6d5226',
  brassInk: '#1c140a',
  copper: '#b8653a',
  chrome: '#d9dde6',
  darkMetal: '#2a2833',
  rubber: '#0b0b0e',
  goldPolished: '#e0b25e',
  moustache: '#b07a45',

  // Name badge
  badgeDeep: '#8a6a2c',
  badgeGold: '#e2c27a',
  badgeInk: '#2a1a08',

  // Paper tape and lamps
  paper: '#8f7f62',
  tapeTint: '#8a8070',
  tapeSheet: '#efe6cf',
  tapeInk: '#2a1d12',
  tapeGrain: 'rgba(60,40,20,0.35)', // fibre lines drawn on the tape texture
  lampOff: '#2a2440',

  // Cloth and skin
  fabric: '#15131d',
  fabricSheen: '#4d3f86',
  skin: '#c6957c',
  skinSheen: '#ffd1bd',
  shirt: '#b9b0a2',
  velvet: '#3a0714',
  velvetSheen: '#a8324f',
  bowBase: '#2a0a2a',

  // Yalda: scarf, knit, pomegranate
  knit: '#9c9c9c',
  yarn: '#f3e3c3',
  pomegranate: '#c2142f',
  scarfRed: '#a3112c',
  scarfCream: '#d9c39b',
  scarfShade: '#5c0716',
  scarfGlow: '#ff4a5e',
  scarfGold: '#ffd36b',
  scarfFold: 'rgba(0,0,0,0.12)', // soft shadow between knit rows
} as const
