import { describe, expect, it } from 'vitest'
import { chartFromBirth, type BirthData } from './chart'
import { angDiff } from './constants'
import { bodyLongitude, toTime } from './ephemeris'
import { currentReturnYear, solarReturnChart, solarReturnDate } from './solarReturn'
import { houseOverlays, synastryAspects, synastryScore } from './synastry'
import { buildDailyMessages } from '../lib/notifications'
import { buildUserPrompt, chartSummary, synastrySummary } from '../ai/prompts'

const ana: BirthData = {
  name: 'Ana Luz', place: 'São Paulo', latitude: -23.55, longitude: -46.63,
  timeZone: 'America/Sao_Paulo', local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 },
}
const bruno: BirthData = {
  name: 'Bruno Sol', place: 'Lisboa', latitude: 38.72, longitude: -9.14,
  timeZone: 'Europe/Lisbon', local: { year: 1988, month: 11, day: 3, hour: 22, minute: 15 },
}

describe('revolução solar', () => {
  const natal = chartFromBirth(ana)

  it('o Sol volta exatamente à longitude natal', () => {
    for (const year of [2000, 2025, 2026, 2040]) {
      const d = solarReturnDate(natal, year)
      const lon = bodyLongitude('sun', toTime(d))
      expect(Math.abs(angDiff(lon, natal.points.sun.lon))).toBeLessThan(1e-4)
      expect(d.getUTCFullYear()).toBe(year)
      // Within a couple of days of the birthday.
      expect(Math.abs(d.getUTCMonth() * 31 + d.getUTCDate() - (5 * 31 + 15))).toBeLessThanOrEqual(2)
    }
  })

  it('usa o local escolhido para as casas', () => {
    const a = solarReturnChart(natal, 2026, { latitude: -23.55, longitude: -46.63 })
    const b = solarReturnChart(natal, 2026, { latitude: 38.72, longitude: -9.14 })
    expect(a.date.getTime()).toBe(b.date.getTime())
    expect(Math.abs(angDiff(a.asc, b.asc))).toBeGreaterThan(5)
  })

  it('ano atual da revolução', () => {
    expect(currentReturnYear(natal, new Date('2026-10-01T12:00:00Z'))).toBe(2026)
    expect(currentReturnYear(natal, new Date('2026-03-01T12:00:00Z'))).toBe(2025)
  })
})

describe('sinastria', () => {
  const A = chartFromBirth(ana)
  const B = chartFromBirth(bruno)

  it('encontra aspectos dentro do orbe e pontua em faixa válida', () => {
    const asp = synastryAspects(A, B)
    expect(asp.length).toBeGreaterThan(5)
    for (const s of asp) {
      const sep = Math.abs(angDiff(A.points[s.a].lon, B.points[s.b].lon))
      expect(Math.abs(sep - s.type.angle)).toBeCloseTo(s.orb, 6)
    }
    const score = synastryScore(asp)
    expect(score.total).toBeGreaterThan(0)
    expect(score.total).toBeLessThanOrEqual(100)
  })

  it('é simétrica ao trocar as pessoas', () => {
    const ab = synastryAspects(A, B).map((s) => `${s.a}-${s.b}-${s.type.key}`).sort()
    const ba = synastryAspects(B, A).map((s) => `${s.b}-${s.a}-${s.type.key}`).sort()
    expect(ab).toEqual(ba)
  })

  it('sobreposição de casas cobre os planetas', () => {
    expect(houseOverlays(A, B)).toHaveLength(10)
  })
})

describe('notificações e IA', () => {
  const natal = chartFromBirth(ana)

  it('gera uma mensagem por dia', () => {
    const msgs = buildDailyMessages(natal, 8, 5)
    expect(msgs).toHaveLength(5)
    expect(new Set(msgs.map((m) => m.date)).size).toBe(5)
    for (const m of msgs) {
      expect(m.title.length).toBeGreaterThan(5)
      expect(m.body.length).toBeGreaterThan(5)
    }
  })

  it('resumo para a IA contém as posições calculadas', () => {
    const s = chartSummary(natal)
    expect(s).toContain('Sol: 24°13\' Gêmeos')
    expect(s).toContain('Ascendente')
    const syn = synastrySummary(natal, chartFromBirth(bruno), synastryAspects(natal, chartFromBirth(bruno)), 70)
    expect(syn).toContain('Pessoa B')
    expect(buildUserPrompt('natal', s)).toContain('<dados>')
  })
})
