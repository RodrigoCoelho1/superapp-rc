/**
 * Gerador de ícones PNG puro — sem dependências externas
 * Usa apenas zlib nativo do Node.js
 */
import { createWriteStream } from 'fs'
import { deflateSync } from 'zlib'

// ── helpers ──────────────────────────────────────────────────
function u32be(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n); return b }

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data)
  const len = u32be(d.length)
  let crc = 0xFFFFFFFF
  for (const byte of [...t, ...d]) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
  }
  crc = (~crc) >>> 0
  return Buffer.concat([len, t, d, u32be(crc)])
}

function writePNG(filename, pixels, size) {
  // pixels: Uint8Array of RGBA, row by row
  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(size * 4 + 1)
    row[0] = 0 // filter type: None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      row[1 + x*4]   = pixels[i]
      row[1 + x*4+1] = pixels[i+1]
      row[1 + x*4+2] = pixels[i+2]
      row[1 + x*4+3] = pixels[i+3]
    }
    rows.push(row)
  }
  const raw = deflateSync(Buffer.concat(rows), { level: 6 })
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  const png = Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', raw),
    chunk('IEND', Buffer.alloc(0))
  ])
  const ws = createWriteStream(filename)
  ws.write(png)
  ws.end()
  console.log(`✅ ${filename} (${size}×${size})`)
}

// ── drawing ──────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, lo=0, hi=255) { return Math.max(lo, Math.min(hi, v)) }

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n>>16)&255, (n>>8)&255, n&255]
}

function drawIcon(size) {
  const buf = new Uint8Array(size * size * 4)

  function setPixel(x, y, r, g, b, a=255) {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const i = (y * size + x) * 4
    const fa = a / 255
    const ba = buf[i+3] / 255
    const oa = fa + ba * (1 - fa)
    if (oa < 0.001) { buf[i+3] = 0; return }
    buf[i]   = clamp((r * fa + buf[i]   * ba * (1-fa)) / oa)
    buf[i+1] = clamp((g * fa + buf[i+1] * ba * (1-fa)) / oa)
    buf[i+2] = clamp((b * fa + buf[i+2] * ba * (1-fa)) / oa)
    buf[i+3] = clamp(oa * 255)
  }

  function fillCircle(cx, cy, r, colorFn) {
    const x0 = Math.floor(cx - r - 1), x1 = Math.ceil(cx + r + 1)
    const y0 = Math.floor(cy - r - 1), y1 = Math.ceil(cy + r + 1)
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2)
        const aa = clamp((r + .8 - dist) * 2, 0, 1)
        if (aa <= 0) continue
        const [r2,g,b,a=255] = colorFn(x, y, dist, r)
        setPixel(x, y, r2, g, b, Math.round(aa * a))
      }
    }
  }

  function radialGrad(cx, cy, r0, r1, stops) {
    return (x, y, dist) => {
      const t = clamp((dist - r0) / (r1 - r0), 0, 1)
      let lo, hi, lt
      for (let i = 0; i < stops.length - 1; i++) {
        if (t >= stops[i][0] && t <= stops[i+1][0]) {
          lt = (t - stops[i][0]) / (stops[i+1][0] - stops[i][0])
          lo = stops[i][1]; hi = stops[i+1][1]
          break
        }
      }
      if (!lo) { const s = t <= .5 ? stops[0] : stops[stops.length-1]; return [...s[1]] }
      return [lerp(lo[0],hi[0],lt), lerp(lo[1],hi[1],lt), lerp(lo[2],hi[2],lt)]
    }
  }

  const S = size / 512

  // ── 1. Background rounded rect ──────────────────────────
  const R = Math.round(size * .22)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // rounded rect clip
      const dx = Math.max(0, Math.max(R - x, x - (size-1-R)))
      const dy = Math.max(0, Math.max(R - y, y - (size-1-R)))
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist > R) continue

      // radial bg gradient  center→edge
      const cx = x / size, cy = y / size
      const d = Math.sqrt((cx-.5)**2 + (cy-.35)**2) / .65
      const t = clamp(d, 0, 1)
      const r2 = Math.round(lerp(26, 8, t))
      const g  = Math.round(lerp(39, 11, t))
      const b  = Math.round(lerp(68, 20, t))

      const i = (y * size + x) * 4
      buf[i] = r2; buf[i+1] = g; buf[i+2] = b; buf[i+3] = 255
    }
  }

  // ── 2. Orb glow top-right ───────────────────────────────
  const orb1x = size*.78, orb1y = size*.18, orb1r = size*.40
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      if (buf[i+3] === 0) continue
      const d = Math.sqrt((x-orb1x)**2 + (y-orb1y)**2)
      const t = clamp(1 - d/orb1r, 0, 1)
      const alpha = t * t * 0.18
      buf[i]   = clamp(buf[i]   + 79  * alpha)
      buf[i+1] = clamp(buf[i+1] + 142 * alpha)
      buf[i+2] = clamp(buf[i+2] + 247 * alpha)
    }
  }

  // ── 3. Orb glow bottom-left ─────────────────────────────
  const orb2x = size*.22, orb2y = size*.82, orb2r = size*.35
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      if (buf[i+3] === 0) continue
      const d = Math.sqrt((x-orb2x)**2 + (y-orb2y)**2)
      const t = clamp(1 - d/orb2r, 0, 1)
      const alpha = t * t * 0.16
      buf[i]   = clamp(buf[i]   + 124 * alpha)
      buf[i+1] = clamp(buf[i+1] + 58  * alpha)
      buf[i+2] = clamp(buf[i+2] + 237 * alpha)
    }
  }

  // ── 4. 3×3 dot grid ─────────────────────────────────────
  const dotR  = Math.round(28 * S)
  const gap   = Math.round(90 * S)
  const startX = size/2 - gap
  const startY = size/2 - gap

  const palette = [
    ['#4f8ef7','#7c3aed'],
    ['#06b6d4','#4f8ef7'],
    ['#7c3aed','#ec4899'],
    ['#3b82f6','#06b6d4'],
    ['#e0e8ff','#a5b4fc'],
    ['#14b8a6','#3b82f6'],
    ['#f59e0b','#ef4444'],
    ['#4f8ef7','#14b8a6'],
    ['#a78bfa','#7c3aed'],
  ]

  let idx = 0
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = startX + col * gap
      const cy = startY + row * gap
      const [hex1, hex2] = palette[idx++]
      const [r1,g1,b1] = hexToRgb(hex1)
      const [r2,g2,b2] = hexToRgb(hex2)

      // glow halo
      fillCircle(cx, cy, dotR * 2.0, (_x,_y,d) => {
        const t = clamp(1 - d/(dotR*2.0), 0, 1)
        return [r1, g1, b1, Math.round(t * t * 55)]
      })

      // main dot with diagonal gradient
      fillCircle(cx, cy, dotR, (x, y) => {
        const t = clamp(((x-cx+dotR)/(dotR*2) + (y-cy+dotR)/(dotR*2)) / 2, 0, 1)
        return [
          Math.round(lerp(r1,r2,t)),
          Math.round(lerp(g1,g2,t)),
          Math.round(lerp(b1,b2,t)),
          255
        ]
      })

      // shine highlight top-left
      const shR  = Math.round(dotR * .42)
      const shCx = cx - dotR*.28, shCy = cy - dotR*.28
      fillCircle(shCx, shCy, shR, (_x,_y,d) => {
        const t = clamp(1 - d/shR, 0, 1)
        return [255, 255, 255, Math.round(t * 80)]
      })
    }
  }

  return buf
}

// ── generate both sizes ──────────────────────────────────────
;[512, 192].forEach(size => {
  const pixels = drawIcon(size)
  writePNG(`C:/Users/rodri/OneDrive/Documentos/Claude/Projects/SuperApp/icon-${size}.png`, pixels, size)
})
