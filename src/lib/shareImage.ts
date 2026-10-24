import type { Chart } from '../astro/chart'
import { ELEMENT_INFO, POINTS, SIGNS, type PointKey } from '../astro/constants'
import { SIGN_TEXT } from '../interpret/signs'
import { WHEEL_POINTS, spread } from './wheelLayout'

export type ShareFormat = 'story' | 'feed'

export const SHARE_SIZES: Record<ShareFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: 'Stories / Status' },
  feed: { w: 1080, h: 1350, label: 'Feed' },
}

/** Public link to the app, tagged so visits from shared images can be counted. */
export const shareUrl = () => `${window.location.origin}${window.location.pathname}?ref=compartilhar`
export const shareUrlLabel = () => `${window.location.host}${window.location.pathname}`.replace(/\/$/, '')

const rad = Math.PI / 180
export const GOLD = '#ffe8a3'
export const SYMBOLS = '"Noto Sans Symbols 2", "Noto Sans Symbols", "Segoe UI Symbol", "Apple Symbols", sans-serif'
export const DISPLAY = 'Cinzel, "Cormorant Garamond", Georgia, serif'
export const SERIF = '"Cormorant Garamond", Georgia, serif'
export const SANS = 'Inter, system-ui, sans-serif'

/** Deterministic pseudo-random numbers, so the same chart always gets the same sky. */
function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296)
}

export async function loadFonts() {
  if (!('fonts' in document)) return
  await Promise.all([
    document.fonts.load(`600 64px ${DISPLAY}`),
    document.fonts.load(`italic 500 40px ${SERIF}`),
    document.fonts.load(`500 32px ${SANS}`),
    document.fonts.load(`40px "Noto Sans Symbols 2"`, '♈♉♊♋♌♍♎♏♐♑♒♓'),
    document.fonts.load(`40px "Noto Sans Symbols"`, '☉☽☿♀♂♃♄♅♆♇☊'),
  ]).catch(() => {})
}

export function background(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  ctx.fillStyle = '#07061a'
  ctx.fillRect(0, 0, w, h)
  const glow = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(7,6,26,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  glow(w * 0.2, 0, w * 0.9, 'rgba(60,36,150,0.75)')
  glow(w * 0.95, h * 0.35, w * 0.7, 'rgba(90,30,130,0.55)')
  glow(w * 0.5, h, w * 0.9, 'rgba(14,52,96,0.75)')
  const rand = rng(seed)
  for (let i = 0; i < 260; i++) {
    const r = rand() < 0.08 ? 1.8 + rand() * 1.4 : 0.5 + rand() * 1.1
    ctx.globalAlpha = 0.25 + rand() * 0.7
    ctx.fillStyle = rand() < 0.15 ? GOLD : '#ffffff'
    ctx.beginPath()
    ctx.arc(rand() * w, rand() * h, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export function centerText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y, maxWidth)
}

/** Letter-spaced uppercase label (canvas letterSpacing isn't available everywhere). */
export function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const chars = [...text]
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let cx = x - total / 2
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + spacing })
}

function wheel(ctx: CanvasRenderingContext2D, chart: Chart, cx: number, cy: number, R: number) {
  const rotation = chart.hasHouses ? chart.asc : 0
  const ang = (lon: number) => (180 + lon - rotation) * rad
  const pt = (lon: number, r: number) => [cx + r * Math.cos(ang(lon)), cy - r * Math.sin(ang(lon))] as const
  const zIn = R * 0.84
  const pRing = R * 0.62
  const inner = R * 0.44

  // Halo
  const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.15)
  halo.addColorStop(0, 'rgba(167,139,250,0.28)')
  halo.addColorStop(0.7, 'rgba(60,40,140,0.15)')
  halo.addColorStop(1, 'rgba(7,6,26,0)')
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = 'rgba(13,11,42,0.85)'
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()

  // Zodiac ring
  SIGNS.forEach((s, i) => {
    const color = ELEMENT_INFO[s.element].color
    ctx.fillStyle = color + '22'
    ctx.beginPath()
    ctx.arc(cx, cy, R, -ang(i * 30), -ang(i * 30 + 30), true)
    ctx.arc(cx, cy, zIn, -ang(i * 30 + 30), -ang(i * 30), false)
    ctx.closePath()
    ctx.fill()
    const [x1, y1] = pt(i * 30, zIn)
    const [x2, y2] = pt(i * 30, R)
    ctx.strokeStyle = 'rgba(255,232,163,0.35)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    const [gx, gy] = pt(i * 30 + 15, (R + zIn) / 2)
    ctx.fillStyle = color
    ctx.font = `${R * 0.09}px ${SYMBOLS}`
    centerText(ctx, s.glyph, gx, gy + 2, R)
  })
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(255,232,163,0.55)'
  ctx.beginPath(); ctx.arc(cx, cy, zIn, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,232,163,0.18)'
  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2); ctx.stroke()

  // Houses and angles
  if (chart.hasHouses) {
    chart.cusps.forEach((c, i) => {
      const angle = i % 3 === 0
      const [x1, y1] = pt(c, angle ? 0 : inner)
      const [x2, y2] = pt(c, zIn)
      ctx.strokeStyle = angle ? 'rgba(255,232,163,0.75)' : 'rgba(255,255,255,0.12)'
      ctx.lineWidth = angle ? 2.5 : 1.2
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    })
    ctx.fillStyle = GOLD
    ctx.font = `600 ${R * 0.055}px ${DISPLAY}`
    const [ax, ay] = pt(chart.asc, zIn - R * 0.07)
    centerText(ctx, 'AC', ax + R * 0.02, ay - R * 0.04, R)
    const [mx, my] = pt(chart.mc, zIn - R * 0.07)
    centerText(ctx, 'MC', mx + R * 0.05, my, R)
  }

  // Aspects
  const keys = new Set<PointKey>(WHEEL_POINTS)
  for (const a of chart.aspects) {
    if (!keys.has(a.a) || !keys.has(a.b) || a.a === 'lilith' || a.b === 'lilith' || a.a === 'fortune' || a.b === 'fortune') continue
    if (!a.type.major) continue
    const [x1, y1] = pt(chart.points[a.a].lon, inner)
    const [x2, y2] = pt(chart.points[a.b].lon, inner)
    ctx.strokeStyle = a.type.color
    ctx.globalAlpha = Math.max(0.25, 0.85 - a.orb / 10)
    ctx.lineWidth = a.orb < 2 ? 2.4 : 1.4
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Planets
  const items = WHEEL_POINTS.filter((k) => k !== 'fortune' && k !== 'lilith').map((k) => ({ key: k, lon: chart.points[k].lon }))
  for (const p of spread(items, 7.5)) {
    const [tx1, ty1] = pt(p.lon, zIn)
    const [tx2, ty2] = pt(p.lon, zIn - R * 0.04)
    ctx.strokeStyle = POINTS[p.key].color
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2); ctx.stroke()
    const [gx, gy] = pt(p.pos, (zIn + pRing) / 2 - R * 0.02)
    ctx.fillStyle = 'rgba(13,11,42,0.75)'
    ctx.beginPath(); ctx.arc(gx, gy, R * 0.058, 0, Math.PI * 2); ctx.fill()
    ctx.shadowColor = POINTS[p.key].color
    ctx.shadowBlur = 14
    ctx.fillStyle = POINTS[p.key].color
    ctx.font = `${R * 0.092}px ${SYMBOLS}`
    centerText(ctx, POINTS[p.key].glyph, gx, gy + 1, R)
    ctx.shadowBlur = 0
  }

  // Sun at the centre
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.07)
  core.addColorStop(0, '#fff7d6')
  core.addColorStop(1, 'rgba(255,232,163,0)')
  ctx.fillStyle = core
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.07, 0, Math.PI * 2); ctx.fill()
}

/** Rounded rectangle path (ctx.roundRect is missing on older iPhones). */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function bigThreeCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string, sign: number) {
  const s = SIGNS[sign]
  const color = ELEMENT_INFO[s.element].color
  ctx.fillStyle = 'rgba(22,18,58,0.72)'
  ctx.strokeStyle = 'rgba(255,232,163,0.28)'
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, 28)
  ctx.fill(); ctx.stroke()
  const cx = x + w / 2
  ctx.fillStyle = 'rgba(201,195,230,0.9)'
  ctx.font = `500 ${h * 0.13}px ${SANS}`
  spaced(ctx, label.toUpperCase(), cx, y + h * 0.2, 3)
  ctx.fillStyle = color
  ctx.font = `${h * 0.32}px ${SYMBOLS}`
  centerText(ctx, s.glyph, cx, y + h * 0.5, w)
  ctx.fillStyle = '#f3efff'
  ctx.font = `600 ${h * 0.16}px ${DISPLAY}`
  centerText(ctx, s.name, cx, y + h * 0.8, w - 20)
}

export interface ShareOptions {
  format: ShareFormat
  showName: boolean
}

/** Draws the shareable image and returns it as a PNG blob. */
export async function renderShareImage(chart: Chart, { format, showName }: ShareOptions): Promise<Blob> {
  await loadFonts()
  const { w, h } = SHARE_SIZES[format]
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const seed = Math.round(chart.points.sun.lon * 1000 + chart.points.moon.lon * 7)
  background(ctx, w, h, seed)

  const story = format === 'story'
  const name = chart.birth?.name?.trim()
  const top = story ? 170 : 90

  ctx.fillStyle = GOLD
  ctx.font = `500 30px ${SANS}`
  spaced(ctx, '✶  COSMIC SKY  ✶', w / 2, top, 6)

  const title = showName && name ? name : 'Meu mapa astral'
  const grad = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, 0)
  grad.addColorStop(0, '#ffe8a3')
  grad.addColorStop(0.5, '#ffffff')
  grad.addColorStop(1, '#ffe8a3')
  ctx.fillStyle = grad
  ctx.shadowColor = 'rgba(255,232,163,0.55)'
  ctx.shadowBlur = 30
  ctx.font = `600 ${story ? 86 : 72}px ${DISPLAY}`
  centerText(ctx, title, w / 2, top + (story ? 100 : 82), w - 120)
  ctx.shadowBlur = 0

  const sunTitle = SIGN_TEXT[chart.points.sun.sign]?.title
  if (sunTitle) {
    ctx.fillStyle = '#c9c3e6'
    ctx.font = `italic 500 ${story ? 46 : 40}px ${SERIF}`
    centerText(ctx, `“${sunTitle}”`, w / 2, top + (story ? 180 : 150), w - 160)
  }

  const R = story ? 400 : 330
  const wheelY = story ? 900 : 610
  wheel(ctx, chart, w / 2, wheelY, R)

  const cards: [string, number][] = [
    ['☉ Sol', chart.points.sun.sign],
    ['☽ Lua', chart.points.moon.sign],
  ]
  if (chart.hasHouses) cards.push(['Ascendente', chart.points.asc.sign])
  const gap = 24
  const cw = (w - 120 - gap * (cards.length - 1)) / cards.length
  const ch = story ? 250 : 210
  const cy = wheelY + R + (story ? 90 : 50)
  cards.forEach(([label, sign], i) => bigThreeCard(ctx, 60 + i * (cw + gap), cy, cw, ch, label, sign))

  // Call to action
  const footY = h - (story ? 190 : 95)
  ctx.fillStyle = '#f3efff'
  ctx.font = `600 ${story ? 44 : 38}px ${DISPLAY}`
  centerText(ctx, 'Descubra o seu mapa ✦ grátis', w / 2, footY, w - 100)
  ctx.fillStyle = GOLD
  ctx.font = `500 ${story ? 30 : 26}px ${SANS}`
  centerText(ctx, shareUrlLabel(), w / 2, footY + (story ? 62 : 50), w - 80)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar a imagem.'))), 'image/png'))
}
