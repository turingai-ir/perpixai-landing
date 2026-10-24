import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ACESFilmicToneMapping, PerspectiveCamera, PMREMGenerator, SRGBColorSpace, Vector2 } from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import type { StageControls } from './controls'
import type { MachineState } from './types'
import { createWorld, disposeWorld, type World } from './world'

/**
 * Adaptive quality: 2 = full (DPR ≤ 1.75, bloom), 1 = DPR ≤ 1.25, 0 = DPR 1 without bloom.
 * Stepped down when the frame interval stays long, so weak devices stay smooth instead of janky.
 */
const DPR_CAPS = [1, 1.25, 1.75]

export type StageProps = {
  controls: StageControls
  /** 0..1 loudness of Pixo's voice. */
  levelSource: () => number
  lite: boolean
  yalda: boolean
  badge: { name: string; role: string }
  /** Called when WebGL is lost and does not come back. */
  onContextLost: () => void
  /** Called when the first frame can be shown (shaders compiled): the canvas can fade in. */
  onReady: () => void
}

/** Pixo's WebGL scene, hosted by react-three-fiber (canvas, renderer, resize and frame loop). */
export default function StageCanvas({ lite, ...props }: StageProps) {
  const quality = lite ? 1 : 2
  return (
    <Canvas
      frameloop="never" // started by <Pixo/> once shaders are compiled and the canvas is on screen
      dpr={Math.min(window.devicePixelRatio, DPR_CAPS[quality])}
      resize={{ scroll: false }} // the canvas never moves inside its container; skip re-measuring on every scroll tick
      camera={{ fov: 28, near: 0.1, far: 50, position: [0, 1.15, 4.9] }}
      gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.outputColorSpace = SRGBColorSpace
      }}
    >
      <Pixo lite={lite} startQuality={quality} {...props} />
    </Canvas>
  )
}

/** The character and lights. Created in an effect (not during render) so every GPU resource has an owner to free it. */
function useWorld(yalda: boolean, badge: { name: string; role: string }) {
  const [world, setWorld] = useState<World | null>(null)
  useEffect(() => {
    const w = createWorld({ yalda, badge })
    setWorld(w)
    return () => {
      setWorld(null)
      disposeWorld(w)
    }
  }, [yalda, badge.name, badge.role]) // eslint-disable-line react-hooks/exhaustive-deps
  return world
}

/** Image-based lighting (RoomEnvironment). */
function useEnvironment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    scene.environment = env
    scene.environmentIntensity = 0.55
    return () => {
      scene.environment = null
      env.dispose()
    }
  }, [gl, scene])
}

/**
 * Bloom is part of the look, so the composer stays three's own (UnrealBloom) and takes over rendering.
 * It also follows size and pixel-ratio changes (R3F resizes the renderer and camera aspect itself).
 */
function useComposer(lite: boolean) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const [fx, setFx] = useState<{ composer: EffectComposer; bloom?: UnrealBloomPass } | null>(null)

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))
    let bloom: UnrealBloomPass | undefined
    if (!lite) {
      bloom = new UnrealBloomPass(new Vector2(1, 1), 0.7, 0.45, 0.92)
      composer.addPass(bloom)
    }
    composer.addPass(new OutputPass())
    setFx({ composer, bloom })
    return () => {
      setFx(null)
      composer.dispose()
    }
  }, [gl, scene, camera, lite])

  useEffect(() => {
    const { width: w, height: h } = size
    if (!fx || !w || !h) return
    fx.composer.setPixelRatio(dpr)
    fx.composer.setSize(w, h)
    // Bloom is soft by nature: render it at half resolution (a quarter of the fill cost).
    fx.bloom?.setSize(Math.round((w * dpr) / 2), Math.round((h * dpr) / 2))
    camera.aspect = w / h
    const portrait = w / h < 0.9
    camera.position.set(0, portrait ? 1.45 : 1.15, portrait ? 6.6 : 4.9)
    camera.lookAt(0, portrait ? 1.05 : 0.98, 0)
    camera.updateProjectionMatrix()
  }, [fx, size, dpr, camera])

  return fx
}

/**
 * Compiles every shader before the first frame (so it doesn't stall), then renders only while the canvas
 * is on screen and the tab is visible. `onReady` fires once the first frame can be shown.
 */
function useRenderGate(enabled: boolean, onReady: () => void) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const setFrameloop = useThree((s) => s.setFrameloop)
  const [compiled, setCompiled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [tabHidden, setTabHidden] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let off = false
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => !off && setCompiled(true))
    return () => void (off = true)
  }, [enabled, gl, scene, camera])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(gl.domElement)
    const onVisibility = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [gl])

  useEffect(() => {
    if (compiled) onReady()
  }, [compiled, onReady])

  useEffect(() => setFrameloop(compiled && visible && !tabHidden ? 'always' : 'never'), [compiled, visible, tabHidden, setFrameloop])
}

/**
 * Safari drops WebGL contexts under memory pressure or when the tab is backgrounded. preventDefault lets
 * three.js restore it; only fall back to the still image if it never comes back.
 */
function useContextLoss(onContextLost: () => void) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const canvas = gl.domElement
    let timer = 0
    const lost = (e: Event) => {
      e.preventDefault()
      window.clearTimeout(timer)
      timer = window.setTimeout(onContextLost, 4000)
    }
    const restored = () => window.clearTimeout(timer)
    canvas.addEventListener('webglcontextlost', lost)
    canvas.addEventListener('webglcontextrestored', restored)
    return () => {
      window.clearTimeout(timer)
      canvas.removeEventListener('webglcontextlost', lost)
      canvas.removeEventListener('webglcontextrestored', restored)
    }
  }, [gl, onContextLost])
}

function Pixo({
  controls,
  levelSource,
  lite,
  yalda,
  badge,
  startQuality,
  onContextLost,
  onReady,
}: StageProps & { startQuality: number }) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const setDpr = useThree((s) => s.setDpr)

  const world = useWorld(yalda, badge)
  const fx = useComposer(lite)
  useEnvironment()
  useRenderGate(!!world, onReady)
  useContextLoss(onContextLost)

  const k = useRef({
    state: { power: 0, level: 0, compute: 0, mood: 'neutral', turn: 0 } as MachineState,
    lastYaw: 0,
    targetX: 0,
    pointer: new Vector2(),
    look: new Vector2(),
    gaze: new Vector2(),
    /** Last real pointer movement; without one (touch screens, idle mouse) Pixo looks around on his own. */
    lastPointer: -Infinity,
    quality: startQuality,
    frameEma: 16.7,
    qualityClock: 0,
    perf: { frames: 0, cpu: 0 },
  })

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return // touch drags are scrolling, not looking
      k.current.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
      k.current.lastPointer = performance.now()
    }
    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  // Frame stats, exposed as window.__stage only with ?perf (QA).
  useEffect(() => {
    if (location.search.includes('perf')) Object.assign(window, { __stage: { perf: k.current.perf, info: gl.info } })
  }, [gl])

  /** Step quality down when frames stay slow (not on one-off hitches, not while hidden). */
  const govern = (interval: number) => {
    const g = k.current
    if (interval > 250 || g.quality === 0) return // resumed after a pause, or already at the floor
    g.frameEma += (interval - g.frameEma) * 0.05
    g.qualityClock += interval
    if (g.qualityClock < 2500) return
    g.qualityClock = 0
    if (g.frameEma > 24) {
      g.quality--
      setDpr(Math.min(window.devicePixelRatio, DPR_CAPS[g.quality]))
      if (g.quality === 0 && fx?.bloom) fx.bloom.enabled = false
      g.frameEma = 16.7
    }
  }

  useFrame((_, delta) => {
    if (!world) return
    const t0 = performance.now()
    const dt = Math.min(0.05, delta)
    const g = k.current
    const st = g.state
    const { rig, headRig, head, tesla, outfit } = world

    govern(delta * 1000)
    const t = t0 / 1000

    st.mood = controls.mood
    st.power += (controls.power - st.power) * Math.min(1, dt * 1.6)
    st.compute += (controls.compute - st.compute) * Math.min(1, dt * 3)
    st.level += (levelSource() - st.level) * Math.min(1, dt * 18)

    // Shift into the left half (the RTL text column sits on the right).
    const portrait = camera.aspect < 0.9
    if (controls.layout === 'center' || portrait) g.targetX = 0
    else {
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect
      g.targetX = -halfW * 0.42
    }
    rig.position.x += (g.targetX - rig.position.x) * Math.min(1, dt * 2.2)
    rig.position.y = Math.sin(t * 1.3) * 0.008

    // Head tracks the pointer, with a little life when talking.
    // Follow the mouse; otherwise glance around, and look toward the conversation while talking.
    if (t0 - g.lastPointer < 2500) g.gaze.copy(g.pointer)
    else if (st.level > 0.05) g.gaze.set(0.35 + Math.sin(t * 0.9) * 0.12, -0.1 + Math.sin(t * 1.3) * 0.08)
    else g.gaze.set(Math.sin(t * 0.43) * 0.6 + Math.sin(t * 1.27) * 0.15, Math.sin(t * 0.61) * 0.3)
    g.look.lerp(g.gaze, Math.min(1, dt * 2.5))
    const talk = st.level
    headRig.rotation.y = g.look.x * 0.45 + Math.sin(t * 0.7) * 0.03 + talk * Math.sin(t * 5.3) * 0.05
    headRig.rotation.x = g.look.y * 0.18 + talk * Math.sin(t * 9) * 0.06
    headRig.rotation.z = -g.look.x * 0.04 + talk * Math.sin(t * 3.1) * 0.03 + st.compute * Math.sin(t * 31) * 0.006
    rig.rotation.y = g.look.x * 0.12
    st.turn = dt > 0 ? (headRig.rotation.y - g.lastYaw) / dt : 0
    g.lastYaw = headRig.rotation.y

    head.update(dt, st)
    outfit.update(t, st.level)
    tesla.update(dt, st)
    g.perf.frames++
    g.perf.cpu += performance.now() - t0
  })

  // Priority > 0 hands the render call to us (the composer) instead of R3F's default renderer.render.
  useFrame((_, delta) => fx?.composer.render(Math.min(0.05, delta)), 1)

  if (!world) return null
  return (
    <>
      <primitive object={world.lights} />
      <primitive object={world.rig} />
    </>
  )
}
