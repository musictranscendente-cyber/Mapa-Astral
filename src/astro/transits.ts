import { ASPECTS, POINTS, angDiff, norm360, type AspectInfo, type PlanetKey, type PointKey } from './constants'
import { bodyLongitude, bodySpeed, toTime } from './ephemeris'
import { houseOf } from './houses'
import type { Chart } from './chart'

export const TRANSIT_PLANETS: PlanetKey[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node',
]

export const NATAL_TARGETS: PointKey[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc',
]

/** How strongly a transiting body is felt (slow movers = deep, long-lasting). */
export const TRANSIT_WEIGHT: Partial<Record<PlanetKey, number>> = {
  pluto: 5, neptune: 4.5, uranus: 4.5, saturn: 4, jupiter: 3, node: 2,
  mars: 2.5, sun: 2, venus: 1.6, mercury: 1.4, moon: 1,
}

const NATAL_WEIGHT: Partial<Record<PointKey, number>> = {
  sun: 3, moon: 3, asc: 3, mc: 2.5, mercury: 1.8, venus: 2, mars: 2,
  jupiter: 1.4, saturn: 1.6, uranus: 1, neptune: 1, pluto: 1.2,
}

/** Orbs used for transits — tighter than natal orbs. */
export function transitOrb(type: AspectInfo, transit: PlanetKey): number {
  const base = { conjunction: 3, opposition: 3, square: 2.5, trine: 2.5, sextile: 2, quincunx: 1, semisextile: 0 }[type.key]
  if (transit === 'moon') return base + 2
  if (transit === 'sun' || transit === 'mercury' || transit === 'venus' || transit === 'mars') return base
  return Math.max(1, base - 1)
}

export const TRANSIT_ASPECTS = ASPECTS.filter((a) => a.key !== 'semisextile')

export interface TransitHit {
  transit: PlanetKey
  natal: PointKey
  type: AspectInfo
  orb: number
  applying: boolean
  transitLon: number
  transitRetro: boolean
  /** House of the natal chart the transiting body is moving through. */
  house: number
  strength: number
}

export function transitsAt(natal: Chart, date: Date, planets = TRANSIT_PLANETS): TransitHit[] {
  const t = toTime(date)
  const targets = NATAL_TARGETS.filter((k) => natal.hasHouses || (k !== 'asc' && k !== 'mc'))
  const hits: TransitHit[] = []
  for (const tp of planets) {
    const lon = bodyLongitude(tp, t)
    const speed = bodySpeed(tp, t)
    for (const nk of targets) {
      const nlon = natal.points[nk].lon
      const sep = Math.abs(angDiff(nlon, lon))
      for (const type of TRANSIT_ASPECTS) {
        const orb = Math.abs(sep - type.angle)
        const maxOrb = transitOrb(type, tp)
        if (orb > maxOrb) continue
        const sepNext = Math.abs(angDiff(nlon, lon + speed * 0.01))
        const applying = Math.abs(sepNext - type.angle) < orb
        const exact = 1 - orb / maxOrb
        hits.push({
          transit: tp, natal: nk, type, orb, applying,
          transitLon: lon, transitRetro: speed < 0 && tp !== 'node',
          house: houseOf(lon, natal.cusps),
          strength: (TRANSIT_WEIGHT[tp] ?? 1) * (NATAL_WEIGHT[nk] ?? 1) * (0.35 + 0.65 * exact),
        })
      }
    }
  }
  return hits.sort((a, b) => b.strength - a.strength)
}

export interface TransitEvent {
  transit: PlanetKey
  natal: PointKey
  type: AspectInfo
  exact: Date
  start: Date
  end: Date
  retro: boolean
  strength: number
  transitLon: number
}

const STEP_DAYS: Partial<Record<PlanetKey, number>> = {
  moon: 0.125, mercury: 0.5, venus: 0.5, sun: 0.5, mars: 0.5,
  jupiter: 1, saturn: 1, uranus: 2, neptune: 2, pluto: 2, node: 1,
}

/**
 * Finds every moment in [start, start+days] when a transiting body perfects an
 * aspect to a natal point, refined by bisection to < 1 minute.
 */
export function findTransitEvents(natal: Chart, start: Date, days: number, planets = TRANSIT_PLANETS): TransitEvent[] {
  const events: TransitEvent[] = []
  const t0 = toTime(start)
  const targets = NATAL_TARGETS.filter((k) => natal.hasHouses || (k !== 'asc' && k !== 'mc'))
  for (const tp of planets) {
    const step = STEP_DAYS[tp] ?? 1
    // Pad so windows that begin before `start` can still be measured.
    const pad = tp === 'moon' ? 3 : 40
    const n = Math.ceil((days + 2 * pad) / step) + 1
    const offs: number[] = new Array(n)
    const lons: number[] = new Array(n)
    for (let i = 0; i < n; i++) {
      offs[i] = -pad + i * step
      lons[i] = bodyLongitude(tp, t0.AddDays(offs[i]))
    }
    const lonAt = (d: number) => bodyLongitude(tp, t0.AddDays(d))
    for (const nk of targets) {
      const nlon = natal.points[nk].lon
      for (const type of TRANSIT_ASPECTS) {
        const targetLons = type.angle === 0 || type.angle === 180
          ? [norm360(nlon + type.angle)]
          : [norm360(nlon + type.angle), norm360(nlon - type.angle)]
        const maxOrb = transitOrb(type, tp)
        for (const target of targetLons) {
          for (let i = 0; i < n - 1; i++) {
            const f0 = angDiff(target, lons[i])
            const f1 = angDiff(target, lons[i + 1])
            if (Math.abs(f0) > 20 || Math.abs(f1) > 20) continue
            if (f0 === 0 || f0 * f1 < 0) {
              let lo = offs[i], hi = offs[i + 1], flo = f0
              for (let k = 0; k < 40; k++) {
                const mid = (lo + hi) / 2
                const fm = angDiff(target, lonAt(mid))
                if (fm === 0) { lo = hi = mid; break }
                if (flo * fm < 0) hi = mid
                else { lo = mid; flo = fm }
                if (hi - lo < 1 / 1440 / 2) break
              }
              const exactOff = (lo + hi) / 2
              const within = (d: number) => Math.abs(angDiff(target, lonAt(d))) <= maxOrb
              const walk = (dir: 1 | -1) => {
                let d = exactOff
                const maxWalk = tp === 'moon' ? 3 : tp === 'sun' || tp === 'mercury' || tp === 'venus' ? 12 : tp === 'mars' ? 25 : 400
                let walked = 0
                while (walked < maxWalk && within(d + dir * step)) { d += dir * step; walked += step }
                return d
              }
              // Keep events whose influence window overlaps the requested range.
              const sOff = walk(-1)
              const eOff = walk(1)
              if (eOff < 0 || sOff > days) continue
              const exactT = t0.AddDays(exactOff)
              const sp = bodySpeed(tp, exactT)
              events.push({
                transit: tp, natal: nk, type,
                exact: exactT.date,
                start: t0.AddDays(sOff).date,
                end: t0.AddDays(eOff).date,
                retro: sp < 0 && tp !== 'node',
                strength: (TRANSIT_WEIGHT[tp] ?? 1) * (NATAL_WEIGHT[nk] ?? 1),
                transitLon: target,
              })
            }
          }
        }
      }
    }
  }
  return dedupe(events).sort((a, b) => a.exact.getTime() - b.exact.getTime())
}

function dedupe(list: TransitEvent[]): TransitEvent[] {
  const seen = new Set<string>()
  return list.filter((e) => {
    const k = `${e.transit}|${e.natal}|${e.type.key}|${Math.round(e.exact.getTime() / 3600000)}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export type LifeArea = 'amor' | 'carreira' | 'energia' | 'mente' | 'emocoes' | 'espirito'

export const LIFE_AREAS: { key: LifeArea; name: string; icon: string; color: string }[] = [
  { key: 'amor', name: 'Amor & Relações', icon: '♡', color: '#ff8fc7' },
  { key: 'carreira', name: 'Carreira & Propósito', icon: '♛', color: '#ffd166' },
  { key: 'energia', name: 'Energia & Vitalidade', icon: '✦', color: '#ff7a59' },
  { key: 'mente', name: 'Mente & Comunicação', icon: '✧', color: '#7cc7ff' },
  { key: 'emocoes', name: 'Emoções & Lar', icon: '☾', color: '#c5b3ff' },
  { key: 'espirito', name: 'Espiritualidade', icon: '❋', color: '#6ef0e0' },
]

const AREA_PLANETS: Record<LifeArea, PointKey[]> = {
  amor: ['venus', 'moon', 'mars'],
  carreira: ['saturn', 'mc', 'sun', 'jupiter'],
  energia: ['mars', 'sun', 'asc'],
  mente: ['mercury', 'uranus'],
  emocoes: ['moon', 'neptune', 'pluto'],
  espirito: ['neptune', 'jupiter', 'pluto', 'node'],
}

const AREA_HOUSES: Record<LifeArea, number[]> = {
  amor: [5, 7],
  carreira: [10, 6, 2],
  energia: [1, 6],
  mente: [3, 9],
  emocoes: [4, 8],
  espirito: [9, 12],
}

export interface DayScore {
  date: Date
  harmony: number
  tension: number
  /** -100..100 overall flow of the day. */
  flow: number
  /** 0..100 intensity (how much is happening). */
  intensity: number
  areas: Record<LifeArea, number>
  top: TransitHit[]
}

export function scoreDay(natal: Chart, date: Date): DayScore {
  const hits = transitsAt(natal, date)
  let harmony = 0, tension = 0
  const areas = { amor: 0, carreira: 0, energia: 0, mente: 0, emocoes: 0, espirito: 0 } as Record<LifeArea, number>
  for (const h of hits) {
    const s = h.strength
    let sign: number
    const weight: Partial<Record<string, number>> = { trine: 1, sextile: 0.8, square: -0.9, opposition: -0.8, quincunx: -0.35 }
    if (h.type.key in weight) sign = weight[h.type.key]!
    else {
      // Conjunctions take on the nature of the planets involved.
      const benefic = ['venus', 'jupiter', 'sun', 'moon'].includes(h.transit)
      const malefic = ['saturn', 'mars', 'pluto', 'uranus'].includes(h.transit)
      sign = benefic ? 0.8 : malefic ? -0.6 : 0.2
    }
    if (sign > 0) harmony += s * sign
    else tension += -s * sign
    for (const area of Object.keys(areas) as LifeArea[]) {
      const rel =
        (AREA_PLANETS[area].includes(h.natal) ? 1 : 0) +
        (AREA_PLANETS[area].includes(h.transit) ? 0.7 : 0) +
        (natal.hasHouses && AREA_HOUSES[area].includes(h.house) ? 0.5 : 0)
      areas[area] += rel * s * sign
    }
  }
  const scaled = {} as Record<LifeArea, number>
  for (const k of Object.keys(areas) as LifeArea[]) {
    scaled[k] = Math.round(50 + 50 * Math.tanh(areas[k] / 18))
  }
  const flow = Math.round(100 * Math.tanh((harmony - tension) / 30))
  const intensity = Math.round(100 * Math.tanh((harmony + tension) / 45))
  return { date, harmony, tension, flow, intensity, areas: scaled, top: hits.slice(0, 8) }
}

export function scoreRange(natal: Chart, start: Date, days: number): DayScore[] {
  const out: DayScore[] = []
  for (let i = 0; i < days; i++) {
    out.push(scoreDay(natal, new Date(start.getTime() + i * 86400000)))
  }
  return out
}

export const pointName = (k: PointKey) => POINTS[k].name
