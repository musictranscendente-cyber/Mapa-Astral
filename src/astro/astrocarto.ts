import * as A from 'astronomy-engine'
import type { Chart } from './chart'
import type { PlanetKey } from './constants'

/**
 * Astrocartography: where on Earth each planet was rising (AC), culminating (MC),
 * setting (DC) or at the lower meridian (IC) at the moment of birth.
 */

export type AngleKey = 'AC' | 'MC' | 'DC' | 'IC'
export const ACG_PLANETS: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

export interface AcgLine {
  planet: PlanetKey
  angle: AngleKey
  /** Polyline segments of [longitude, latitude] (split at the ±180° seam). */
  segments: [number, number][][]
}

const rad = Math.PI / 180
const wrap180 = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180

/** Apparent right ascension / declination (degrees) from the chart's ecliptic position. */
function equatorial(lon: number, lat: number, eps: number) {
  const l = lon * rad, b = lat * rad, e = eps * rad
  const ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)) / rad
  const dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)) / rad
  return { ra: (ra + 360) % 360, dec }
}

function splitSeams(points: [number, number][]): [number, number][][] {
  const out: [number, number][][] = []
  let cur: [number, number][] = []
  for (const p of points) {
    if (cur.length && Math.abs(p[0] - cur[cur.length - 1][0]) > 180) { out.push(cur); cur = [] }
    cur.push(p)
  }
  if (cur.length > 1) out.push(cur)
  return out.filter((s) => s.length > 1)
}

export function astroLines(natal: Chart, planets = ACG_PLANETS, maxLat = 78): AcgLine[] {
  const gst = A.SiderealTime(natal.date) * 15 // Greenwich apparent sidereal time, degrees
  const lines: AcgLine[] = []
  for (const k of planets) {
    const { ra, dec } = equatorial(natal.points[k].lon, natal.points[k].lat, natal.obliquity)
    const mc = wrap180(ra - gst)
    const meridian = (lon: number): [number, number][] => [[lon, -maxLat], [lon, maxLat]]
    lines.push({ planet: k, angle: 'MC', segments: [meridian(mc)] })
    lines.push({ planet: k, angle: 'IC', segments: [meridian(wrap180(mc + 180))] })
    const rise: [number, number][] = []
    const set: [number, number][] = []
    for (let lat = -maxLat; lat <= maxLat; lat += 0.5) {
      const c = -Math.tan(lat * rad) * Math.tan(dec * rad)
      if (c < -1 || c > 1) continue
      const h0 = Math.acos(c) / rad
      rise.push([wrap180(ra - h0 - gst), lat])
      set.push([wrap180(ra + h0 - gst), lat])
    }
    lines.push({ planet: k, angle: 'AC', segments: splitSeams(rise) })
    lines.push({ planet: k, angle: 'DC', segments: splitSeams(set) })
  }
  return lines
}

/** Approximate distance (km) from a place to the nearest point of a line. */
export function distanceToLine(line: AcgLine, lon: number, lat: number): number {
  let best = Infinity
  for (const seg of line.segments) {
    const pts = seg.length === 2 && seg[0][0] === seg[1][0] ? [[seg[0][0], lat] as [number, number]] : seg
    for (const [x, y] of pts) {
      const dLon = Math.abs(wrap180(x - lon)) * Math.cos(((y + lat) / 2) * rad)
      const d = Math.hypot(dLon, y - lat) * 111.2
      if (d < best) best = d
    }
  }
  return best
}
