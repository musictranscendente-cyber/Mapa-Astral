import { describe, expect, it } from 'vitest'
import { chartFromBirth } from './chart'
import { lunations, personalize } from './lunations'

describe('eclipses e lunações', () => {
  const list = lunations(new Date('2026-01-01T00:00:00Z'), 12)
  it('lists about 25 new and full moons in a year', () => {
    expect(list.length).toBeGreaterThanOrEqual(24)
    expect(list.length).toBeLessThanOrEqual(26)
  })
  it('finds the total solar eclipse of 12 Aug 2026 in Leo and the total lunar eclipse of 3 Mar 2026 in Virgo', () => {
    const solar = list.find((l) => l.eclipse && l.kind === 'nova' && l.date.toISOString().startsWith('2026-08-12'))
    expect(solar?.eclipse).toBe('total')
    expect(solar?.sign).toBe(4)
    const lunar = list.find((l) => l.eclipse && l.kind === 'cheia' && l.date.toISOString().startsWith('2026-03-03'))
    expect(lunar?.eclipse).toBe('total')
    expect(lunar?.sign).toBe(5)
  })
  it('places lunations in natal houses', () => {
    const natal = chartFromBirth({ name: 'T', local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 }, timeZone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.63, place: 'SP' })
    const p = personalize(list[0], natal)
    expect(p.house).toBeGreaterThanOrEqual(1)
    expect(p.house).toBeLessThanOrEqual(12)
  })
})
