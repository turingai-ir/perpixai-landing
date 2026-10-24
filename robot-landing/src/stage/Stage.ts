import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  Texture,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SpotLight,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { createBody } from './character/body'
import { createHead } from './character/head'
import { createTesla } from './character/tesla'
import { createCables } from './character/cables'
import { createOutfit, type Outfit } from './character/outfit'
import { brand } from './palette'
import type { MachineState, Mood } from './types'

export type Layout = 'center' | 'side'

const HEAD_Y = 1.1

/**
 * Owns the WebGL scene for Pixo. React only calls the small public API:
 * setPowered / setComputing / setLayout, and supplies a voice level source.
 */
export class Stage {
  private renderer: WebGLRenderer
  private composer: EffectComposer
  private scene = new Scene()
  private camera = new PerspectiveCamera(28, 1, 0.1, 50)
  private rig = new Group()
  private headRig = new Group()
  private head = createHead()
  private tesla = createTesla()
  private outfit: Outfit
  private state: MachineState = { power: 0, level: 0, compute: 0, mood: 'neutral', turn: 0 }
  private lastYaw = 0
  private target = { power: 0, compute: 0, x: 0 }
  private pointer = new Vector2()
  private look = new Vector2()
  private gaze = new Vector2()
  /** Last real pointer movement; without one (touch screens, idle mouse) Pixo looks around on his own. */
  private lastPointer = -Infinity
  private lostTimer = 0
  private bloom?: UnrealBloomPass
  /**
   * Adaptive quality: 2 = full (DPR ≤ 1.75, bloom), 1 = DPR ≤ 1.25, 0 = DPR 1 without bloom.
   * Stepped down when the frame interval stays long, so weak devices stay smooth instead of janky.
   */
  private quality = 2
  /** True once shaders are compiled; nothing renders before. */
  private ready = false
  private frameEma = 16.7
  private qualityClock = 0
  private dprCaps = [1, 1.25, 1.75]
  /** Frame stats, exposed as window.__stage only with ?perf (QA). */
  perf = { frames: 0, cpu: 0 }
  get info() {
    return this.renderer.info
  }
  private layout: Layout = 'center'
  private raf = 0
  private last = performance.now()
  private visible = true
  private io: IntersectionObserver
  private ro: ResizeObserver

  constructor(
    private canvas: HTMLCanvasElement,
    private levelSource: () => number,
    opts: { lite: boolean; yalda?: boolean; badge: { name: string; role: string }; onContextLost?: () => void },
  ) {
    this.outfit = createOutfit({ yalda: !!opts.yalda, badge: opts.badge })
    if (location.search.includes('perf')) Object.assign(window, { __stage: this })
    this.renderer = new WebGLRenderer({ canvas, antialias: !opts.lite, alpha: true, powerPreference: 'high-performance' })
    if (opts.lite) this.quality = 1
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.dprCaps[this.quality]))
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.outputColorSpace = SRGBColorSpace

    const pmrem = new PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.55

    this.buildLights()
    this.buildCharacter()

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    if (!opts.lite) {
      this.bloom = new UnrealBloomPass(new Vector2(1, 1), 0.7, 0.45, 0.92)
      this.composer.addPass(this.bloom)
    }
    this.composer.addPass(new OutputPass())

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      if (this.visible) this.loop()
    })
    this.io.observe(canvas)

    canvas.addEventListener('webglcontextlost', this.onContextLost)
    canvas.addEventListener('webglcontextrestored', this.onContextRestored)
    this.contextLostCb = opts.onContextLost
    document.addEventListener('visibilitychange', this.onVisibility)
    window.addEventListener('pointermove', this.onPointer)
    this.resize()
    // Compile every shader before the first frame (in parallel where the browser allows),
    // so the first visible frames don't stall while programs build.
    this.renderer
      .compileAsync(this.scene, this.camera)
      .catch(() => undefined)
      .then(() => {
        this.ready = true
        this.loop()
      })
  }

  private buildLights() {
    this.scene.add(new HemisphereLight('#c9c3ff', '#0a0710', 0.5))
    const key = new DirectionalLight('#fff4ea', 1.05)
    key.position.set(1.5, 3, 4)
    const rimL = new SpotLight(brand.magenta, 28, 12, 0.6, 0.8)
    rimL.position.set(-3.2, 2.4, -2.2)
    rimL.target.position.set(0, 1, 0)
    const rimR = new SpotLight(brand.cyan, 26, 12, 0.6, 0.8)
    rimR.position.set(3.2, 2, -2)
    rimR.target.position.set(0, 1, 0)
    this.scene.add(key, rimL, rimL.target, rimR, rimR.target)
  }

  private buildCharacter() {
    const headBottom = HEAD_Y - 0.36
    this.rig.add(createBody(), this.outfit.group, createCables(headBottom + 0.02))
    this.headRig.position.y = HEAD_Y
    this.headRig.add(this.head.group)
    this.tesla.group.position.y = this.head.coilAnchorY
    this.headRig.add(this.tesla.group)
    this.rig.add(this.headRig)
    this.scene.add(this.rig)
  }

  private contextLostCb?: () => void

  /**
   * Safari drops WebGL contexts under memory pressure or when the tab is backgrounded.
   * preventDefault lets three.js restore it; only fall back to the still image if it never comes back.
   */
  private onContextLost = (e: Event) => {
    e.preventDefault()
    cancelAnimationFrame(this.raf)
    window.clearTimeout(this.lostTimer)
    this.lostTimer = window.setTimeout(() => this.contextLostCb?.(), 4000)
  }

  private onContextRestored = () => {
    window.clearTimeout(this.lostTimer)
    this.resize()
    this.loop()
  }

  /** Never render while the tab is hidden. */
  private onVisibility = () => {
    if (!document.hidden) this.loop()
  }

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return // touch drags are scrolling, not looking
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    this.lastPointer = performance.now()
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.composer.setSize(w, h)
    // Bloom is soft by nature: render it at half resolution (a quarter of the fill cost).
    const pr = this.renderer.getPixelRatio()
    this.bloom?.setSize(Math.round((w * pr) / 2), Math.round((h * pr) / 2))
    this.camera.aspect = w / h
    const portrait = w / h < 0.9
    this.camera.position.set(0, portrait ? 1.45 : 1.15, portrait ? 6.6 : 4.9)
    this.camera.lookAt(0, portrait ? 1.05 : 0.98, 0)
    this.camera.updateProjectionMatrix()
    this.applyLayout()
  }

  private applyLayout() {
    const portrait = this.camera.aspect < 0.9
    if (this.layout === 'center' || portrait) return void (this.target.x = 0)
    // Shift into the left half (the RTL text column sits on the right).
    const dist = this.camera.position.z
    const halfW = Math.tan((this.camera.fov * Math.PI) / 360) * dist * this.camera.aspect
    this.target.x = -halfW * 0.42
  }

  setLayout(layout: Layout) {
    this.layout = layout
    this.applyLayout()
  }

  setPowered(on: boolean) {
    this.target.power = on ? 1 : 0
  }

  /** What the reels show: ؟ while asking, a spiral while thinking, a heart for love. */
  setMood(mood: Mood) {
    this.state.mood = mood
  }

  setComputing(on: boolean) {
    this.target.compute = on ? 1 : 0
  }

  private loop = () => {
    cancelAnimationFrame(this.raf)
    if (!this.ready || !this.visible || document.hidden) return
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now()
    const interval = now - this.last
    const dt = Math.min(0.05, interval / 1000)
    this.last = now
    this.govern(interval)
    const t = now / 1000
    const s = this.state

    s.power += (this.target.power - s.power) * Math.min(1, dt * 1.6)
    s.compute += (this.target.compute - s.compute) * Math.min(1, dt * 3)
    s.level += (this.levelSource() - s.level) * Math.min(1, dt * 18)

    this.rig.position.x += (this.target.x - this.rig.position.x) * Math.min(1, dt * 2.2)
    this.rig.position.y = Math.sin(t * 1.3) * 0.008

    // Head tracks the pointer, with a little life when talking.
    // Follow the mouse; otherwise glance around, and look toward the conversation while talking.
    if (now - this.lastPointer < 2500) this.gaze.copy(this.pointer)
    else if (s.level > 0.05) this.gaze.set(0.35 + Math.sin(t * 0.9) * 0.12, -0.1 + Math.sin(t * 1.3) * 0.08)
    else this.gaze.set(Math.sin(t * 0.43) * 0.6 + Math.sin(t * 1.27) * 0.15, Math.sin(t * 0.61) * 0.3)
    this.look.lerp(this.gaze, Math.min(1, dt * 2.5))
    const talk = s.level
    this.headRig.rotation.y = this.look.x * 0.45 + Math.sin(t * 0.7) * 0.03 + talk * Math.sin(t * 5.3) * 0.05
    this.headRig.rotation.x = this.look.y * 0.18 + talk * Math.sin(t * 9) * 0.06
    this.headRig.rotation.z = -this.look.x * 0.04 + talk * Math.sin(t * 3.1) * 0.03 + s.compute * Math.sin(t * 31) * 0.006
    this.rig.rotation.y = this.look.x * 0.12
    s.turn = dt > 0 ? (this.headRig.rotation.y - this.lastYaw) / dt : 0
    this.lastYaw = this.headRig.rotation.y

    this.head.update(dt, s)
    this.outfit.update(t, s.level)
    this.tesla.update(dt, s)
    this.composer.render(dt)
    this.perf.frames++
    this.perf.cpu += performance.now() - now
  }

  /** Step quality down when frames stay slow (not on one-off hitches, not while hidden). */
  private govern(interval: number) {
    if (interval > 250 || this.quality === 0) return // resumed after a pause, or already at the floor
    this.frameEma += (interval - this.frameEma) * 0.05
    this.qualityClock += interval
    if (this.qualityClock < 2500) return
    this.qualityClock = 0
    if (this.frameEma > 24) {
      this.quality--
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.dprCaps[this.quality]))
      if (this.quality === 0 && this.bloom) this.bloom.enabled = false
      this.resize()
      this.frameEma = 16.7
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.io.disconnect()
    this.ro.disconnect()
    window.removeEventListener('pointermove', this.onPointer)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored)
    window.clearTimeout(this.lostTimer)
    this.scene.traverse((o) => {
      const m = o as Mesh
      m.geometry?.dispose()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      mats.forEach((mat) => {
        Object.values(mat).forEach((v) => (v as Texture)?.isTexture && (v as Texture).dispose())
        mat.dispose()
      })
    })
    this.scene.environment?.dispose()
    this.composer.dispose()
    this.renderer.dispose()
  }
}
