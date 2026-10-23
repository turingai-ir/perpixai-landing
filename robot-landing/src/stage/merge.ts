import type { BufferGeometry, Material, Mesh, Object3D } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/**
 * Bakes the static mesh children of `parent` that share a material into one mesh each,
 * cutting draw calls. Only direct children are merged, so animated groups keep moving
 * as a whole; pass `keep` for children that animate individually.
 */
export function mergeChildren(parent: Object3D, keep: (m: Mesh) => boolean = () => false) {
  const byMaterial = new Map<Material, Mesh[]>()
  for (const child of parent.children) {
    const m = child as Mesh
    if (!m.isMesh || Array.isArray(m.material) || keep(m)) continue
    const list = byMaterial.get(m.material) ?? []
    list.push(m)
    byMaterial.set(m.material, list)
  }
  for (const [material, meshes] of byMaterial) {
    if (meshes.length < 2) continue
    const geos: BufferGeometry[] = meshes.map((m) => {
      m.updateMatrix()
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()
      return g.applyMatrix4(m.matrix)
    })
    const merged = mergeGeometries(geos)
    geos.forEach((g) => g.dispose())
    if (!merged) continue
    for (const m of meshes) {
      parent.remove(m)
      m.geometry.dispose()
    }
    const out = meshes[0].clone(false)
    out.geometry = merged
    out.material = material
    out.position.set(0, 0, 0)
    out.rotation.set(0, 0, 0)
    out.scale.set(1, 1, 1)
    parent.add(out)
  }
}
