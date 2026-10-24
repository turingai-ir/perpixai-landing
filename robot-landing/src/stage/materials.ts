import { paint } from './palette'
import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

export const materials = {
  chassis: new MeshPhysicalMaterial({ color: paint.chassis, metalness: 0.75, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
  brass: new MeshStandardMaterial({ color: paint.brass, metalness: 1, roughness: 0.28 }),
  copper: new MeshStandardMaterial({ color: paint.copper, metalness: 1, roughness: 0.3 }),
  chrome: new MeshStandardMaterial({ color: paint.chrome, metalness: 1, roughness: 0.12 }),
  rubber: new MeshStandardMaterial({ color: paint.rubber, metalness: 0, roughness: 0.55 }),
  darkMetal: new MeshStandardMaterial({ color: paint.darkMetal, metalness: 0.9, roughness: 0.4 }),
  paper: new MeshStandardMaterial({ color: paint.paper, roughness: 0.9 }),
  fabric: new MeshPhysicalMaterial({
    color: paint.fabric,
    roughness: 0.92,
    sheen: 0.7,
    sheenColor: paint.fabricSheen,
    sheenRoughness: 0.5,
  }),
  skin: new MeshPhysicalMaterial({ color: paint.skin, roughness: 0.55, sheen: 0.4, sheenColor: paint.skinSheen }),
  glass: new MeshPhysicalMaterial({
    color: paint.white,
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.16,
    clearcoat: 1,
    depthWrite: false,
  }),
}
