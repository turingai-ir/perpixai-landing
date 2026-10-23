import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

/** Turing tape: a strip of cells holding 0 / 1 / blank, scrolled via texture offset. */
export function tapeTexture() {
  const cell = 64
  const cells = 24
  const c = document.createElement('canvas')
  c.width = cell * cells
  c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = '#efe6cf'
  g.fillRect(0, 0, c.width, c.height)
  g.strokeStyle = 'rgba(60,40,20,0.35)'
  g.lineWidth = 2
  g.font = 'bold 38px ui-monospace, Menlo, monospace'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const symbols = ['1', '0', '1', '1', '', '0', '1', '0', '0', '1', '', '1']
  for (let i = 0; i < cells; i++) {
    g.strokeRect(i * cell + 1, 6, cell - 2, c.height - 12)
    const s = symbols[(i * 7) % symbols.length]
    g.fillStyle = '#2a1d12'
    if (s) g.fillText(s, i * cell + cell / 2, c.height / 2 + 2)
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = RepeatWrapping
  tex.repeat.set(0.35, 1)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Engraved maker's plate. 1936 = Turing's "On Computable Numbers". */
export function plateTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 96
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 512, 0)
  grad.addColorStop(0, '#6d5226')
  grad.addColorStop(0.5, '#c9a25a')
  grad.addColorStop(1, '#6d5226')
  g.fillStyle = grad
  g.fillRect(0, 0, 512, 96)
  g.fillStyle = '#1c140a'
  g.font = '600 40px Georgia, serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('PERPIX  ✦  MODEL 1936', 256, 50)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}

/** Glyphs the reels show as "eyes": ؟ when asking, a spiral when thinking, a heart for love. */
export function moodTexture(kind: 'ask' | 'think' | 'love') {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  g.translate(128, 128)
  g.strokeStyle = g.fillStyle = '#ffffff'
  g.lineCap = 'round'
  g.lineJoin = 'round'
  if (kind === 'ask') {
    g.font = 'bold 190px Georgia, serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText('؟', 0, 10)
  } else if (kind === 'think') {
    g.lineWidth = 16
    g.beginPath()
    for (let a = 0; a < Math.PI * 6; a += 0.05) {
      const r = 6 + a * 5.6
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    g.stroke()
  } else {
    g.beginPath()
    g.moveTo(0, 70)
    g.bezierCurveTo(-130, -10, -60, -110, 0, -45)
    g.bezierCurveTo(60, -110, 130, -10, 0, 70)
    g.fill()
  }
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}

/** Hand-knitted Yalda scarf: pomegranate red with a row of little pomegranates and cream stripes. */
export function scarfTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#a3112c'
  g.fillRect(0, 0, 512, 128)
  // knit texture
  g.fillStyle = 'rgba(0,0,0,0.12)'
  for (let x = 0; x < 512; x += 8) for (let y = 0; y < 128; y += 8) if ((x + y) % 16 === 0) g.fillRect(x, y, 4, 8)
  g.fillStyle = '#d9c39b'
  g.fillRect(0, 8, 512, 4)
  g.fillRect(0, 116, 512, 4)
  for (let x = 32; x < 512; x += 64) {
    g.fillStyle = '#5c0716'
    g.beginPath()
    g.arc(x, 64, 17, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#ff4a5e'
    g.beginPath()
    g.arc(x - 4, 60, 13, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#ffd36b'
    g.fillRect(x - 5, 40, 10, 8) // crown
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.colorSpace = SRGBColorSpace
  return tex
}

/** Brass name badge for the usher's lapel. */
export function badgeTexture(name: string, role: string) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 96
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 256, 96)
  grad.addColorStop(0, '#8a6a2c')
  grad.addColorStop(0.5, '#e2c27a')
  grad.addColorStop(1, '#8a6a2c')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 96)
  g.fillStyle = '#2a1a08'
  g.textAlign = 'center'
  g.direction = 'rtl'
  g.font = 'bold 40px Lalezar, Vazirmatn, Tahoma, sans-serif'
  g.fillText(name, 128, 46)
  g.font = '22px Vazirmatn, Tahoma, sans-serif'
  g.fillText(role, 128, 80)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}
