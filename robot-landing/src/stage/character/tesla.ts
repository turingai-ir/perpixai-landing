import {
  AdditiveBlending,
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { materials } from '../materials'
import { brand } from '../palette'
import type { MachineState } from '../types'

const TOP_Y = 0.36
const TORUS_R = 0.115

class Helix extends CatmullRomCurve3 {
  constructor(radius: number, height: number, turns: number) {
    const pts: Vector3[] = []
    const steps = turns * 16
    for (let i = 0; i <= steps; i++) {
      const a = (i / 16) * Math.PI * 2
      pts.push(new Vector3(Math.cos(a) * radius, (i / steps) * height, Math.sin(a) * radius))
    }
    super(pts)
  }
}

/** Jagged bolt between two points via displaced midpoints. */
function boltPoints(a: Vector3, b: Vector3, jag: number) {
  const n = 10
  const pts: Vector3[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const p = a.clone().lerp(b, t)
    if (i > 0 && i < n) {
      const amp = jag * Math.sin(Math.PI * t)
      p.add(new Vector3((Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp))
    }
    pts.push(p)
  }
  return pts
}

type Arc = { mesh: Mesh; core: Mesh; life: number; ttl: number }

/** Tesla coil crowning the head, with lightning that answers Pixo's voice. */
export function createTesla() {
  const g = new Group()

  const base = new Mesh(new CylinderGeometry(0.11, 0.13, 0.04, 40), materials.darkMetal)
  base.position.y = 0.02
  g.add(base)

  const core = new Mesh(new CylinderGeometry(0.045, 0.045, 0.3, 24), materials.rubber)
  core.position.y = 0.19
  g.add(core)
  const winding = new Mesh(new TubeGeometry(new Helix(0.05, 0.28, 34), 900, 0.0035, 5), materials.copper)
  winding.position.y = 0.05
  g.add(winding)

  const torus = new Mesh(new TorusGeometry(TORUS_R, 0.034, 24, 72), materials.chrome)
  torus.rotation.x = Math.PI / 2
  torus.position.y = TOP_Y
  g.add(torus)

  const light = new PointLight(brand.cyan, 0, 1.6, 2)
  light.position.y = TOP_Y + 0.05
  g.add(light)

  const glowMat = new MeshBasicMaterial({
    color: brand.purple,
    transparent: true,
    opacity: 0.9,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
  const coreMat = new MeshBasicMaterial({ color: brand.arc, toneMapped: false })

  // A pool of pre-built bolt shapes along +X (unit length). A strike just picks one and orients it:
  // no geometry is created or disposed while Pixo talks, so no GC spikes mid-animation.
  const BOLTS = 18
  const ORIGIN = new Vector3()
  const UNIT_X = new Vector3(1, 0, 0)
  const boltShapes = Array.from({ length: BOLTS }, () => {
    const curve = new CatmullRomCurve3(boltPoints(ORIGIN, UNIT_X, 0.16), false, 'catmullrom', 0)
    return { glow: new TubeGeometry(curve, 28, 0.007, 4), core: new TubeGeometry(curve, 28, 0.0022, 3) }
  })

  const arcs: Arc[] = Array.from({ length: 7 }, () => {
    const mesh = new Mesh(boltShapes[0].glow, glowMat)
    const c = new Mesh(boltShapes[0].core, coreMat)
    mesh.visible = c.visible = false
    g.add(mesh, c)
    return { mesh, core: c, life: 0, ttl: 0 }
  })

  const dir = new Vector3()
  function strike(arc: Arc, reach: number) {
    const a = Math.random() * Math.PI * 2
    const shape = boltShapes[(Math.random() * BOLTS) | 0]
    dir.set(Math.cos(a + (Math.random() - 0.5)), (Math.random() - 0.25) * 0.9, Math.sin(a + (Math.random() - 0.5))).normalize()
    for (const m of [arc.mesh, arc.core]) {
      m.geometry = m === arc.mesh ? shape.glow : shape.core
      m.position.set(Math.cos(a) * (TORUS_R + 0.03), TOP_Y, Math.sin(a) * (TORUS_R + 0.03))
      m.quaternion.setFromUnitVectors(UNIT_X, dir)
      m.scale.set(reach, 1, 1) // stretch along the bolt only; the tube keeps its thickness
      m.rotateX(Math.random() * Math.PI * 2) // spin about its own axis for variety
    }
    arc.ttl = 0.05 + Math.random() * 0.12
    arc.life = 0
    arc.mesh.visible = arc.core.visible = true
  }

  let cooldown = 0

  return {
    group: g,
    update(dt: number, s: MachineState) {
      const energy = s.power * Math.min(1, s.level * 1.3 + s.compute)
      cooldown -= dt
      // Idle: an occasional crackle. Speaking/computing: a storm.
      const rate = s.power * (0.6 + energy * 40)
      if (cooldown <= 0 && s.power > 0.3) {
        const free = arcs.find((x) => !x.mesh.visible)
        if (free) strike(free, 0.12 + energy * 0.38 + Math.random() * 0.08)
        cooldown = 1 / rate
      }
      let active = 0
      for (const arc of arcs) {
        if (!arc.mesh.visible) continue
        arc.life += dt
        if (arc.life > arc.ttl) arc.mesh.visible = arc.core.visible = false
        else active++
      }
      glowMat.color.copy(Math.random() > 0.5 ? brand.magenta : brand.purple).lerp(brand.cyan, Math.random() * 0.6)
      light.color.copy(glowMat.color)
      light.intensity = s.power * (0.05 + active * 0.12 + energy * 0.25) * (0.8 + Math.random() * 0.4)
    },
  }
}
