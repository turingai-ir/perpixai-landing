/** What Pixo's face shows: reels turn into a symbol for the moment. */
export type Mood = 'neutral' | 'ask' | 'think' | 'love'

/** Per-frame drive values for the machine. */
export type MachineState = {
  /** Powered on (fades in on activation), 0..1. */
  power: number
  /** Voice loudness, 0..1. */
  level: number
  /** "Generating" intensity, 0..1. */
  compute: number
  mood: Mood
  /** Head yaw velocity (rad/s) — drives the springy valves. */
  turn: number
}
