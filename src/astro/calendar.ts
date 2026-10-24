import * as A from 'astronomy-engine'
import { ASPECTS, angDiff, type PlanetKey } from './constants'
import { bodyLongitude, bodySpeed, toTime } from './ephemeris'
import { lunations } from './lunations'

export type CalEventKind = 'fase' | 'eclipse' | 'ingresso' | 'lua-signo' | 'estacao' | 'fora-de-curso'

export interface CalEvent {
  kind: CalEventKind
  date: Date
  /** End of a period (Moon void of course). */
  end?: Date
  planet?: PlanetKey
  sign?: number
  /** Station: true = turns retrograde, false = turns direct. */
  retro?: boolean
  /** Moon phase quarter 0..3. */
  quarter?: number
  eclipse?: string
  lunation?: 'nova' | 'cheia'
}

const HOUR = 3600000
const DAY = 24 * HOUR
const signAt = (k: PlanetKey, t: number) => Math.floor(bodyLongitude(k, toTime(new Date(t))) / 30)
const INGRESS_PLANETS: PlanetKey[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
const STATION_PLANETS: PlanetKey[] = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron']
const VOC_TARGETS: PlanetKey[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
const PTOLEMAIC = ASPECTS.filter((a) => ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.key))

function bisect(lo: number, hi: number, same: (t: number) => boolean, precision = 60000): number {
  while (hi - lo > precision) {
    const mid = (lo + hi) / 2
    if (same(mid)) lo = mid
    else hi = mid
  }
  return hi
}

function ingresses(k: PlanetKey, from: number, to: number, step: number): CalEvent[] {
  const out: CalEvent[] = []
  let prev = signAt(k, from)
  for (let t = from + step; t <= to + step; t += step) {
    const s = signAt(k, Math.min(t, to))
    if (s !== prev) {
      const p0 = prev
      const at = bisect(t - step, Math.min(t, to), (x) => signAt(k, x) === p0)
      out.push({ kind: k === 'moon' ? 'lua-signo' : 'ingresso', date: new Date(at), planet: k, sign: s })
      prev = s
    }
    if (t >= to) break
  }
  return out
}

function stations(k: PlanetKey, from: number, to: number): CalEvent[] {
  const out: CalEvent[] = []
  const sp = (t: number) => bodySpeed(k, toTime(new Date(t)))
  let prev = sp(from)
  for (let t = from + DAY; t <= to; t += DAY) {
    const v = sp(t)
    if (Math.sign(v) !== Math.sign(prev)) {
      const s0 = Math.sign(prev)
      const at = bisect(t - DAY, t, (x) => Math.sign(sp(x)) === s0, 10 * 60000)
      out.push({ kind: 'estacao', date: new Date(at), planet: k, retro: v < 0, sign: signAt(k, at) })
    }
    prev = v
  }
  return out
}

/** Moon void of course: from its last Ptolemaic aspect to a planet until it changes sign. */
function voidOfCourse(ingress: CalEvent): CalEvent | null {
  const end = ingress.date.getTime()
  const lons = (t: number) => {
    const tt = toTime(new Date(t))
    return { moon: bodyLongitude('moon', tt), ...Object.fromEntries(VOC_TARGETS.map((k) => [k, bodyLongitude(k, tt)])) } as Record<string, number>
  }
  const dist = (l: Record<string, number>, k: PlanetKey, angle: number) => Math.abs(angDiff(l.moon, l[k])) - angle
  let later = lons(end - 60000)
  for (let t = end - 2 * HOUR; t > end - 3 * DAY; t -= 2 * HOUR) {
    const earlier = lons(t)
    let best = -Infinity
    for (const k of VOC_TARGETS) {
      for (const a of PTOLEMAIC) {
        const d0 = dist(earlier, k, a.angle)
        const d1 = dist(later, k, a.angle)
        if (Math.sign(d0) === Math.sign(d1) || Math.abs(d0 - d1) > 10) continue
        const exact = bisect(t, t + 2 * HOUR, (x) => Math.sign(dist(lons(x), k, a.angle)) === Math.sign(d0))
        best = Math.max(best, exact)
      }
    }
    if (best > -Infinity) {
      if (end - best < 20 * 60000) return null // too short to matter
      return { kind: 'fora-de-curso', date: new Date(best), end: ingress.date, planet: 'moon', sign: ingress.sign }
    }
    later = earlier
  }
  return null
}

/** Every astrological event between `from` and `to`, sorted by date. */
export function calendarEvents(from: Date, to: Date, opts: { voc?: boolean; moonSigns?: boolean } = {}): CalEvent[] {
  const { voc: withVoc = true, moonSigns = true } = opts
  const a = from.getTime()
  const b = to.getTime()
  const events: CalEvent[] = []
  for (let q = A.SearchMoonQuarter(from); q.time.date <= to; q = A.NextMoonQuarter(q)) {
    events.push({ kind: 'fase', date: q.time.date, quarter: q.quarter, sign: signAt('moon', q.time.date.getTime()) })
  }
  const months = Math.max(1, Math.ceil((b - a) / (30 * DAY)) + 1)
  for (const l of lunations(new Date(a - 2 * DAY), months)) {
    if (l.eclipse && l.date >= from && l.date <= to) events.push({ kind: 'eclipse', date: l.date, eclipse: l.eclipse, lunation: l.kind, sign: l.sign })
  }
  for (const k of INGRESS_PLANETS) events.push(...ingresses(k, a, b, k === 'sun' || k === 'mercury' || k === 'venus' || k === 'mars' ? 6 * HOUR : DAY))
  const moonIngress = withVoc || moonSigns ? ingresses('moon', a - 3 * DAY, b, 2 * HOUR) : []
  if (withVoc) {
    for (const m of moonIngress) {
      const voc = voidOfCourse(m)
      if (voc && voc.end! >= from && voc.date <= to) events.push(voc)
    }
  }
  if (moonSigns) events.push(...moonIngress.filter((m) => m.date >= from))
  for (const k of STATION_PLANETS) events.push(...stations(k, a, b))
  return events.sort((x, y) => x.date.getTime() - y.date.getTime())
}

/** Planets retrograde at a given moment. */
export function retrogradesAt(date: Date): PlanetKey[] {
  const t = toTime(date)
  return STATION_PLANETS.filter((k) => bodySpeed(k, t) < 0)
}
