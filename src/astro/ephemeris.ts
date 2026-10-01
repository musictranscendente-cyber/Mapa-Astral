import * as A from 'astronomy-engine'
import { norm360, type PlanetKey } from './constants'

const BODY: Partial<Record<PlanetKey, A.Body>> = {
  sun: A.Body.Sun,
  moon: A.Body.Moon,
  mercury: A.Body.Mercury,
  venus: A.Body.Venus,
  mars: A.Body.Mars,
  jupiter: A.Body.Jupiter,
  saturn: A.Body.Saturn,
  uranus: A.Body.Uranus,
  neptune: A.Body.Neptune,
  pluto: A.Body.Pluto,
}

const rad = Math.PI / 180
const sind = (x: number) => Math.sin(x * rad)

export function toTime(date: Date | A.AstroTime): A.AstroTime {
  return date instanceof A.AstroTime ? date : A.MakeTime(date)
}

/** Julian centuries of Terrestrial Time since J2000. */
const centuriesTT = (t: A.AstroTime) => t.tt / 36525

/** Nutation in longitude, degrees. */
export function nutationLon(t: A.AstroTime): number {
  return A.e_tilt(t).dpsi / 3600
}

/** True obliquity of the ecliptic, degrees. */
export function trueObliquity(t: A.AstroTime): number {
  return A.e_tilt(t).tobl
}

/**
 * True (osculating) lunar node: intersection of the Moon's instantaneous orbital
 * plane — from its geocentric position × velocity — with the true ecliptic of date.
 */
export function trueNode(t: A.AstroTime): number {
  const state = A.RotateState(A.Rotation_EQJ_ECT(t), A.GeoMoonState(t))
  const hx = state.y * state.vz - state.z * state.vy
  const hy = state.z * state.vx - state.x * state.vz
  return norm360(Math.atan2(hx, -hy) / rad)
}

/**
 * Meeus (ch. 47) analytic true node: mean node plus the main periodic terms.
 * Kept as an independent cross-check for the osculating computation.
 */
export function meeusTrueNode(t: A.AstroTime): number {
  const T = centuriesTT(t)
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T
  const omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T2 + T3 / 467441 - T4 / 60616000
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000
  const corr =
    -1.4979 * sind(2 * (D - F)) -
    0.15 * sind(M) +
    0.1226 * sind(2 * D) +
    0.1176 * sind(2 * F) -
    0.0801 * sind(2 * (Mp - F))
  return norm360(omega + corr + nutationLon(t))
}

/** Mean Black Moon Lilith (mean lunar apogee). */
export function meanLilith(t: A.AstroTime): number {
  const T = centuriesTT(t)
  const perigee = 83.3532465 + 4069.0137287 * T - 0.01032 * T * T - (T * T * T) / 80053 + (T * T * T * T) / 18999000
  return norm360(perigee + 180 + nutationLon(t))
}

/** Apparent geocentric ecliptic longitude/latitude (true equinox & ecliptic of date). */
export function bodyEcliptic(key: PlanetKey, t: A.AstroTime): { lon: number; lat: number } {
  if (key === 'node') return { lon: trueNode(t), lat: 0 }
  if (key === 'southNode') return { lon: norm360(trueNode(t) + 180), lat: 0 }
  if (key === 'lilith') return { lon: meanLilith(t), lat: 0 }
  const body = BODY[key]!
  const vec = A.GeoVector(body, t, true)
  const ecl = A.Ecliptic(vec)
  return { lon: norm360(ecl.elon), lat: ecl.elat }
}

export function bodyLongitude(key: PlanetKey, t: A.AstroTime): number {
  return bodyEcliptic(key, t).lon
}

/** Daily motion in degrees/day (negative = retrograde). */
export function bodySpeed(key: PlanetKey, t: A.AstroTime): number {
  const h = key === 'moon' ? 0.05 : 0.5
  const a = bodyLongitude(key, t.AddDays(-h))
  const b = bodyLongitude(key, t.AddDays(h))
  let d = b - a
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d / (2 * h)
}

/** Local apparent sidereal time expressed as Right Ascension of the MC, degrees. */
export function ramc(t: A.AstroTime, longitude: number): number {
  return norm360(A.SiderealTime(t) * 15 + longitude)
}

export interface MoonPhaseInfo {
  angle: number
  illumination: number
  name: string
  emoji: string
  waxing: boolean
}

export function moonPhaseInfo(date: Date): MoonPhaseInfo {
  const angle = A.MoonPhase(date)
  const illumination = (1 - Math.cos(angle * rad)) / 2
  const waxing = angle < 180
  let name: string
  let emoji: string
  if (angle < 10 || angle >= 350) { name = 'Lua Nova'; emoji = '🌑' }
  else if (angle < 80) { name = 'Lua Crescente'; emoji = '🌒' }
  else if (angle < 100) { name = 'Quarto Crescente'; emoji = '🌓' }
  else if (angle < 170) { name = 'Crescente Gibosa'; emoji = '🌔' }
  else if (angle < 190) { name = 'Lua Cheia'; emoji = '🌕' }
  else if (angle < 260) { name = 'Minguante Gibosa'; emoji = '🌖' }
  else if (angle < 280) { name = 'Quarto Minguante'; emoji = '🌗' }
  else { name = 'Lua Minguante'; emoji = '🌘' }
  return { angle, illumination, name, emoji, waxing }
}

export interface LunarEvent {
  date: Date
  quarter: number
  name: string
}

const QUARTER_NAMES = ['Lua Nova', 'Quarto Crescente', 'Lua Cheia', 'Quarto Minguante']

export function upcomingLunarPhases(from: Date, count = 4): LunarEvent[] {
  const out: LunarEvent[] = []
  let mq = A.SearchMoonQuarter(from)
  for (let i = 0; i < count; i++) {
    out.push({ date: mq.time.date, quarter: mq.quarter, name: QUARTER_NAMES[mq.quarter] })
    mq = A.NextMoonQuarter(mq)
  }
  return out
}
