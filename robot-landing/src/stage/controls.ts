import type { Mood } from './types'

export type Layout = 'center' | 'side'

/**
 * Bridge between the React conversation and the 3D frame loop. A plain mutable object (no three.js
 * import, so it stays in the main bundle): the conversation sets targets, `StageCanvas` reads them every frame.
 */
export class StageControls {
  /** 'side' = Pixo in the left half (RTL: text on the right). Set by PixoStage from the same media query as the CSS `wide` variant. */
  layout: Layout = 'center'
  mood: Mood = 'neutral'
  /** Target values (0..1) the scene eases towards. */
  power = 0
  compute = 0

  setLayout(layout: Layout) {
    this.layout = layout
  }

  setPowered(on: boolean) {
    this.power = on ? 1 : 0
  }

  /** What the reels show: ؟ while asking, a spiral while thinking, a heart for love. */
  setMood(mood: Mood) {
    this.mood = mood
  }

  setComputing(on: boolean) {
    this.compute = on ? 1 : 0
  }
}
