import { describe, expect, it } from 'vitest'
import { chartFromBirth } from './chart'
import { angDiff } from './constants'
import { bodyLongitude, toTime } from './ephemeris'
import { currentLunarReturn, nextLunarReturn, previousLunarReturn } from './lunarReturn'

describe('retorno lunar', () => {
  const natal = chartFromBirth({ name: 'T', local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 }, timeZone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.63, place: 'SP' })
  const now = new Date('2026-10-24T12:00:00Z')
  const r = currentLunarReturn(natal, now)
  it('returns the Moon to its natal degree (< 1″)', () => {
    expect(Math.abs(angDiff(bodyLongitude('moon', toTime(r)), natal.points.moon.lon)) * 3600).toBeLessThan(1)
  })
  it('is the last return before now, about 27.3 days apart', () => {
    const next = nextLunarReturn(natal, r)
    expect(r.getTime()).toBeLessThanOrEqual(now.getTime())
    expect(next.getTime()).toBeGreaterThan(now.getTime())
    const days = (next.getTime() - r.getTime()) / 86400000
    expect(days).toBeGreaterThan(27)
    expect(days).toBeLessThan(27.7)
    expect(Math.abs(previousLunarReturn(natal, next).getTime() - r.getTime())).toBeLessThan(1000)
  })
})
