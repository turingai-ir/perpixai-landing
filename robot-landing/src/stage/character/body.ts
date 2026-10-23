import { CatmullRomCurve3, CylinderGeometry, Group, LatheGeometry, Mesh, Vector2, Vector3 } from 'three'
import { materials } from '../materials'
import { velvet } from './outfit'

/** Shoulders in the usher's velvet jacket and a short neck — the human half of Pixo. */
export function createBody() {
  const body = new Group()

  // Torso profile (radius, height) revolved, then flattened into shoulders.
  const keys = [
    [0.62, -1.6],
    [0.65, -0.8],
    [0.66, -0.4],
    [0.655, -0.17],
    [0.6, -0.04],
    [0.48, 0.05],
    [0.3, 0.12],
    [0.19, 0.2],
    [0.17, 0.26],
  ].map(([r, y]) => new Vector3(r, y, 0))
  const spline = new CatmullRomCurve3(keys, false, 'centripetal')
  const profile = [new Vector2(0, -1.6), ...spline.getPoints(60).map((p) => new Vector2(p.x, p.y))]
  const torsoGeo = new LatheGeometry(profile, 220)
  const torso = new Mesh(torsoGeo, velvet)
  torso.scale.set(1.6, 1, 0.56)
  body.add(torso)

  const neck = new Mesh(new CylinderGeometry(0.105, 0.12, 0.26, 48), materials.skin)
  neck.position.y = 0.58
  body.add(neck)

  // Brass interface ring where flesh meets machine.
  const ring = new Mesh(new CylinderGeometry(0.13, 0.13, 0.05, 48), materials.brass)
  ring.position.y = 0.7
  body.add(ring)

  return body
}
