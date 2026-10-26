import { POINTS, type PlanetKey } from '../astro/constants'
import type { AcgLine } from '../astro/astrocarto'
import { WORLD_LAND_PATH } from './worldPath'
import { DISPLAY, GOLD, SANS, SERIF, SYMBOLS, background, centerText, loadFonts, roundRect, spaced } from './shareImage'

export const astroMapUrl = () => `${window.location.origin}${window.location.pathname}?ref=astrocartografia#/astrocartografia`

const DASH: Record<string, number[]> = { AC: [], MC: [], DC: [9, 6], IC: [3, 5] }

/** Feed image (1080×1350) of the world map with the person's planetary lines. */
export async function renderAstroMapImage(name: string, lines: AcgLine[], planets: PlanetKey[], birth: { latitude: number; longitude: number }): Promise<Blob> {
  await loadFonts()
  const w = 1080
  const h = 1350
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  background(ctx, w, h, Math.round(birth.longitude * 100 + birth.latitude))

  ctx.fillStyle = GOLD
  ctx.font = `500 28px ${SANS}`
  spaced(ctx, '✶  COSMIC SKY  ✶', w / 2, 100, 6)
  ctx.fillStyle = '#c9c3e6'
  ctx.font = `italic 500 46px ${SERIF}`
  centerText(ctx, 'Onde no mundo o meu céu brilha', w / 2, 180, w - 120)
  ctx.fillStyle = '#f3efff'
  ctx.font = `600 64px ${DISPLAY}`
  centerText(ctx, name, w / 2, 262, w - 120)

  // Map: same projection as the page (lon −180…180, lat 78…−72)
  const mx = 40
  const my = 330
  const mw = w - 2 * mx
  const s = mw / 360
  const mh = 150 * s
  ctx.save()
  roundRect(ctx, mx, my, mw, mh, 24)
  ctx.clip()
  ctx.fillStyle = '#0a0d2c'
  ctx.fillRect(mx, my, mw, mh)
  ctx.translate(mx, my - 12 * s)
  ctx.scale(s, s)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 0.25
  for (const lat of [-60, -30, 0, 30, 60]) { ctx.beginPath(); ctx.moveTo(0, 90 - lat); ctx.lineTo(360, 90 - lat); ctx.stroke() }
  const land = new Path2D(WORLD_LAND_PATH)
  ctx.fillStyle = 'rgba(167,139,250,0.2)'
  ctx.fill(land)
  ctx.strokeStyle = 'rgba(201,195,230,0.4)'
  ctx.lineWidth = 0.25
  ctx.stroke(land)
  for (const l of lines) {
    if (!planets.includes(l.planet)) continue
    ctx.strokeStyle = POINTS[l.planet].color
    ctx.lineWidth = l.angle === 'MC' || l.angle === 'AC' ? 0.9 : 0.7
    ctx.setLineDash(DASH[l.angle].map((d) => d / s))
    for (const seg of l.segments) {
      ctx.beginPath()
      seg.forEach(([lon, lat], i) => (i ? ctx.lineTo(lon + 180, 90 - lat) : ctx.moveTo(lon + 180, 90 - lat)))
      ctx.stroke()
    }
  }
  ctx.setLineDash([])
  // planet glyph at the top of each MC line, to tell the lines apart
  ctx.font = `9px ${SYMBOLS}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (const l of lines) {
    if (l.angle !== 'MC' || !planets.includes(l.planet)) continue
    const x = l.segments[0][0][0] + 180
    ctx.fillStyle = 'rgba(10,13,44,0.85)'
    ctx.beginPath(); ctx.arc(x, 20, 6, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = POINTS[l.planet].color
    ctx.fillText(POINTS[l.planet].glyph, x, 15.6)
  }
  ctx.fillStyle = GOLD
  ctx.strokeStyle = '#07061a'
  ctx.lineWidth = 0.5
  ctx.beginPath(); ctx.arc(birth.longitude + 180, 90 - birth.latitude, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,232,163,0.35)'
  ctx.lineWidth = 2
  roundRect(ctx, mx, my, mw, mh, 24)
  ctx.stroke()

  // Line styles
  let y = my + mh + 70
  const styles: [string, number[]][] = [['AC / MC', []], ['DC', [14, 10]], ['IC', [4, 9]]]
  const colW = (w - 160) / styles.length
  styles.forEach(([label, dash], i) => {
    const x = 80 + i * colW
    ctx.strokeStyle = '#f3efff'
    ctx.lineWidth = 4
    ctx.setLineDash(dash)
    ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x + 90, y); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#c9c3e6'
    ctx.font = `500 30px ${SANS}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x + 110, y)
  })
  ctx.fillStyle = GOLD
  ctx.beginPath(); ctx.arc(w / 2 - 130, y + 66, 11, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#c9c3e6'
  ctx.textAlign = 'left'
  ctx.fillText('meu nascimento', w / 2 - 106, y + 66)

  // Planets shown
  y += 170
  const cols = 3
  const cellW = (w - 160) / cols
  planets.forEach((k, i) => {
    const x = 80 + (i % cols) * cellW
    const yy = y + Math.floor(i / cols) * 64
    ctx.fillStyle = POINTS[k].color
    ctx.font = `40px ${SYMBOLS}`
    ctx.textAlign = 'left'
    ctx.fillText(POINTS[k].glyph, x, yy)
    ctx.fillStyle = '#f3efff'
    ctx.font = `500 32px ${SANS}`
    ctx.fillText(POINTS[k].name, x + 54, yy)
  })

  ctx.fillStyle = GOLD
  ctx.font = `500 28px ${SANS}`
  centerText(ctx, `Faça a sua em ${`${window.location.host}${window.location.pathname}`.replace(/\/$/, '')}`, w / 2, h - 60, w - 80)

  return new Promise((resolve, reject) => canvas.toBlob((bl) => (bl ? resolve(bl) : reject(new Error('Falha ao gerar a imagem.'))), 'image/png'))
}
