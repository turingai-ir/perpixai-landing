import {
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { brand } from '../palette'
import { badgeTexture, scarfTexture } from '../textures'
import { mergeChildren } from '../merge'

/** Old-cinema usher: maroon velvet, brass, a neon bow tie. */
export const velvet = new MeshPhysicalMaterial({
  color: '#3a0714',
  roughness: 0.9,
  sheen: 0.45,
  sheenColor: '#a8324f',
  sheenRoughness: 0.5,
})
const shirt = new MeshStandardMaterial({ color: '#b9b0a2', roughness: 0.85 })
const gold = new MeshStandardMaterial({ color: '#e0b25e', metalness: 1, roughness: 0.25 })
const neonBow = new MeshStandardMaterial({ color: '#2a0a2a', emissive: brand.magenta, emissiveIntensity: 1.6, roughness: 0.4 })

/** Front surface of the torso at height y (body space), from the lathe profile × z-scale. */
const frontZ = (y: number) => 0.56 * (y > 0.05 ? 0.48 - (y - 0.05) * 2.4 : 0.6 + Math.min(0.05, -y * 0.25))

export type Outfit = { group: Group; bow: Group; update(t: number, level: number): void }

export function createOutfit({ yalda }: { yalda: boolean }): Outfit {
  const g = new Group()

  // Shirt collar band above the jacket
  const collar = new Mesh(new CylinderGeometry(0.15, 0.18, 0.26, 48), shirt)
  collar.position.y = 0.38
  g.add(collar)

  // Brass buttons down the front
  for (const y of [-0.08, -0.22]) {
    const b = new Mesh(new CylinderGeometry(0.022, 0.022, 0.012, 24), gold)
    b.rotation.x = Math.PI / 2
    b.position.set(0, y, frontZ(y) + 0.008)
    g.add(b)
  }

  // Epaulettes with a gold fringe
  for (const side of [-1, 1]) {
    const ep = new Group()
    const board = new Mesh(new CylinderGeometry(0.11, 0.12, 0.025, 32), gold)
    board.scale.set(1.2, 1, 0.75)
    ep.add(board)
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * 0.15 + (i / 8) * Math.PI * 0.7
      const f = new Mesh(new CylinderGeometry(0.006, 0.006, 0.06, 6), gold)
      f.position.set(Math.cos(a) * 0.13 * side, -0.035, Math.sin(a) * 0.09 - 0.04)
      ep.add(f)
    }
    mergeChildren(ep)
    ep.position.set(side * 0.66, 0.03, 0)
    ep.rotation.z = side * -0.32
    g.add(ep)
  }

  // Name badge on the chest
  const badge = new Mesh(
    new PlaneGeometry(0.17, 0.064),
    new MeshStandardMaterial({ map: badgeTexture('پیکسو', 'کنترلچی سالن ۱'), metalness: 0.6, roughness: 0.35 }),
  )
  badge.position.set(-0.3, -0.06, frontZ(-0.06) + 0.012)
  badge.rotation.y = -0.18
  g.add(badge)

  // Neon bow tie at the collar
  const bow = new Group()
  for (const side of [-1, 1]) {
    const wing = new Mesh(new ConeGeometry(0.045, 0.09, 4), neonBow)
    wing.rotation.z = (side * Math.PI) / 2
    wing.position.x = side * 0.045
    wing.scale.set(1, 1, 0.5)
    bow.add(wing)
  }
  bow.add(new Mesh(new SphereGeometry(0.018, 16, 12), neonBow))
  bow.position.set(0, 0.46, 0.165)
  g.add(bow)

  if (yalda) {
    const tex = scarfTexture()
    const knit = new MeshStandardMaterial({ map: tex, color: '#9c9c9c', roughness: 1 })
    // Two loose loops around the collar…
    const loopA = new Mesh(new TorusGeometry(0.2, 0.07, 20, 64), knit)
    loopA.rotation.x = Math.PI / 2 + 0.12
    loopA.scale.set(1.25, 1, 1)
    loopA.position.y = 0.33
    const loopB = new Mesh(new TorusGeometry(0.175, 0.062, 20, 64), knit)
    loopB.rotation.set(Math.PI / 2 - 0.1, 0, 0.08)
    loopB.scale.set(1.2, 1, 1)
    loopB.position.y = 0.38
    tex.repeat.set(3, 1)
    // …and a tail hanging down one side of the chest, with a fringe
    const tailCurve = new CatmullRomCurve3([
      new Vector3(0.12, 0.33, 0.2),
      new Vector3(0.2, 0.18, frontZ(0.18) + 0.06),
      new Vector3(0.22, 0.0, frontZ(0) + 0.05),
      new Vector3(0.21, -0.2, frontZ(-0.2) + 0.05),
    ])
    const tail = new Mesh(new TubeGeometry(tailCurve, 40, 0.06, 14), knit)
    const fringe = new Group()
    const yarn = new MeshStandardMaterial({ color: '#f3e3c3' })
    for (let i = 0; i < 7; i++) {
      const f = new Mesh(new CylinderGeometry(0.004, 0.004, 0.06, 5), yarn)
      f.position.set(0.17 + i * 0.013, -0.27, frontZ(-0.25) + 0.05)
      fringe.add(f)
    }
    // Pomegranate brooch on the lapel
    const brooch = new Group()
    const fruit = new Mesh(new SphereGeometry(0.03, 24, 16), new MeshStandardMaterial({ color: '#c2142f', roughness: 0.35 }))
    const crown = new Mesh(new CylinderGeometry(0.008, 0.014, 0.018, 6), gold)
    crown.position.y = 0.032
    brooch.add(fruit, crown)
    brooch.position.set(0.3, -0.04, frontZ(-0.04) + 0.03)
    mergeChildren(fringe)
    g.add(loopA, loopB, tail, fringe, brooch)
  }

  // Bake the static parts (scarf pieces, buttons) into one draw per material; the bow animates.
  mergeChildren(g)

  return {
    group: g,
    bow,
    update(t, level) {
      // The bow tie bobs with Pixo's voice and breathes a little when idle.
      bow.rotation.z = Math.sin(t * 7) * level * 0.25
      bow.scale.setScalar(1 + level * 0.12 + Math.sin(t * 2) * 0.02)
      neonBow.emissiveIntensity = 1.2 + level * 2
    },
  }
}

