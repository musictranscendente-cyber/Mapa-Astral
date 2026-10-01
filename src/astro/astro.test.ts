import * as A from 'astronomy-engine'
import { describe, expect, it } from 'vitest'
import { angDiff, formatDegree, norm360 } from './constants'
import { chartFromBirth, computeChart } from './chart'
import { bodyLongitude, meeusTrueNode, toTime, trueNode } from './ephemeris'
import { computeHouses, houseOf } from './houses'
import { localToUtc } from './time'
import { findTransitEvents, scoreDay } from './transits'

const rad = Math.PI / 180

/** Ecliptic-of-date (lon, lat=0) → horizontal coordinates, computed independently. */
function horizonOfEclipticPoint(date: Date, lat: number, lon: number, eclLon: number) {
  const t = toTime(date)
  const eps = A.e_tilt(t).tobl * rad
  const l = eclLon * rad
  const ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l)) / rad
  const dec = Math.asin(Math.sin(eps) * Math.sin(l)) / rad
  const obs = new A.Observer(lat, lon, 0)
  return A.Horizon(t, obs, norm360(ra) / 15, dec, undefined)
}

const SAMPLES = [
  { date: new Date('1990-06-15T14:30:00Z'), lat: -23.55, lon: -46.63 }, // São Paulo
  { date: new Date('1985-12-03T03:10:00Z'), lat: 38.72, lon: -9.14 }, // Lisboa
  { date: new Date('2001-09-21T21:45:00Z'), lat: 40.71, lon: -74.0 }, // Nova York
  { date: new Date('1972-02-28T08:00:00Z'), lat: -33.87, lon: 151.21 }, // Sydney
  { date: new Date('2024-04-08T18:00:00Z'), lat: 59.33, lon: 18.07 }, // Estocolmo
]

describe('ângulos do mapa', () => {
  for (const s of SAMPLES) {
    it(`ASC no horizonte leste e MC no meridiano — ${s.date.toISOString()}`, () => {
      const c = computeChart(s.date, s.lat, s.lon)
      const asc = horizonOfEclipticPoint(s.date, s.lat, s.lon, c.asc)
      expect(Math.abs(asc.altitude)).toBeLessThan(0.01)
      expect(asc.azimuth).toBeGreaterThan(0)
      expect(asc.azimuth).toBeLessThan(180) // east
      const mc = horizonOfEclipticPoint(s.date, s.lat, s.lon, c.mc)
      // On the meridian the azimuth is 0 or 180.
      const az = mc.azimuth
      expect(Math.min(Math.abs(az), Math.abs(az - 180), Math.abs(az - 360))).toBeLessThan(0.02)
      // MC is the upper culmination.
      const ic = horizonOfEclipticPoint(s.date, s.lat, s.lon, c.mc + 180)
      expect(mc.altitude).toBeGreaterThan(ic.altitude)
    })
  }
})

describe('casas Placidus', () => {
  it('cada cúspide trissecta o semi-arco do próprio grau', () => {
    for (const s of SAMPLES) {
      const c = computeChart(s.date, s.lat, s.lon, 'placidus')
      const eps = c.obliquity
      const check = (cusp: number, frac: number, above: boolean) => {
        const l = cusp * rad
        const e = eps * rad
        const ra = norm360(Math.atan2(Math.sin(l) * Math.cos(e), Math.cos(l)) / rad)
        const dec = Math.asin(Math.sin(e) * Math.sin(l))
        const ad = Math.asin(Math.tan(s.lat * rad) * Math.tan(dec)) / rad
        if (above) {
          const md = norm360(ra - c.ramc) // eastward meridian distance
          expect(Math.abs(md - frac * (90 + ad))).toBeLessThan(1e-4)
        } else {
          const md = norm360(c.ramc + 180 - ra)
          expect(Math.abs(md - frac * (90 - ad))).toBeLessThan(1e-4)
        }
      }
      check(c.cusps[10], 1 / 3, true)
      check(c.cusps[11], 2 / 3, true)
      check(c.cusps[1], 2 / 3, false)
      check(c.cusps[2], 1 / 3, false)
    }
  })

  it('cúspides seguem a ordem zodiacal', () => {
    for (const sys of ['placidus', 'koch', 'porphyry', 'equal', 'whole'] as const) {
      const h = computeHouses(sys, 123.4, 23.44, -23.5)
      let total = 0
      for (let i = 0; i < 12; i++) total += norm360(h.cusps[(i + 1) % 12] - h.cusps[i])
      expect(total).toBeCloseTo(360, 6)
    }
  })

  it('cai para Porfírio acima do círculo polar quando necessário', () => {
    const h = computeHouses('placidus', 200, 23.44, 75)
    expect(h.cusps).toHaveLength(12)
  })

  it('houseOf localiza corretamente', () => {
    const cusps = Array.from({ length: 12 }, (_, i) => norm360(350 + i * 30))
    expect(houseOf(355, cusps)).toBe(1)
    expect(houseOf(10, cusps)).toBe(1)
    expect(houseOf(21, cusps)).toBe(2)
    expect(houseOf(349, cusps)).toBe(12)
  })
})

describe('efemérides', () => {
  it('Sol no J2000 ~ 280°22′ (aparente)', () => {
    const lon = bodyLongitude('sun', toTime(new Date('2000-01-01T12:00:00Z')))
    expect(Math.abs(lon - 280.3689)).toBeLessThan(0.005)
  })

  it('Lua coincide com o modelo eclíptico independente', () => {
    for (const s of SAMPLES) {
      const lon = bodyLongitude('moon', toTime(s.date))
      const ref = A.EclipticGeoMoon(s.date).lon
      // EclipticGeoMoon is geometric (no light-time) — difference must stay under ~0.01°.
      expect(Math.abs(angDiff(lon, ref))).toBeLessThan(0.02)
    }
  })

  it('Nodo Norte osculador concorda com a série analítica de Meeus', () => {
    for (const s of SAMPLES) {
      const t = toTime(s.date)
      expect(Math.abs(angDiff(trueNode(t), meeusTrueNode(t)))).toBeLessThan(0.25)
    }
  })

  it('formata graus no signo', () => {
    expect(formatDegree(0)).toBe("0°00' Áries")
    expect(formatDegree(359.999)).toBe("29°59' Peixes")
    expect(formatDegree(45.5)).toBe("15°30' Touro")
  })
})

describe('fuso horário', () => {
  it('aplica horário de verão histórico do Brasil', () => {
    const summer = localToUtc({ year: 1990, month: 1, day: 15, hour: 10, minute: 0 }, 'America/Sao_Paulo')
    expect(summer.toISOString()).toBe('1990-01-15T12:00:00.000Z')
    const now = localToUtc({ year: 2020, month: 1, day: 15, hour: 10, minute: 0 }, 'America/Sao_Paulo')
    expect(now.toISOString()).toBe('2020-01-15T13:00:00.000Z')
  })

  it('aceita deslocamento manual UTC±h', () => {
    const d = localToUtc({ year: 2000, month: 6, day: 1, hour: 12, minute: 0 }, 'UTC+5:30')
    expect(d.toISOString()).toBe('2000-06-01T06:30:00.000Z')
  })
})

describe('trânsitos', () => {
  const natal = chartFromBirth({
    name: 'Teste', place: 'São Paulo', latitude: -23.55, longitude: -46.63,
    timeZone: 'America/Sao_Paulo', local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 },
  })

  it('eventos encontrados são exatos (< 0,01°)', () => {
    const start = new Date('2026-01-01T00:00:00Z')
    const events = findTransitEvents(natal, start, 60, ['sun', 'mars', 'saturn'])
    expect(events.length).toBeGreaterThan(5)
    for (const e of events) {
      const lon = bodyLongitude(e.transit, toTime(e.exact))
      const natalLon = natal.points[e.natal].lon
      const sep = Math.abs(angDiff(natalLon, lon))
      expect(Math.abs(sep - e.type.angle)).toBeLessThan(0.01)
      expect(e.start.getTime()).toBeLessThanOrEqual(e.exact.getTime())
      expect(e.end.getTime()).toBeGreaterThanOrEqual(e.exact.getTime())
    }
  })

  it('pontua o dia em faixas válidas', () => {
    const s = scoreDay(natal, new Date('2026-10-01T12:00:00Z'))
    expect(s.flow).toBeGreaterThanOrEqual(-100)
    expect(s.flow).toBeLessThanOrEqual(100)
    for (const v of Object.values(s.areas)) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    }
  })
})
