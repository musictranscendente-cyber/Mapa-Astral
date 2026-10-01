import {
  ASPECTS, POINTS, PLANET_ORDER, SIGNS, angDiff, dignityOf, norm360, signOf,
  type AspectInfo, type Dignity, type Element, type Modality, type PlanetKey, type PointKey,
} from './constants'
import { bodyEcliptic, bodySpeed, ramc as computeRamc, toTime, trueObliquity } from './ephemeris'
import { computeHouses, houseOf, type HouseSystem } from './houses'
import { localToUtc, type LocalDateTime } from './time'

export interface BirthData {
  name: string
  local: LocalDateTime
  timeZone: string
  latitude: number
  longitude: number
  place: string
  /** Birth time unknown: chart is cast for 12:00 and houses are hidden. */
  timeUnknown?: boolean
}

export interface ChartPoint {
  key: PointKey
  lon: number
  lat: number
  speed: number
  retro: boolean
  sign: number
  house: number
  dignity: Dignity
}

export interface Aspect {
  a: PointKey
  b: PointKey
  type: AspectInfo
  orb: number
  /** Signed: negative = applying, positive = separating (natal: by speed). */
  applying: boolean
  exactness: number // 0..1
}

export interface Balance {
  elements: Record<Element, number>
  modalities: Record<Modality, number>
  polarity: { yang: number; yin: number }
  hemispheres: { north: number; south: number; east: number; west: number }
}

export interface Chart {
  date: Date
  birth?: BirthData
  latitude: number
  longitude: number
  points: Record<PointKey, ChartPoint>
  cusps: number[]
  houseSystem: HouseSystem
  houseFallback: boolean
  asc: number
  mc: number
  obliquity: number
  ramc: number
  isDayChart: boolean
  aspects: Aspect[]
  balance: Balance
  hasHouses: boolean
}

export const CHART_PLANETS: PlanetKey[] = PLANET_ORDER

export function computeChart(
  date: Date,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem = 'placidus',
  opts: { birth?: BirthData; hasHouses?: boolean } = {},
): Chart {
  const t = toTime(date)
  const eps = trueObliquity(t)
  const r = computeRamc(t, longitude)
  const h = computeHouses(houseSystem, r, eps, latitude)
  const hasHouses = opts.hasHouses ?? true

  const points = {} as Record<PointKey, ChartPoint>
  for (const key of CHART_PLANETS) {
    const { lon, lat } = bodyEcliptic(key, t)
    const speed = key === 'southNode' ? bodySpeed('node', t) : bodySpeed(key, t)
    points[key] = {
      key, lon, lat, speed,
      retro: speed < 0 && key !== 'node' && key !== 'southNode' && key !== 'lilith',
      sign: signOf(lon),
      house: houseOf(lon, h.cusps),
      dignity: dignityOf(key, signOf(lon)),
    }
  }
  const angle = (key: PointKey, lon: number): ChartPoint => ({
    key, lon, lat: 0, speed: 0, retro: false, sign: signOf(lon), house: houseOf(lon, h.cusps), dignity: null,
  })
  points.asc = angle('asc', h.asc)
  points.mc = angle('mc', h.mc)
  points.dsc = angle('dsc', norm360(h.asc + 180))
  points.ic = angle('ic', norm360(h.mc + 180))

  // Day chart when the Sun is above the horizon (houses 7–12).
  const sunAbove = norm360(points.sun.lon - h.asc) > 180
  const fortune = sunAbove
    ? h.asc + points.moon.lon - points.sun.lon
    : h.asc + points.sun.lon - points.moon.lon
  points.fortune = angle('fortune', norm360(fortune))

  const chart: Chart = {
    date, birth: opts.birth, latitude, longitude, points,
    cusps: h.cusps, houseSystem: h.system, houseFallback: h.fallback,
    asc: h.asc, mc: h.mc, obliquity: eps, ramc: r,
    isDayChart: sunAbove,
    aspects: [],
    balance: undefined as unknown as Balance,
    hasHouses,
  }
  chart.aspects = findAspects(points, hasHouses)
  chart.balance = computeBalance(chart)
  return chart
}

export function chartFromBirth(birth: BirthData, houseSystem: HouseSystem = 'placidus'): Chart {
  const local = birth.timeUnknown ? { ...birth.local, hour: 12, minute: 0 } : birth.local
  const utc = localToUtc(local, birth.timeZone)
  return computeChart(utc, birth.latitude, birth.longitude, houseSystem, { birth, hasHouses: !birth.timeUnknown })
}

/** Points that take part in natal aspects. */
export const ASPECT_POINTS: PointKey[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'node', 'lilith', 'asc', 'mc',
]

function orbFor(type: AspectInfo, a: PointKey, b: PointKey): number {
  let orb = type.orb
  const lum = (k: PointKey) => k === 'sun' || k === 'moon'
  if (lum(a) || lum(b)) orb += type.major ? 2 : 0.5
  const minor = (k: PointKey) => k === 'node' || k === 'lilith'
  if (minor(a) || minor(b)) orb = Math.min(orb, type.major ? 4 : 1.5)
  return orb
}

export function aspectBetween(lonA: number, lonB: number, a: PointKey, b: PointKey, orbScale = 1): { type: AspectInfo; orb: number } | null {
  const sep = Math.abs(angDiff(lonA, lonB))
  let best: { type: AspectInfo; orb: number } | null = null
  for (const type of ASPECTS) {
    const orb = Math.abs(sep - type.angle)
    if (orb <= orbFor(type, a, b) * orbScale && (!best || orb < best.orb)) best = { type, orb }
  }
  return best
}

function findAspects(points: Record<PointKey, ChartPoint>, hasHouses: boolean): Aspect[] {
  const keys = ASPECT_POINTS.filter((k) => hasHouses || (k !== 'asc' && k !== 'mc'))
  const out: Aspect[] = []
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = points[keys[i]], b = points[keys[j]]
      if ((a.key === 'asc' && b.key === 'mc') || (a.key === 'mc' && b.key === 'asc')) continue
      const hit = aspectBetween(a.lon, b.lon, a.key, b.key)
      if (!hit) continue
      // Applying if the orb is shrinking.
      const dt = 0.01
      const sepNow = Math.abs(angDiff(a.lon, b.lon))
      const sepNext = Math.abs(angDiff(a.lon + a.speed * dt, b.lon + b.speed * dt))
      const applying = Math.abs(sepNext - hit.type.angle) < Math.abs(sepNow - hit.type.angle)
      out.push({
        a: a.key, b: b.key, type: hit.type, orb: hit.orb, applying,
        exactness: 1 - hit.orb / orbFor(hit.type, a.key, b.key),
      })
    }
  }
  return out.sort((x, y) => x.orb - y.orb)
}

function computeBalance(chart: Chart): Balance {
  const elements: Record<Element, number> = { fogo: 0, terra: 0, ar: 0, agua: 0 }
  const modalities: Record<Modality, number> = { cardinal: 0, fixo: 0, mutavel: 0 }
  const polarity = { yang: 0, yin: 0 }
  const hemispheres = { north: 0, south: 0, east: 0, west: 0 }
  const keys: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
  if (chart.hasHouses) keys.push('asc', 'mc')
  for (const k of keys) {
    const p = chart.points[k]
    const w = POINTS[k].weight
    const s = SIGNS[p.sign]
    elements[s.element] += w
    modalities[s.modality] += w
    polarity[s.polarity] += w
    if (chart.hasHouses && k !== 'asc' && k !== 'mc') {
      if (p.house >= 7) hemispheres.south += w; else hemispheres.north += w // above horizon = "sul" (visible sky)
      if (p.house >= 10 || p.house <= 3) hemispheres.east += w; else hemispheres.west += w
    }
  }
  return { elements, modalities, polarity, hemispheres }
}

/** Current sky for a location. */
export function skyNow(date: Date, latitude: number, longitude: number, houseSystem: HouseSystem = 'placidus'): Chart {
  return computeChart(date, latitude, longitude, houseSystem)
}
