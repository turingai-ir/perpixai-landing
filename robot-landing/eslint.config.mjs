import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Static export has no image optimiser, so next/image would only render the same <img>.
      '@next/next/no-img-element': 'off',
    },
  },
  {
    // three.js / react-three-fiber objects (camera, scene, materials, groups) are mutable by design.
    files: ['src/stage/**'],
    rules: { 'react-hooks/immutability': 'off' },
  },
  prettier, // last: turns off every rule that would fight Prettier
  globalIgnores(['.next/**', 'out/**', 'dist/**', 'next-env.d.ts', '.claude/**', 'src/ui/icons.data.ts']),
])
