import { norm360 } from './constants'

export type HouseSystem = 'placidus' | 'koch' | 'porphyry' | 'equal' | 'whole'

export const HOUSE_SYSTEMS: { key: HouseSystem; name: string }[] = [
  { key: 'placidus', name: 'Placidus' },
  { key: 'koch', name: 'Koch' },
  { key: 'porphyry', name: 'Porfírio' },
  { key: 'equal', name: 'Casas Iguais' },
  { key: 'whole', name: 'Signos Inteiros' },
]

const rad = Math.PI / 180
const deg = 180 / Math.PI
const sin = (x: number) => Math.sin(x * rad)
const cos = (x: number) => Math.cos(x * rad)
const tan = (x: number) => Math.tan(x * rad)
const asin = (x: number) => Math.asin(Math.max(-1, Math.min(1, x))) * deg
const atan2 = (y: number, x: number) => Math.atan2(y, x) * deg

/** Ecliptic longitude culminating on the meridian. */
export function computeMC(ramc: number, eps: number): number {
  return norm360(atan2(sin(ramc), cos(ramc) * cos(eps)))
}

/** Ecliptic longitude rising on the eastern horizon. */
export function computeASC(ramc: number, eps: number, lat: number): number {
  return norm360(atan2(cos(ramc), -(sin(ramc) * cos(eps) + tan(lat) * sin(eps))))
}

/** Ecliptic longitude of the point having a given right ascension. */
const lonFromRA = (ra: number, eps: number) => norm360(atan2(sin(ra), cos(ra) * cos(eps)))
const declOfLon = (lon: number, eps: number) => asin(sin(eps) * sin(lon))

/**
 * Placidus: each intermediate cusp divides the diurnal / nocturnal
 * semi-arc of its own degree into thirds. Solved iteratively.
 */
function placidusCusp(ramc: number, eps: number, lat: number, frac: number, above: boolean): number | null {
  let lon = lonFromRA(ramc + (above ? frac * 90 : 180 - frac * 90), eps)
  for (let i = 0; i < 60; i++) {
    const dec = declOfLon(lon, eps)
    const x = tan(lat) * tan(dec)
    if (Math.abs(x) >= 1) return null
    const ad = asin(x)
    const ra = above ? ramc + frac * (90 + ad) : ramc + 180 - frac * (90 - ad)
    const next = lonFromRA(ra, eps)
    let d = Math.abs(next - lon)
    if (d > 180) d = 360 - d
    lon = next
    if (d < 1e-9) break
  }
  return lon
}

function placidus(ramc: number, eps: number, lat: number, asc: number, mc: number): number[] | null {
  const c11 = placidusCusp(ramc, eps, lat, 1 / 3, true)
  const c12 = placidusCusp(ramc, eps, lat, 2 / 3, true)
  const c2 = placidusCusp(ramc, eps, lat, 2 / 3, false)
  const c3 = placidusCusp(ramc, eps, lat, 1 / 3, false)
  if (c11 == null || c12 == null || c2 == null || c3 == null) return null
  return fromQuadrant(asc, mc, c11, c12, c2, c3)
}

/** Koch (birthplace) houses: trisects the oblique ascension of the MC degree. */
function koch(ramc: number, eps: number, lat: number, asc: number, mc: number): number[] | null {
  const decMC = declOfLon(mc, eps)
  const x = tan(lat) * tan(decMC)
  if (Math.abs(x) >= 1) return null
  const ad = asin(x)
  const oaMC = ramc - ad
  // A cusp is the ecliptic degree rising when its oblique ascension is on the horizon.
  const cuspAt = (oa: number) => computeASC(norm360(oa - 90), eps, lat)
  const d = (90 + ad) / 3 // MC → ASC trisected in oblique ascension
  const e = (90 - ad) / 3 // ASC → IC
  const c11 = cuspAt(oaMC + d)
  const c12 = cuspAt(oaMC + 2 * d)
  const c2 = cuspAt(ramc + 90 + e)
  const c3 = cuspAt(ramc + 90 + 2 * e)
  return fromQuadrant(asc, mc, c11, c12, c2, c3)
}

function fromQuadrant(asc: number, mc: number, c11: number, c12: number, c2: number, c3: number): number[] {
  const ic = norm360(mc + 180)
  const dsc = norm360(asc + 180)
  return [
    asc, c2, c3, ic,
    norm360(c11 + 180), norm360(c12 + 180),
    dsc, norm360(c2 + 180), norm360(c3 + 180),
    mc, c11, c12,
  ]
}

function porphyry(asc: number, mc: number): number[] {
  const ic = norm360(mc + 180)
  const q1 = norm360(ic - asc) / 3 // ASC → IC
  const q2 = norm360(asc - mc) / 3 // MC → ASC
  const c2 = norm360(asc + q1)
  const c3 = norm360(asc + 2 * q1)
  const c11 = norm360(mc + q2)
  const c12 = norm360(mc + 2 * q2)
  return fromQuadrant(asc, mc, c11, c12, c2, c3)
}

export interface HouseResult {
  cusps: number[]
  system: HouseSystem
  fallback: boolean
}

export function computeHouses(system: HouseSystem, ramc: number, eps: number, lat: number): HouseResult & { asc: number; mc: number } {
  const asc = computeASC(ramc, eps, lat)
  const mc = computeMC(ramc, eps)
  let cusps: number[] | null = null
  let used = system
  if (system === 'placidus') cusps = placidus(ramc, eps, lat, asc, mc)
  else if (system === 'koch') cusps = koch(ramc, eps, lat, asc, mc)
  else if (system === 'porphyry') cusps = porphyry(asc, mc)
  else if (system === 'equal') cusps = Array.from({ length: 12 }, (_, i) => norm360(asc + 30 * i))
  else if (system === 'whole') {
    const start = Math.floor(asc / 30) * 30
    cusps = Array.from({ length: 12 }, (_, i) => norm360(start + 30 * i))
  }
  let fallback = false
  if (!cusps) {
    cusps = porphyry(asc, mc)
    used = 'porphyry'
    fallback = true
  }
  return { cusps, system: used, fallback, asc, mc }
}

/** House (1..12) containing a given longitude. */
export function houseOf(lon: number, cusps: number[]): number {
  const l = norm360(lon)
  for (let i = 0; i < 12; i++) {
    const a = cusps[i]
    const b = cusps[(i + 1) % 12]
    const span = norm360(b - a)
    if (norm360(l - a) < span) return i + 1
  }
  return 1
}
