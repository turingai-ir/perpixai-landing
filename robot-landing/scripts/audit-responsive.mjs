#!/usr/bin/env node
/**
 * Responsive audit: loads the static export (`out/`) in headless Chrome at 20 device sizes and fails on regressions.
 *
 *   pnpm build && pnpm audit:responsive            # layout checks on every viewport (~2 min)
 *   pnpm audit:responsive --choices                # + wait for Pixo's question and check the buttons are on screen (~6 min)
 *   pnpm audit:responsive --only=ipad,land         # viewports whose name contains any of these
 *   CHROME=/path/to/chrome pnpm audit:responsive   # Chrome binary (default: google-chrome, then chromium)
 *
 * Checks per viewport: no horizontal overflow, the preloader gate is visible and clickable, touch targets
 * (reported, not failing), text under 12px, and with --choices the hero's answer buttons are fully on screen.
 * RTL note: overflow to the LEFT is unscrollable and mobile Chrome widens the layout viewport to hide it, so
 * everything is measured against the emulated width, never `innerWidth`.
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readFileSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join, normalize } from 'node:path'

const args = process.argv.slice(2)
const withChoices = args.includes('--choices')
const only = args
  .find((a) => a.startsWith('--only='))
  ?.slice(7)
  .split(',')
const root = new URL('..', import.meta.url).pathname
const outDir = join(root, 'out')
if (!existsSync(join(outDir, 'index.html'))) {
  console.error('out/index.html not found: run `pnpm build` first.')
  process.exit(2)
}

// name, width, height, mobile
const ALL = [
  ['fold-280x653', 280, 653, 1],
  ['se1-320x568', 320, 568, 1],
  ['android-360x640', 360, 640, 1],
  ['se2-375x667', 375, 667, 1],
  ['iphone14-390x844', 390, 844, 1],
  ['pixel-412x915', 412, 915, 1],
  ['promax-430x932', 430, 932, 1],
  ['land-568x320', 568, 320, 1],
  ['land-667x375', 667, 375, 1],
  ['land-844x390', 844, 390, 1],
  ['land-932x430', 932, 430, 1],
  ['ipad-768x1024', 768, 1024, 1],
  ['ipad-820x1180', 820, 1180, 1],
  ['ipad-land-1024x768', 1024, 768, 1],
  ['ipad-land-1180x820', 1180, 820, 1],
  ['laptop-1280x720', 1280, 720, 0],
  ['laptop-1366x768', 1366, 768, 0],
  ['desk-1440x900', 1440, 900, 0],
  ['fhd-1920x1080', 1920, 1080, 0],
  ['qhd-2560x1440', 2560, 1440, 0],
]
const CHOICE_SET = new Set([
  'se1-320x568',
  'se2-375x667',
  'iphone14-390x844',
  'land-568x320',
  'land-844x390',
  'ipad-768x1024',
  'ipad-land-1024x768',
  'laptop-1366x768',
])
const VIEWPORTS = ALL.filter(([n]) => !only || only.some((o) => n.includes(o)))

// ── static server for out/ ────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
  let file = join(outDir, path)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file) && existsSync(file + '.html')) file += '.html'
  if (!existsSync(file)) return void res.writeHead(404).end('not found')
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const url = `http://127.0.0.1:${server.address().port}/`

// ── headless Chrome over CDP ──────────────────────────────────────────────
const chromeBin = [process.env.CHROME, 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean)
let chrome, chromeBinUsed
const port = 9400 + Math.floor(Math.random() * 400)
for (const bin of chromeBin) {
  const proc = spawn(
    bin,
    [
      '--headless=new',
      '--no-sandbox',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${mkdtempSync(join(tmpdir(), 'audit-'))}`,
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  const ok = await new Promise((resolve) => {
    proc.once('error', () => resolve(false))
    setTimeout(() => resolve(true), 600)
  })
  if (ok) {
    chrome = proc
    chromeBinUsed = bin
    break
  }
}
const cleanup = () => {
  chrome?.kill()
  server.close()
}
process.on('exit', cleanup)
if (!chrome) {
  console.error('No Chrome found (set CHROME=/path/to/chrome).')
  process.exit(2)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 40 && !target; i++) {
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page')
  } catch {
    await sleep(250)
  }
}
if (!target) {
  console.error('Chrome did not start.')
  process.exit(2)
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let nextId = 0
const pending = new Map()
ws.onmessage = (m) => {
  const d = JSON.parse(m.data)
  if (d.id) pending.get(d.id)?.(d.result)
}
const send = (method, params = {}) =>
  new Promise((r) => {
    const id = ++nextId
    pending.set(id, r)
    ws.send(JSON.stringify({ id, method, params }))
  })
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value
await send('Page.enable')
await send('Runtime.enable')
await send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear()}catch(e){}; Math.random = () => 0.1' })

// ── in-page probes ────────────────────────────────────────────────────────
const PROBE = (w, h) => `(() => {
  const vw = Math.min(${w}, document.documentElement.clientWidth), vh = ${h} // clientWidth < w when a classic scrollbar takes space
  const vis = (el) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 }
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.id || el.tagName).trim().replace(/\\s+/g, ' ').slice(0, 30)
  // html/body are skipped on purpose: body has overflow-x: clip, which would excuse every overflowing element
  const clipped = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) { const r = p.getBoundingClientRect(); if (r.right <= vw + 1 && r.left >= -1) return true } } return false }
  const overflow = []
  document.querySelectorAll('body *').forEach((el) => { if (!vis(el) || getComputedStyle(el).position === 'fixed') return; const r = el.getBoundingClientRect(); if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) overflow.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ' ' + Math.round(r.left) + '..' + Math.round(r.right) + ' "' + label(el) + '"') })
  const small = []
  document.querySelectorAll('a[href],button,input,summary,[role=button]').forEach((el) => { if (!vis(el) || el.closest('.sr-only')) return; const r = el.getBoundingClientRect(); if (r.height < 44 && r.width < 44) small.push(Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + label(el)) })
  const tiny = new Set(), walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) { const n = walker.currentNode, el = n.parentElement; if (!n.textContent.trim() || !vis(el) || el.closest('.sr-only,script,style,noscript')) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12) tiny.add(fs + 'px "' + n.textContent.trim().slice(0, 20) + '"') }
  const gate = document.querySelector('button[data-gate]'); let gateOk = null
  if (gate) { const r = gate.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); gateOk = r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw && (hit === gate || gate.contains(hit)) }
  const mute = [...document.querySelectorAll('[data-preloader] button')].find((b) => b.textContent.includes('بی‌صدا')); let muteOk = null
  if (mute) { const r = mute.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); muteOk = r.bottom <= vh && (hit === mute || mute.contains(hit)) }
  return { overflow: overflow.slice(0, 5), nOverflow: overflow.length, small, tiny: [...tiny].slice(0, 3), gateOk, muteOk }
})()`
const CHOICES = `(() => { const vh = innerHeight, bs = [...document.querySelectorAll('#top button.word')], rect = bs.map((b) => b.getBoundingClientRect()); return { n: bs.length, visible: rect.filter((r) => r.top >= 0 && r.bottom <= vh).length } })()`

// ── run ───────────────────────────────────────────────────────────────────
const failures = []
const rows = []
for (const [name, w, h, mobile] of VIEWPORTS) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile })
  await send('Emulation.setTouchEmulationEnabled', { enabled: !!mobile, maxTouchPoints: mobile ? 5 : 0 })
  await send('Page.navigate', { url })
  // the gate opens after the first scene is ready: poll for it (slow on big canvases under software GL)
  for (let i = 0; i < 40 && !(await ev(`!!document.querySelector('[data-preloader] button[data-gate]')`)); i++) await sleep(500)
  await sleep(1500) // its fade-in
  const gate = await ev(PROBE(w, h))
  // a real mouse event is a user gesture: AudioContext resumes and Pixo's lines advance
  const point = await ev(
    `(() => { const b = [...document.querySelectorAll('[data-preloader] button')].find((b) => b.textContent.includes('بی‌صدا')) ?? document.querySelector('button[data-gate]'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`,
  )
  if (point)
    for (const type of ['mousePressed', 'mouseReleased'])
      await send('Input.dispatchMouseEvent', { type, x: point.x, y: point.y, button: 'left', clickCount: 1 })
  await sleep(3500)
  const page = await ev(PROBE(w, h))
  let choices = null
  if (withChoices && CHOICE_SET.has(name)) {
    let c = { n: 0, visible: 0 }
    for (let i = 0; i < 40 && !c.n; i++) {
      await sleep(1000)
      c = await ev(CHOICES)
    }
    await sleep(1200)
    choices = await ev(CHOICES)
  }
  const problems = []
  if (gate.nOverflow || page.nOverflow)
    problems.push(
      `horizontal overflow (${gate.nOverflow}/${page.nOverflow}): ${[...gate.overflow, ...page.overflow].slice(0, 3).join(' | ')}`,
    )
  if (gate.gateOk === false) problems.push('gate button not fully visible/clickable')
  if (gate.muteOk === false) problems.push('"enter without sound" link hidden or covered')
  if (page.tiny.length) problems.push(`text under 12px: ${page.tiny.join(', ')}`)
  if (choices && (choices.n === 0 || choices.visible < choices.n))
    problems.push(`answer buttons: ${choices.visible}/${choices.n} fully on screen`)
  rows.push({
    name,
    overflow: gate.nOverflow + page.nOverflow,
    small: page.small.length,
    choices: choices ? `${choices.visible}/${choices.n}` : '-',
    ok: !problems.length,
  })
  if (problems.length) failures.push({ name, problems })
  console.log(
    `${problems.length ? '✖' : '✔'} ${name.padEnd(20)} overflow ${String(gate.nOverflow + page.nOverflow).padEnd(3)} small-targets ${String(page.small.length).padEnd(3)} choices ${choices ? `${choices.visible}/${choices.n}` : '-'}`,
  )
}

ws.close()
cleanup()
console.log(`\n${chromeBinUsed}: ${rows.length} viewport(s), ${failures.length} with problems`)
if (failures.length) {
  for (const f of failures) console.error(`\n✖ ${f.name}\n  ` + f.problems.join('\n  '))
  process.exit(1)
}
process.exit(0)
