import { ELEMENT_INFO, SIGNS } from '../astro/constants'
import type { Chart } from '../astro/chart'
import { SYN_AREAS, type SynScore } from '../astro/synastry'
import { synSummary } from '../interpret/synastry'
import { DISPLAY, GOLD, SANS, SERIF, SYMBOLS, background, centerText, loadFonts, roundRect, spaced } from './shareImage'

export const sintoniaUrl = () => `${window.location.origin}${window.location.pathname}?ref=sintonia#/sintonia`

/** Stories image (1080×1920) for the quick compatibility test. */
export async function renderSintoniaImage(a: { name: string; chart: Chart }, b: { name: string; chart: Chart }, score: SynScore): Promise<Blob> {
  await loadFonts()
  const w = 1080
  const h = 1920
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  background(ctx, w, h, Math.round(a.chart.points.sun.lon * 100 + b.chart.points.sun.lon))

  ctx.fillStyle = GOLD
  ctx.font = `500 30px ${SANS}`
  spaced(ctx, '✶  COSMIC SKY  ✶', w / 2, 170, 6)
  ctx.fillStyle = '#c9c3e6'
  ctx.font = `italic 500 52px ${SERIF}`
  centerText(ctx, 'Qual é a nossa sintonia?', w / 2, 260, w - 120)

  // Names and Sun signs
  const person = (x: number, name: string, c: Chart) => {
    const s = SIGNS[c.points.sun.sign]
    ctx.fillStyle = ELEMENT_INFO[s.element].color
    ctx.font = `120px ${SYMBOLS}`
    centerText(ctx, s.glyph, x, 420, 300)
    ctx.fillStyle = '#f3efff'
    ctx.font = `600 54px ${DISPLAY}`
    centerText(ctx, name, x, 540, 420)
    ctx.fillStyle = '#c9c3e6'
    ctx.font = `500 32px ${SANS}`
    centerText(ctx, s.name, x, 595, 420)
  }
  person(w * 0.27, a.name, a.chart)
  person(w * 0.73, b.name, b.chart)
  ctx.fillStyle = '#ff8fc7'
  ctx.font = `90px ${SYMBOLS}`
  centerText(ctx, '♡', w / 2, 450, 120)

  // Score ring
  const cx = w / 2
  const cy = 820
  const R = 190
  ctx.lineWidth = 26
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()
  const grad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R)
  grad.addColorStop(0, '#ff8fc7')
  grad.addColorStop(1, GOLD)
  ctx.strokeStyle = grad
  ctx.lineCap = 'round'
  ctx.shadowColor = 'rgba(255,143,199,0.6)'
  ctx.shadowBlur = 30
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score.total) / 100); ctx.stroke()
  ctx.shadowBlur = 0
  ctx.fillStyle = '#ffffff'
  ctx.font = `600 140px ${DISPLAY}`
  centerText(ctx, `${score.total}%`, cx, cy + 6, 2 * R)
  const sum = synSummary(score.total)
  ctx.fillStyle = GOLD
  ctx.font = `600 58px ${DISPLAY}`
  centerText(ctx, sum.title, cx, cy + R + 100, w - 120)

  // Areas
  let y = cy + R + 170
  for (const area of SYN_AREAS) {
    const v = score.areas[area.key]
    ctx.fillStyle = '#f3efff'
    ctx.font = `500 34px ${SANS}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(area.name, 110, y)
    ctx.textAlign = 'right'
    ctx.fillText(`${v}`, w - 110, y)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    roundRect(ctx, 110, y + 30, w - 220, 14, 7)
    ctx.fill()
    ctx.fillStyle = area.color
    roundRect(ctx, 110, y + 30, Math.max(14, ((w - 220) * v) / 100), 14, 7)
    ctx.fill()
    y += 84
  }

  ctx.fillStyle = '#f3efff'
  ctx.font = `600 46px ${DISPLAY}`
  centerText(ctx, 'Faça o teste com quem você ama ✦', w / 2, h - 150, w - 100)
  ctx.fillStyle = GOLD
  ctx.font = `500 30px ${SANS}`
  centerText(ctx, `${window.location.host}${window.location.pathname}`.replace(/\/$/, ''), w / 2, h - 92, w - 80)

  return new Promise((resolve, reject) => canvas.toBlob((bl) => (bl ? resolve(bl) : reject(new Error('Falha ao gerar a imagem.'))), 'image/png'))
}
