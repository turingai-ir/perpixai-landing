#!/usr/bin/env node
/**
 * Design-token guard (part of `pnpm check`).
 *  1. src/styles/tokens.ts must match tokens.css (the source of truth).
 *  2. No raw colours / arbitrary shadows / arbitrary z-indexes outside the token files.
 *  3. The circuit-trace data URI in globals.css must use the current --color-purple.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const read = (p) => readFileSync(join(root, p), 'utf8')
const errors = []
const fail = (msg) => errors.push(msg)

// ── 1. tokens.ts ↔ tokens.css ────────────────────────────────────────────
const css = read('src/styles/tokens.css')
const cssColors = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)].map((m) => [m[1], m[2].toLowerCase()]),
)
const cssVar = (name) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim()

const ts = read('src/styles/tokens.ts')
const colorsBlock = ts.match(/export const colors = \{([\s\S]*?)\} as const/)?.[1] ?? ''
for (const [, key, hex] of colorsBlock.matchAll(/'?([a-z0-9-]+)'?:\s*'(#[0-9a-fA-F]{3,8})'/g)) {
  if (cssColors[key] === undefined) fail(`tokens.ts: colors.${key} has no --color-${key} in tokens.css`)
  else if (cssColors[key] !== hex.toLowerCase()) fail(`tokens.ts: colors.${key} is ${hex} but tokens.css says ${cssColors[key]}`)
}
const noscriptZ = ts.match(/noscript:\s*(\d+)/)?.[1]
if (noscriptZ !== cssVar('z-noscript'))
  fail(`tokens.ts: zIndex.noscript (${noscriptZ}) differs from --z-noscript (${cssVar('z-noscript')})`)

// ── 3. circuit data URI ──────────────────────────────────────────────────
const globals = read('src/styles/globals.css')
const circuit = globals.match(/\.circuit\s*\{[^}]*stroke='%23([0-9a-fA-F]{6})'/)?.[1]
if (circuit && `#${circuit}`.toLowerCase() !== cssColors.purple)
  fail(`globals.css: .circuit stroke #${circuit} is not --color-purple (${cssColors.purple})`)

// ── 2. raw values outside the token files ────────────────────────────────
const allowed = new Set(['src/styles/tokens.ts', 'src/styles/tokens.css', 'src/stage/palette.ts', 'src/ui/icons.data.ts'])
const skipDirs = new Set(['src/i18n'])
const rules = [
  [/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}(?![0-9a-zA-Z])/, 'raw hex colour'],
  [/\brgba?\(|\bhsla?\(|\boklch\(/, 'raw colour function'],
  [/\bshadow-\[/, 'arbitrary shadow (add a --shadow-* token)'],
  [/\bz-\[\d+\]|\bz-\d+\b/, 'arbitrary z-index (use z-(--z-*))'],
]

function walk(dir) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = `${dir}/${name}`
    if (skipDirs.has(rel)) continue
    if (statSync(join(root, rel)).isDirectory()) walk(rel)
    else if (/\.(tsx?|css)$/.test(name) && !allowed.has(rel)) scan(rel)
  }
}
function scan(rel) {
  const lines = read(rel).split('\n')
  lines.forEach((line, i) => {
    const code = line
      .replace(/\/\*.*?\*\//g, '')
      .replace(/^\s*(\/\/|\*).*/, '')
      .replace(/\s\/\/.*$/, '')
    for (const [re, what] of rules) if (re.test(code)) fail(`${rel}:${i + 1}: ${what}: ${line.trim().slice(0, 100)}`)
  })
}
walk('src')

if (errors.length) {
  console.error(`✖ design tokens: ${errors.length} problem(s)\n` + errors.map((e) => '  ' + e).join('\n'))
  console.error('\nUse a token from src/styles/tokens.css (or src/stage/palette.ts for 3D materials); see CLAUDE.md → Design tokens.')
  process.exit(1)
}
console.log(
  `✔ design tokens: ${Object.keys(cssColors).length} colours, tokens.ts in sync, no raw colours in ${relative(root, join(root, 'src'))}/`,
)
