/**
 * The design tokens JavaScript needs (things CSS cannot reach: <meta theme-color>, the web manifest,
 * inline <noscript> styles, three.js lights). `tokens.css` is the source of truth;
 * `scripts/check-tokens.mjs` (part of `pnpm check`) fails if a value here drifts from it.
 * Keys are the token names without the `--color-` prefix.
 */
export const colors = {
  ink: '#030205',
  'ink-3': '#14111c',
  fog: '#f5efe4',
  magenta: '#d92dd4',
  purple: '#863ed3',
  blue: '#128ce3',
  cyan: '#06a1e9',
} as const

/** z-index layers that JS (not Tailwind) has to set: mirrors `--z-*` in tokens.css. */
export const zIndex = { noscript: 80 } as const
