import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  PMREMGenerator,
  SpotLight,
  SRGBColorSpace,
  Texture,
  Vector2,
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
import { createOutfit } from './character/outfit'
import type { StageControls } from './controls'
import { brand } from './palette'
import type { MachineState } from './types'

const HEAD_Y = 1.1
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
  /** Called once the renderer exists (the canvas can fade in). */
  onCreated: () => void
}

/** Pixo's WebGL scene, hosted by react-three-fiber (canvas, renderer, resize and frame loop). */
export default function StageCanvas({ lite, ...props }: StageProps) {
  const quality = lite ? 1 : 2
  return (
    <Canvas
      frameloop="never" // started by <Pixo/> once shaders are compiled and the canvas is on screen
      dpr={Math.min(window.devicePixelRatio, DPR_CAPS[quality])}
      camera={{ fov: 28, near: 0.1, far: 50, position: [0, 1.15, 4.9] }}
      gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.outputColorSpace = SRGBColorSpace
        props.onCreated()
      }}
    >
      <Pixo lite={lite} startQuality={quality} {...props} />
    </Canvas>
  )
}

function buildWorld(yalda: boolean, badge: { name: string; role: string }) {
  const outfit = createOutfit({ yalda, badge })
  const head = createHead()
  const tesla = createTesla()
  const rig = new Group()
  const headRig = new Group()
  rig.add(createBody(), outfit.group, createCables(HEAD_Y - 0.36 + 0.02))
  headRig.position.y = HEAD_Y
  headRig.add(head.group)
  tesla.group.position.y = head.coilAnchorY
  headRig.add(tesla.group)
  rig.add(headRig)

  const hemi = new HemisphereLight('#c9c3ff', '#0a0710', 0.5)
  const key = new DirectionalLight('#fff4ea', 1.05)
  key.position.set(1.5, 3, 4)
  const rimL = new SpotLight(brand.magenta, 28, 12, 0.6, 0.8)
  rimL.position.set(-3.2, 2.4, -2.2)
  rimL.target.position.set(0, 1, 0)
  const rimR = new SpotLight(brand.cyan, 26, 12, 0.6, 0.8)
  rimR.position.set(3.2, 2, -2)
  rimR.target.position.set(0, 1, 0)
  const lights = new Group()
  lights.add(hemi, key, rimL, rimL.target, rimR, rimR.target)

  return { outfit, head, tesla, rig, headRig, lights }
}

function Pixo({
  controls,
  levelSource,
  lite,
  yalda,
  badge,
  startQuality,
  onContextLost,
}: StageProps & { startQuality: number }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const setDpr = useThree((s) => s.setDpr)
  const setFrameloop = useThree((s) => s.setFrameloop)

  const world = useMemo(() => buildWorld(yalda, badge), [yalda, badge.name, badge.role]) // eslint-disable-line react-hooks/exhaustive-deps

  // Bloom is part of the look, so the composer stays three's own (UnrealBloom) and takes over rendering.
  const fx = useMemo(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))
    let bloom: UnrealBloomPass | undefined
    if (!lite) {
      bloom = new UnrealBloomPass(new Vector2(1, 1), 0.7, 0.45, 0.92)
      composer.addPass(bloom)
    }
    composer.addPass(new OutputPass())
    return { composer, bloom }
  }, [gl, scene, camera, lite])

  const s = useRef({
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
  const [ready, setReady] = useState(false) // shaders compiled
  const [visible, setVisible] = useState(true)
  const [hidden, setHidden] = useState(false) // tab hidden

  // Image-based lighting (RoomEnvironment), as before.
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

  // Compile every shader before the first frame, so the first visible frames don't stall.
  useEffect(() => {
    let off = false
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => !off && setReady(true))
    return () => void (off = true)
  }, [gl, scene, camera, world])

  // Render only while shaders are ready, the canvas is on screen and the tab is visible.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(gl.domElement)
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [gl])
  useEffect(() => setFrameloop(ready && visible && !hidden ? 'always' : 'never'), [ready, visible, hidden, setFrameloop])

  // Safari drops WebGL contexts under memory pressure or when the tab is backgrounded. preventDefault lets
  // three.js restore it; only fall back to the still image if it never comes back.
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

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return // touch drags are scrolling, not looking
      s.current.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
      s.current.lastPointer = performance.now()
    }
    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  // Frame stats, exposed as window.__stage only with ?perf (QA).
  useEffect(() => {
    if (location.search.includes('perf')) Object.assign(window, { __stage: { perf: s.current.perf, info: gl.info } })
  }, [gl])

  // Size / pixel ratio changes (R3F resizes the renderer and camera aspect; the composer and framing follow).
  useEffect(() => {
    const { width: w, height: h } = size
    if (!w || !h) return
    fx.composer.setPixelRatio(dpr)
    fx.composer.setSize(w, h)
    // Bloom is soft by nature: render it at half resolution (a quarter of the fill cost).
    fx.bloom?.setSize(Math.round((w * dpr) / 2), Math.round((h * dpr) / 2))
    camera.aspect = w / h
    const portrait = w / h < 0.9
    camera.position.set(0, portrait ? 1.45 : 1.15, portrait ? 6.6 : 4.9)
    camera.lookAt(0, portrait ? 1.05 : 0.98, 0)
    camera.updateProjectionMatrix()
  }, [size, dpr, fx, camera])

  // Free GPU resources (R3F does not dispose objects handed over as <primitive>).
  useEffect(
    () => () => {
      world.rig.traverse((o) => {
        const m = o as Mesh
        m.geometry?.dispose()
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
        mats.forEach((mat) => {
          Object.values(mat).forEach((v) => (v as Texture)?.isTexture && (v as Texture).dispose())
          mat.dispose()
        })
      })
    },
    [world],
  )
  useEffect(() => () => fx.composer.dispose(), [fx])

  useFrame((_, delta) => {
    const t0 = performance.now()
    const now = t0
    const interval = delta * 1000
    const dt = Math.min(0.05, delta)
    const c = controls
    const k = s.current
    const st = k.state
    const { rig, headRig, head, tesla, outfit } = world

    govern(interval)
    const t = now / 1000

    st.mood = c.mood
    st.power += (c.power - st.power) * Math.min(1, dt * 1.6)
    st.compute += (c.compute - st.compute) * Math.min(1, dt * 3)
    st.level += (levelSource() - st.level) * Math.min(1, dt * 18)

    // Shift into the left half (the RTL text column sits on the right).
    const portrait = camera.aspect < 0.9
    if (c.layout === 'center' || portrait) k.targetX = 0
    else {
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect
      k.targetX = -halfW * 0.42
    }
    rig.position.x += (k.targetX - rig.position.x) * Math.min(1, dt * 2.2)
    rig.position.y = Math.sin(t * 1.3) * 0.008

    // Head tracks the pointer, with a little life when talking.
    // Follow the mouse; otherwise glance around, and look toward the conversation while talking.
    if (now - k.lastPointer < 2500) k.gaze.copy(k.pointer)
    else if (st.level > 0.05) k.gaze.set(0.35 + Math.sin(t * 0.9) * 0.12, -0.1 + Math.sin(t * 1.3) * 0.08)
    else k.gaze.set(Math.sin(t * 0.43) * 0.6 + Math.sin(t * 1.27) * 0.15, Math.sin(t * 0.61) * 0.3)
    k.look.lerp(k.gaze, Math.min(1, dt * 2.5))
    const talk = st.level
    headRig.rotation.y = k.look.x * 0.45 + Math.sin(t * 0.7) * 0.03 + talk * Math.sin(t * 5.3) * 0.05
    headRig.rotation.x = k.look.y * 0.18 + talk * Math.sin(t * 9) * 0.06
    headRig.rotation.z = -k.look.x * 0.04 + talk * Math.sin(t * 3.1) * 0.03 + st.compute * Math.sin(t * 31) * 0.006
    rig.rotation.y = k.look.x * 0.12
    st.turn = dt > 0 ? (headRig.rotation.y - k.lastYaw) / dt : 0
    k.lastYaw = headRig.rotation.y

    head.update(dt, st)
    outfit.update(t, st.level)
    tesla.update(dt, st)
    k.perf.frames++
    k.perf.cpu += performance.now() - t0
  })

  // Priority > 0 hands the render call to us (the composer) instead of R3F's default renderer.render.
  useFrame((_, delta) => fx.composer.render(Math.min(0.05, delta)), 1)

  /** Step quality down when frames stay slow (not on one-off hitches, not while hidden). */
  function govern(interval: number) {
    const k = s.current
    if (interval > 250 || k.quality === 0) return // resumed after a pause, or already at the floor
    k.frameEma += (interval - k.frameEma) * 0.05
    k.qualityClock += interval
    if (k.qualityClock < 2500) return
    k.qualityClock = 0
    if (k.frameEma > 24) {
      k.quality--
      setDpr(Math.min(window.devicePixelRatio, DPR_CAPS[k.quality]))
      if (k.quality === 0 && fx.bloom) fx.bloom.enabled = false
      k.frameEma = 16.7
    }
  }

  return (
    <>
      <primitive object={world.lights} />
      <primitive object={world.rig} />
    </>
  )
}
