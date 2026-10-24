import { DirectionalLight, Group, HemisphereLight, Mesh, SpotLight, type Texture } from 'three'
import { createBody } from './character/body'
import { createCables } from './character/cables'
import { createHead } from './character/head'
import { createOutfit } from './character/outfit'
import { createTesla } from './character/tesla'
import { brand } from './palette'

export const HEAD_Y = 1.1

export type WorldOptions = { yalda: boolean; badge: { name: string; role: string } }

/** Pixo and the lights around him: plain three.js objects, mounted into the R3F scene as primitives. */
export function createWorld({ yalda, badge }: WorldOptions) {
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

  const key = new DirectionalLight('#fff4ea', 1.05)
  key.position.set(1.5, 3, 4)
  const rimL = new SpotLight(brand.magenta, 28, 12, 0.6, 0.8)
  rimL.position.set(-3.2, 2.4, -2.2)
  rimL.target.position.set(0, 1, 0)
  const rimR = new SpotLight(brand.cyan, 26, 12, 0.6, 0.8)
  rimR.position.set(3.2, 2, -2)
  rimR.target.position.set(0, 1, 0)
  const lights = new Group()
  lights.add(new HemisphereLight('#c9c3ff', '#0a0710', 0.5), key, rimL, rimL.target, rimR, rimR.target)

  return { outfit, head, tesla, rig, headRig, lights }
}

export type World = ReturnType<typeof createWorld>

/** Free the GPU resources of the character (R3F does not dispose objects handed over as <primitive>). */
export function disposeWorld(world: World) {
  world.rig.traverse((o) => {
    const m = o as Mesh
    m.geometry?.dispose()
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
    mats.forEach((mat) => {
      Object.values(mat).forEach((v) => (v as Texture)?.isTexture && (v as Texture).dispose())
      mat.dispose()
    })
  })
}
