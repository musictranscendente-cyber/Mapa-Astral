import { describe, expect, it } from 'vitest'
import { horoscope } from './horoscope'
import { horoscopeText } from '../interpret/horoscope'
import { bodyLongitude, toTime } from './ephemeris'

describe('horóscopo do dia', () => {
  const day = new Date(2026, 9, 24)
  it('places the Moon in the right solar house for every sign', () => {
    const moonSign = Math.floor(bodyLongitude('moon', toTime(new Date(2026, 9, 24, 12))) / 30)
    for (let s = 0; s < 12; s++) {
      const h = horoscope(s, day)
      expect(h.planets.moon.sign).toBe(moonSign)
      expect(h.planets.moon.house).toBe(((moonSign - s + 12) % 12) + 1)
      for (const v of Object.values(h.scores)) expect(v).toBeGreaterThanOrEqual(1)
      const t = horoscopeText(h)
      expect(t.day.length).toBeGreaterThan(40)
      expect(t.love && t.work && t.mind && t.headline).toBeTruthy()
    }
  })
  it('finds the hour the Moon changes sign', () => {
    // Over 3 days the Moon always changes sign at least once.
    const hits = [0, 1, 2].map((d) => horoscope(0, new Date(2026, 9, 24 + d)).moonIngress).filter(Boolean)
    expect(hits.length).toBeGreaterThan(0)
    for (const m of hits) {
      const before = Math.floor(bodyLongitude('moon', toTime(new Date(m!.at.getTime() - 120000))) / 30)
      expect(before).not.toBe(m!.sign)
      expect(Math.floor(bodyLongitude('moon', toTime(new Date(m!.at.getTime() + 60000))) / 30)).toBe(m!.sign)
    }
  })
})
