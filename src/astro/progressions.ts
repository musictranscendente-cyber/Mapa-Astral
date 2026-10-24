import { computeChart, type Chart } from './chart'
import { ASPECTS, angDiff, norm360, signOf, type AspectInfo, type PlanetKey, type PointKey } from './constants'

/**
 * Secondary progressions ("a day for a year") and solar-arc directions.
 * The progressed chart is cast for birth + age-in-years days at the birthplace, so the
 * angles move by the real sidereal motion (≈1° per year).
 */

const YEAR_DAYS = 365.2422
const DAY = 86400000

export const PROG_PLANETS: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars']
const NATAL_TARGETS: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc']
const MAJOR = ASPECTS.filter((a) => a.major)

export function progressedDate(natal: Chart, at: Date): Date {
  const ageYears = (at.getTime() - natal.date.getTime()) / (YEAR_DAYS * DAY)
  return new Date(natal.date.getTime() + ageYears * DAY)
}

export function progressedChart(natal: Chart, at: Date): Chart {
  return computeChart(progressedDate(natal, at), natal.latitude, natal.longitude, natal.houseSystem, { hasHouses: natal.hasHouses })
}

/** Solar arc at a date: how far the progressed Sun has moved from the natal Sun. */
export function solarArc(natal: Chart, at: Date): number {
  return norm360(progressedChart(natal, at).points.sun.lon - natal.points.sun.lon)
}

export interface ProgAspect {
  moving: PointKey
  natal: PointKey
  type: AspectInfo
  orb: number
  applying: boolean
}

function contacts(moving: Partial<Record<PointKey, number>>, natal: Chart, maxOrb: number, before?: Partial<Record<PointKey, number>>): ProgAspect[] {
  const out: ProgAspect[] = []
  const targets = NATAL_TARGETS.filter((k) => natal.hasHouses || (k !== 'asc' && k !== 'mc'))
  for (const [m, lon] of Object.entries(moving) as [PointKey, number][]) {
    for (const n of targets) {
      const sep = Math.abs(angDiff(lon, natal.points[n].lon))
      for (const type of MAJOR) {
        const orb = Math.abs(sep - type.angle)
        if (orb > maxOrb) continue
        let applying = true
        if (before?.[m] !== undefined) {
          const prevOrb = Math.abs(Math.abs(angDiff(before[m]!, natal.points[n].lon)) - type.angle)
          applying = orb < prevOrb
        }
        out.push({ moving: m, natal: n, type, orb, applying })
      }
    }
  }
  return out.sort((a, b) => a.orb - b.orb)
}

export interface Progressions {
  at: Date
  chart: Chart
  arc: number
  /** Progressed-to-natal aspects within 1°. */
  progressed: ProgAspect[]
  /** Solar-arc directed points to natal within 1°. */
  directed: ProgAspect[]
  /** Progressed lunar phase angle (Moon − Sun), 0..360. */
  lunarPhase: number
  /** When the progressed Moon enters its next sign. */
  moonIngress: { date: Date; sign: number }
}

export function progressions(natal: Chart, at: Date): Progressions {
  const chart = progressedChart(natal, at)
  const prev = progressedChart(natal, new Date(at.getTime() - 30 * DAY))
  const arc = norm360(chart.points.sun.lon - natal.points.sun.lon)
  const pick = (c: Chart, keys: PointKey[]) => Object.fromEntries(keys.map((k) => [k, c.points[k].lon])) as Partial<Record<PointKey, number>>
  const progKeys: PointKey[] = natal.hasHouses ? [...PROG_PLANETS, 'asc', 'mc'] : PROG_PLANETS
  const progressed = contacts(pick(chart, progKeys), natal, 1, pick(prev, progKeys))
  const directKeys: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', ...(natal.hasHouses ? (['asc', 'mc'] as PointKey[]) : [])]
  const directed = contacts(
    Object.fromEntries(directKeys.map((k) => [k, norm360(natal.points[k].lon + arc)])) as Partial<Record<PointKey, number>>,
    natal, 1,
    Object.fromEntries(directKeys.map((k) => [k, norm360(natal.points[k].lon + arc - 0.08)])) as Partial<Record<PointKey, number>>,
  ).filter((d) => d.moving !== d.natal || d.type.key !== 'conjunction')

  // Progressed Moon moves ≈1°/month: step by 10 days to find its next sign.
  const moonSign = chart.points.moon.sign
  let t = at.getTime()
  for (let i = 0; i < 400; i++) {
    t += 10 * DAY
    if (progressedChart(natal, new Date(t)).points.moon.sign !== moonSign) break
  }
  let lo = t - 10 * DAY
  let hi = t
  while (hi - lo > DAY) {
    const mid = (lo + hi) / 2
    if (progressedChart(natal, new Date(mid)).points.moon.sign === moonSign) lo = mid
    else hi = mid
  }
  return {
    at, chart, arc, progressed, directed,
    lunarPhase: norm360(chart.points.moon.lon - chart.points.sun.lon),
    moonIngress: { date: new Date(hi), sign: signOf(progressedChart(natal, new Date(hi)).points.moon.lon) },
  }
}

export interface ProgEvent { date: Date; moving: PointKey; natal: PointKey; type: AspectInfo; kind: 'progressão' | 'arco solar' }

/** Exact progressed and solar-arc aspects in the next `years` years (monthly scan + bisection). */
export function upcomingProgressions(natal: Chart, from: Date, years = 3): ProgEvent[] {
  const events: ProgEvent[] = []
  const end = from.getTime() + years * YEAR_DAYS * DAY
  const step = 30 * DAY
  const targets = NATAL_TARGETS.filter((k) => natal.hasHouses || (k !== 'asc' && k !== 'mc'))
  const sample = (time: number) => {
    const c = progressedChart(natal, new Date(time))
    const arc = norm360(c.points.sun.lon - natal.points.sun.lon)
    const prog = Object.fromEntries(PROG_PLANETS.map((k) => [k, c.points[k].lon])) as Record<string, number>
    const dir = Object.fromEntries(['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn'].map((k) => [k, norm360(natal.points[k as PointKey].lon + arc)])) as Record<string, number>
    return { prog, dir }
  }
  // signed distance from exact aspect: changes sign when the aspect perfects
  const dist = (lon: number, n: PointKey, angle: number) => Math.abs(angDiff(lon, natal.points[n].lon)) - angle
  let prev = sample(from.getTime())
  for (let t = from.getTime() + step; t <= end; t += step) {
    const cur = sample(t)
    for (const kind of ['progressão', 'arco solar'] as const) {
      const a = kind === 'progressão' ? prev.prog : prev.dir
      const b = kind === 'progressão' ? cur.prog : cur.dir
      for (const m of Object.keys(b) as PointKey[]) {
        for (const n of targets) {
          if (kind === 'arco solar' && m === n) continue
          for (const type of MAJOR) {
            const d0 = dist(a[m], n, type.angle)
            const d1 = dist(b[m], n, type.angle)
            if (Math.sign(d0) === Math.sign(d1) || Math.abs(d0 - d1) > 5) continue
            let lo = t - step
            let hi = t
            for (let i = 0; i < 12; i++) {
              const mid = (lo + hi) / 2
              const s = sample(mid)
              const dm = dist((kind === 'progressão' ? s.prog : s.dir)[m], n, type.angle)
              if (Math.sign(dm) === Math.sign(d0)) lo = mid
              else hi = mid
            }
            events.push({ date: new Date((lo + hi) / 2), moving: m, natal: n, type, kind })
          }
        }
      }
    }
    prev = cur
  }
  return events.sort((x, y) => x.date.getTime() - y.date.getTime())
}

