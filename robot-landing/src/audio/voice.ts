import { config } from '@/config'
import type { Line } from '@/content/dialogue'

/**
 * Plays Pixo's lines and exposes a 0..1 loudness the 3D machine reacts to.
 * When a clip is missing or sound is off, a syllable-like envelope is simulated
 * so the machine still "talks" in sync with the subtitle.
 */
class Voice {
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private master: GainNode | null = null
  private buffers = new Map<string, Promise<AudioBuffer | null>>()
  private source: AudioBufferSourceNode | null = null
  private data = new Uint8Array(256)
  private simulated: { start: number; duration: number } | null = null
  private token = 0
  muted = false
  private listeners = new Set<() => void>()

  /** Sound is actually audible: unlocked by a gesture and not muted. */
  get soundOn() {
    return !!this.ctx && !this.muted
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => void this.listeners.delete(fn)
  }

  private emit() {
    this.listeners.forEach((fn) => fn())
  }

  /** Must be called from a user gesture (browser autoplay policy). */
  unlock() {
    if (this.ctx) return void this.ctx.resume()
    queueMicrotask(() => this.emit())
    const ctx = new AudioContext()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 1
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 512
    this.analyser.connect(this.master)
    this.master.connect(ctx.destination)
  }

  /** One short mechanical clack as the projector starts. No continuous background sound. */
  projector() {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    const len = Math.floor(ctx.sampleRate * 0.2)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    const clack = ctx.createBufferSource()
    clack.buffer = buf
    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 900
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.5, ctx.currentTime)
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    clack.connect(low).connect(env).connect(this.master)
    clack.start()
  }

  setMuted(muted: boolean) {
    this.muted = muted
    this.emit()
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05)
  }

  preload(lines: Line[]) {
    lines.forEach((l) => this.load(l.id))
  }

  private load(id: string) {
    if (!this.buffers.has(id)) {
      const p = fetch(`${config.voiceDir}/${id}.mp3`)
        .then((r) => {
          const type = r.headers.get('content-type') ?? ''
          // Dev servers answer missing files with index.html.
          if (!r.ok || type.includes('text/html')) return null
          return r.arrayBuffer()
        })
        .then((buf) => (buf && this.ctx ? this.ctx.decodeAudioData(buf) : null))
        .catch(() => null)
      this.buffers.set(id, p)
    }
    return this.buffers.get(id)!
  }

  stop() {
    this.token++
    this.source?.stop()
    this.source = null
    this.simulated = null
  }

  /** Resolves when the line has finished (or was interrupted). */
  async say(line: Line): Promise<void> {
    this.stop()
    const token = this.token
    const buffer = this.ctx ? await this.load(line.id) : null
    if (token !== this.token) return

    if (buffer && this.ctx && this.analyser) {
      const src = this.ctx.createBufferSource()
      src.buffer = buffer
      src.connect(this.analyser)
      this.source = src
      return new Promise((resolve) => {
        src.onended = () => resolve()
        src.start()
      })
    }

    // ~14 Persian characters per second of speech.
    const duration = Math.max(1.4, line.text.length / 14)
    this.simulated = { start: performance.now(), duration }
    return new Promise((resolve) =>
      window.setTimeout(() => {
        if (token === this.token) this.simulated = null
        resolve()
      }, duration * 1000),
    )
  }

  /** Current loudness 0..1, read every frame by the stage. */
  level(): number {
    if (this.source && this.analyser) {
      this.analyser.getByteTimeDomainData(this.data)
      let sum = 0
      for (const v of this.data) sum += ((v - 128) / 128) ** 2
      return Math.min(1, Math.sqrt(sum / this.data.length) * 4)
    }
    if (this.simulated) {
      const t = (performance.now() - this.simulated.start) / 1000
      const fade = Math.min(1, t * 4, (this.simulated.duration - t) * 4)
      const syllables = 0.5 + 0.5 * Math.sin(t * 17) * Math.sin(t * 5.3 + 1)
      return Math.max(0, fade * (0.25 + 0.6 * syllables))
    }
    return 0
  }

  get speaking() {
    return !!this.source || !!this.simulated
  }
}

export const voice = new Voice()
