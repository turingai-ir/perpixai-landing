import {
  AdditiveBlending,
  Color,
  InstancedMesh,
  Object3D,
  BoxGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { materials } from '../materials'
import { brand } from '../palette'
import { moodTexture, plateTexture, tapeTexture } from '../textures'
import { mergeChildren } from '../merge'
import type { MachineState } from '../types'

const W = 0.96
const H = 0.72
const D = 0.62
const FRONT = D / 2

function reel() {
  const g = new Group()
  const flange = new Mesh(new TorusGeometry(0.15, 0.012, 12, 64), materials.brass)
  g.add(flange)
  for (let i = 0; i < 3; i++) {
    const spoke = new Mesh(new BoxGeometry(0.3, 0.022, 0.012), materials.brass)
    spoke.rotation.z = (i * Math.PI) / 3
    g.add(spoke)
  }
  const wound = new Mesh(new CylinderGeometry(0.1, 0.1, 0.02, 64), materials.paper)
  wound.rotation.x = Math.PI / 2
  wound.position.z = -0.012
  g.add(wound)
  const hub = new Mesh(new CylinderGeometry(0.035, 0.035, 0.05, 24), materials.chrome)
  hub.rotation.x = Math.PI / 2
  g.add(hub)
  mergeChildren(g)
  return g
}

function vacuumTube(color: typeof brand.magenta) {
  const g = new Group()
  const base = new Mesh(new CylinderGeometry(0.045, 0.05, 0.05, 24), materials.darkMetal)
  g.add(base)
  const glass = new Mesh(new CylinderGeometry(0.04, 0.04, 0.2, 24, 1, true), materials.glass)
  glass.position.y = 0.12
  g.add(glass)
  const cap = new Mesh(new CircleGeometry(0.04, 24), materials.glass)
  cap.rotation.x = -Math.PI / 2
  cap.position.y = 0.22
  g.add(cap)
  const filamentMat = new MeshBasicMaterial({ color: color.clone(), toneMapped: false })
  const filament = new Mesh(new CylinderGeometry(0.006, 0.006, 0.14, 8), filamentMat)
  filament.position.y = 0.11
  g.add(filament)
  return { group: g, filamentMat }
}

/** The machine head: Turing tape transport on the face, valves on top, dials on the sides. */
export function createHead() {
  const head = new Group()

  head.add(new Mesh(new RoundedBoxGeometry(W, H, D, 6, 0.08), materials.chassis))

  // Recessed face panel
  const face = new Mesh(new RoundedBoxGeometry(W - 0.1, H - 0.12, 0.02, 4, 0.04), materials.darkMetal)
  face.position.z = FRONT
  head.add(face)

  // Tape transport
  const reels = [reel(), reel()]
  reels.forEach((r, i) => {
    r.position.set(i === 0 ? -0.26 : 0.26, 0.07, FRONT + 0.03)
    head.add(r)
  })

  const tapeTex = tapeTexture()
  const tape = new Mesh(new PlaneGeometry(0.56, 0.06), new MeshStandardMaterial({ map: tapeTex, color: '#8a8070', roughness: 0.8 }))
  tape.position.set(0, -0.04, FRONT + 0.035)
  head.add(tape)

  // Read/write head — Pixo's "eye"
  const rwHead = new Mesh(new RoundedBoxGeometry(0.12, 0.09, 0.06, 3, 0.012), materials.chrome)
  rwHead.position.set(0, -0.04, FRONT + 0.06)
  head.add(rwHead)
  const eyeMat = new MeshBasicMaterial({ color: brand.cyan.clone(), toneMapped: false })
  const eye = new Mesh(new PlaneGeometry(0.08, 0.012), eyeMat)
  eye.position.set(0, -0.04, FRONT + 0.091)
  head.add(eye)
  const eyeLight = new PointLight(brand.cyan, 0, 0.5, 2)
  eyeLight.position.set(0, -0.04, FRONT + 0.16)
  head.add(eyeLight)

  // Level lamps (Pixo's voice meter)
  // One instanced draw for all six lamps; each lamp's colour is an instance colour.
  const LAMPS = 6
  const lamps = new InstancedMesh(new CircleGeometry(0.014, 20), new MeshBasicMaterial({ toneMapped: false }), LAMPS)
  const lampSpot = new Object3D()
  const lampColor = new Color()
  for (let i = 0; i < LAMPS; i++) {
    lampSpot.position.set(-0.125 + i * 0.05, -0.2, FRONT + 0.012)
    lampSpot.updateMatrix()
    lamps.setMatrixAt(i, lampSpot.matrix)
    lamps.setColorAt(i, lampColor.set('#2a2440'))
  }
  head.add(lamps)

  const plate = new Mesh(new PlaneGeometry(0.34, 0.064), new MeshStandardMaterial({ map: plateTexture(), metalness: 0.8, roughness: 0.35 }))
  plate.position.set(0, -0.28, FRONT + 0.012)
  head.add(plate)

  // Side dials
  for (const side of [-1, 1]) {
    const dial = new Group()
    const rim = new Mesh(new TorusGeometry(0.1, 0.014, 12, 48), materials.brass)
    const knob = new Mesh(new CylinderGeometry(0.06, 0.07, 0.05, 32), materials.darkMetal)
    knob.rotation.x = Math.PI / 2
    dial.add(rim, knob)
    dial.rotation.y = (side * Math.PI) / 2
    dial.position.set(side * (W / 2 + 0.005), 0.02, 0)
    head.add(dial)
  }

  // Valves on the top corners
  const valveColors = [brand.magenta, brand.cyan]
  const filaments = [-1, 1].map((side, i) => {
    const t = vacuumTube(valveColors[i])
    t.group.position.set(side * 0.34, H / 2, -0.12)
    t.group.userData.valve = side
    head.add(t.group)
    return t.filamentMat
  })

  // Tesla's handlebar moustache, right under the eye
  const hair = new MeshStandardMaterial({ color: '#b07a45', metalness: 0.7, roughness: 0.35 })
  const moustache = new Group()
  for (const side of [-1, 1]) {
    const curve = new CatmullRomCurve3(
      [
        [0.01, 0],
        [0.07, -0.012],
        [0.13, -0.024],
        [0.172, -0.006],
        [0.176, 0.024],
        [0.155, 0.034],
      ].map(([x, y]) => new Vector3(side * x, y, 0)),
    )
    moustache.add(new Mesh(new TubeGeometry(curve, 32, 0.021, 12), hair))
  }
  const bulge = new Mesh(new SphereGeometry(0.036, 20, 12), hair)
  bulge.scale.set(2, 0.85, 0.75)
  moustache.add(bulge)
  mergeChildren(moustache)
  moustache.position.set(0, -0.112, FRONT + 0.07)
  head.add(moustache)

  // Mood glyphs that light up over the reels: ؟ / spiral / heart
  const moodColors = { ask: brand.cyan, think: brand.purple, love: brand.magenta } as const
  const glyphs = (['ask', 'think', 'love'] as const).map((kind) => {
    const tex = moodTexture(kind)
    const mat = new MeshBasicMaterial({
      map: tex,
      color: moodColors[kind],
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    const planes = [-0.26, 0.26].map((x) => {
      const m = new Mesh(new PlaneGeometry(0.2, 0.2), mat)
      m.position.set(x, 0.07, FRONT + 0.065)
      head.add(m)
      return m
    })
    return { kind, mat, planes }
  })

  // Springy valves: pivot at their base and swing with the head's turns
  const valves = head.children.filter((c) => c.userData.valve)
  const spring = { a: 0, v: 0 }

  let tapeSpeed = 0
  let reelSpin = 0
  let nextBlink = 2
  let blink = 0
  let time = 0

  return {
    group: head,
    /** Top-centre anchor for the Tesla coil, in head space. */
    coilAnchorY: H / 2,
    update(dt: number, s: MachineState) {
      const targetSpeed = s.power * (0.08 + s.level * 0.5 + s.compute * 2.4)
      tapeSpeed += (targetSpeed - tapeSpeed) * Math.min(1, dt * 4)
      tapeTex.offset.x -= tapeSpeed * dt
      reelSpin += tapeSpeed * dt * 9
      reels[0].rotation.z = reelSpin
      reels[1].rotation.z = reelSpin * 0.86

      time += dt
      const glow = s.power * (0.35 + s.level * 1.6 + s.compute * 0.8 * (0.5 + 0.5 * Math.sin(time * 22)))
      eyeMat.color.copy(brand.cyan).multiplyScalar(0.15 + glow)
      eyeLight.intensity = glow * 0.06

      // Blink every few seconds
      nextBlink -= dt
      if (nextBlink <= 0) {
        blink = 0.14
        nextBlink = 2.5 + Math.random() * 3.5
      }
      blink = Math.max(0, blink - dt)
      eye.scale.y = blink > 0 ? 0.12 : 1

      // Moustache bounces with speech
      moustache.position.y = -0.112 - s.level * 0.012 * Math.abs(Math.sin(time * 14))
      moustache.rotation.z = Math.sin(time * 9) * s.level * 0.05
      moustache.scale.x = 1 + s.level * 0.06

      // Mood glyphs fade in over the reels
      glyphs.forEach((gl) => {
        const target = s.power > 0.5 && s.mood === gl.kind ? 1 : 0
        gl.mat.opacity += (target - gl.mat.opacity) * Math.min(1, dt * 6)
        if (gl.kind === 'think') gl.planes.forEach((p) => (p.rotation.z -= dt * 4))
        if (gl.kind === 'love') gl.planes.forEach((p) => p.scale.setScalar(1 + Math.sin(time * 8) * 0.08))
      })

      // Valves: damped spring pushed by the head's yaw
      spring.v += (-spring.a * 90 - spring.v * 7 - s.turn * 6) * dt
      spring.a += spring.v * dt
      valves.forEach((v) => (v.rotation.z = spring.a + Math.sin(time * 1.7 + v.userData.valve) * 0.02))

      const lit = Math.round(s.level * LAMPS + s.compute * 3 * Math.random())
      for (let i = 0; i < LAMPS; i++) {
        const on = s.power > 0.5 && i < lit
        lamps.setColorAt(i, lampColor.copy(on ? brand.magenta : brand.purple).multiplyScalar(on ? 1.6 : 0.12))
      }
      lamps.instanceColor!.needsUpdate = true
      filaments.forEach((m, i) => {
        const flicker = 0.85 + Math.random() * 0.15
        m.color.copy(valveColors[i]).multiplyScalar(s.power * (0.6 + s.compute * 0.8) * flicker)
      })
    },
  }
}
