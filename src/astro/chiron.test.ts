import { describe, expect, it } from 'vitest'
import * as A from 'astronomy-engine'
import refs from './chiron-refs.json'
import { chironEcliptic } from './chiron'
import { angDiff } from './constants'
import { bodySpeed } from './ephemeris'

describe('Quíron', () => {
  it('matches the Swiss Ephemeris within 1 arcminute (1800–2100)', () => {
    let worst = 0
    for (const r of refs as { jd_ut: number; lon: number; speed: number }[]) {
      const t = A.MakeTime(new Date((r.jd_ut - 2440587.5) * 86400000))
      const d = Math.abs(angDiff(chironEcliptic(t).lon, r.lon)) * 60
      worst = Math.max(worst, d)
      expect(d, `JD ${r.jd_ut}`).toBeLessThan(1)
      expect(Math.sign(bodySpeed('chiron', t))).toBe(Math.sign(r.speed))
    }
    console.log(`Quíron: maior diferença ${worst.toFixed(3)}′`)
  })

  it('was at 3° Taurus when discovered (1 Nov 1977)', () => {
    const lon = chironEcliptic(A.MakeTime(new Date('1977-11-01T00:00:00Z'))).lon
    expect(lon).toBeGreaterThan(33)
    expect(lon).toBeLessThan(34)
  })
})
