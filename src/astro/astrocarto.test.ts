import { describe, expect, it } from 'vitest'
import * as A from 'astronomy-engine'
import { chartFromBirth } from './chart'
import { astroLines } from './astrocarto'

describe('astrocartografia', () => {
  const natal = chartFromBirth({ name: 'T', local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 }, timeZone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.63, place: 'SP' })
  const lines = astroLines(natal)
  it('the Sun really is on the meridian along its MC line', () => {
    const mc = lines.find((l) => l.planet === 'sun' && l.angle === 'MC')!
    const lon = mc.segments[0][0][0]
    const hor = A.Horizon(A.MakeTime(natal.date), new A.Observer(0, lon, 0), ...(() => { const e = A.Equator(A.Body.Sun, natal.date, new A.Observer(0, lon, 0), true, true); return [e.ra, e.dec] as const })(), 'normal')
    // On the meridian the azimuth is due north or south.
    expect(Math.min(Math.abs(hor.azimuth - 180), Math.abs(hor.azimuth), Math.abs(hor.azimuth - 360))).toBeLessThan(1)
  })
  it('the Sun is on the horizon along its AC line', () => {
    const ac = lines.find((l) => l.planet === 'sun' && l.angle === 'AC')!
    const [lon, lat] = ac.segments[0][Math.floor(ac.segments[0].length / 2)]
    const obs = new A.Observer(lat, lon, 0)
    const eq = A.Equator(A.Body.Sun, natal.date, obs, true, true)
    const hor = A.Horizon(A.MakeTime(natal.date), obs, eq.ra, eq.dec)
    expect(Math.abs(hor.altitude)).toBeLessThan(1)
  })
})
