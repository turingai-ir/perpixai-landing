#!/usr/bin/env node
/**
 * Theme guard (part of `pnpm check`). Colours live in src/styles/theme.css as shadcn-style semantic variables
 * (`bg-background`, `text-muted-foreground`, `bg-primary` …); this keeps raw values and legacy names out of components.
 *  1. No raw colours / arbitrary shadows / arbitrary z-indexes outside theme.css and the 3D palette.
 *  2. No pre-shadcn colour names (`text-fog`, `bg-ink`, `text-mute` …): they would silently generate no CSS.
 *  3. THEME_COLOR (seo.ts) and the circuit-trace data URI (globals.css) must equal the theme's values.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const read = (p) => readFileSync(join(root, p), 'utf8')
const errors = []
const fail = (msg) => errors.push(msg)

// ── 3. values JS / data URIs cannot take from CSS variables ─────────────
const theme = read('src/styles/theme.css')
const themeVar = (name) => theme.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1].toLowerCase()
const themeColor = read('src/lib/seo.ts')
  .match(/THEME_COLOR = '(#[0-9a-fA-F]{6})'/)?.[1]
  .toLowerCase()
if (themeColor !== themeVar('background')) fail(`src/lib/seo.ts: THEME_COLOR ${themeColor} is not --background (${themeVar('background')})`)
const circuit = read('src/styles/globals.css').match(/\.circuit\s*\{[^}]*stroke='%23([0-9a-fA-F]{6})'/)?.[1]
if (circuit && `#${circuit}`.toLowerCase() !== themeVar('purple'))
  fail(`globals.css: .circuit stroke #${circuit} is not --purple (${themeVar('purple')})`)

// ── 1 + 2. scan the sources ──────────────────────────────────────────────
const allowed = new Set(['src/styles/theme.css', 'src/stage/palette.ts', 'src/ui/icons.data.ts'])
const skipDirs = new Set(['src/i18n'])
const LEGACY = 'ink-2|ink-3|ink|fog|mute|dim|line|cyan|magenta-soft|magenta'
const rules = [
  [/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}(?![0-9a-zA-Z])/, 'raw hex colour (add a theme variable)'],
  [/\brgba?\(|\bhsla?\(|\boklch\(/, 'raw colour function (add a theme variable)'],
  [/\bshadow-\[/, 'arbitrary shadow (add a --shadow-* theme token)'],
  [/\bz-\[\d+\]/, 'arbitrary z-index (use z-30 … z-80)'],
  [
    new RegExp(`\\b(bg|text|border|from|via|to|ring|outline|divide|fill|stroke)-(${LEGACY})(?![\\w-])`),
    'legacy colour name (use the semantic role)',
  ],
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
  read(rel)
    .split('\n')
    .forEach((line, i) => {
      const code = line
        .replace(/\/\*.*?\*\//g, '')
        .replace(/^\s*(\/\/|\*).*/, '')
        .replace(/\s\/\/.*$/, '')
      if (/\bTHEME_COLOR\s*=/.test(code)) return // the one literal <meta theme-color> needs; verified above
      for (const [re, what] of rules) if (re.test(code)) fail(`${rel}:${i + 1}: ${what}: ${line.trim().slice(0, 100)}`)
    })
}
walk('src')

if (errors.length) {
  console.error(`✖ theme: ${errors.length} problem(s)\n` + errors.map((e) => '  ' + e).join('\n'))
  console.error('\nUse a semantic utility from src/styles/theme.css (3D materials: src/stage/palette.ts); see CLAUDE.md → Theme.')
  process.exit(1)
}
console.log('✔ theme: no raw colours or legacy names in src/, THEME_COLOR and the circuit SVG match theme.css')
