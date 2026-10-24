import { describe, expect, it } from 'vitest'
import { chartFromBirth } from './chart'
import { angDiff } from './constants'
import { progressedDate, progressions, upcomingProgressions } from './progressions'

describe('progressões e arcos solares', () => {
  const natal = chartFromBirth({ name: 'T', local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 }, timeZone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.63, place: 'SP' })
  const at = new Date('2026-10-24T12:00:00Z')
  it('advances one day per year of life', () => {
    const days = (progressedDate(natal, at).getTime() - natal.date.getTime()) / 86400000
    expect(days).toBeGreaterThan(36.3)
    expect(days).toBeLessThan(36.4)
  })
  it('solar arc ≈ 35° at age 36 (Sun near aphelion moves ~0.95°/day)', () => {
    const p = progressions(natal, at)
    expect(p.arc).toBeGreaterThan(33.5)
    expect(p.arc).toBeLessThan(36.5)
    expect(p.moonIngress.date.getTime()).toBeGreaterThan(at.getTime())
    for (const a of [...p.progressed, ...p.directed]) expect(a.orb).toBeLessThanOrEqual(1)
  })
  it('finds exact progressed/directed aspects in the next 3 years', () => {
    const ev = upcomingProgressions(natal, at, 3)
    expect(ev.length).toBeGreaterThan(0)
    // each event is exact at its date
    const e = ev.find((x) => x.kind === 'progressão')
    if (e) {
      const p = progressions(natal, e.date)
      const lon = p.chart.points[e.moving].lon
      const sep = Math.abs(angDiff(lon, natal.points[e.natal].lon))
      expect(Math.abs(sep - e.type.angle)).toBeLessThan(0.05)
    }
  })
})
