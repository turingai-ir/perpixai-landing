import { CatmullRomCurve3, Group, Mesh, TubeGeometry, Vector3 } from 'three'
import { materials } from '../materials'
import { mergeChildren } from '../merge'

/**
 * Patch cables hanging from the underside of the head down onto the collar.
 * Defined in body space; `headY` is where the head's underside sits.
 */
export function createCables(headY: number) {
  const g = new Group()
  const specs: [number, number, number, number][] = [
    // start x, start z, end x, sag
    [-0.36, 0.18, -0.2, 0.5],
    [-0.28, 0.24, -0.08, 0.35],
    [-0.18, -0.2, -0.17, 0.6],
    [0.2, 0.22, 0.12, 0.42],
    [0.3, 0.16, 0.22, 0.55],
    [0.38, -0.12, 0.3, 0.7],
  ]
  for (const [sx, sz, ex, sag] of specs) {
    const start = new Vector3(sx, headY, sz)
    const end = new Vector3(ex, 0.3, sz * 0.6 + 0.06)
    const mid = start.clone().lerp(end, 0.5)
    mid.y -= sag * 0.35
    mid.x += Math.sign(sx) * 0.08
    const low = start.clone().lerp(end, 0.8)
    low.y -= sag * 0.2
    const curve = new CatmullRomCurve3([start, new Vector3(sx * 1.05, headY - 0.08, sz), mid, low, end])
    g.add(new Mesh(new TubeGeometry(curve, 64, 0.0075, 6), materials.rubber))
  }
  mergeChildren(g)
  return g
}
