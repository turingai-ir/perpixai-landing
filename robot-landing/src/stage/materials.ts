import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

export const materials = {
  chassis: new MeshPhysicalMaterial({ color: '#17151f', metalness: 0.75, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
  brass: new MeshStandardMaterial({ color: '#c9a25a', metalness: 1, roughness: 0.28 }),
  copper: new MeshStandardMaterial({ color: '#b8653a', metalness: 1, roughness: 0.3 }),
  chrome: new MeshStandardMaterial({ color: '#d9dde6', metalness: 1, roughness: 0.12 }),
  rubber: new MeshStandardMaterial({ color: '#0b0b0e', metalness: 0, roughness: 0.55 }),
  darkMetal: new MeshStandardMaterial({ color: '#2a2833', metalness: 0.9, roughness: 0.4 }),
  paper: new MeshStandardMaterial({ color: '#8f7f62', roughness: 0.9 }),
  fabric: new MeshPhysicalMaterial({
    color: '#15131d',
    roughness: 0.92,
    sheen: 0.7,
    sheenColor: '#4d3f86',
    sheenRoughness: 0.5,
  }),
  skin: new MeshPhysicalMaterial({ color: '#c6957c', roughness: 0.55, sheen: 0.4, sheenColor: '#ffd1bd' }),
  glass: new MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.16,
    clearcoat: 1,
    depthWrite: false,
  }),
}
